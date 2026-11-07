"""Lapisan akses data ke Sanka API (anime & comic) + normalisasi bentuk data."""
from __future__ import annotations

import hashlib
import json
import logging
import re
from datetime import timedelta
from urllib.parse import urlparse

import requests

try:
    from curl_cffi import requests as curl_requests
except ImportError:  # pragma: no cover - local fallback
    curl_requests = None

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger("core")


def _build_session():
    if curl_requests is not None:
        # Sanka sits behind Cloudflare; a browser TLS fingerprint avoids the bot challenge.
        session = curl_requests.Session(impersonate="chrome")
        session.headers.update(
            {
                "Accept": "application/json",
                "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
                "Referer": "https://iamkomik.vercel.app/",
            }
        )
        return session
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "IamKomik/1.0 (+local development)",
            "Accept": "application/json",
        }
    )
    return session


_session = _build_session()


class UpstreamError(Exception):
    def __init__(self, message: str, status: int = 502):
        super().__init__(message)
        self.message = message
        self.status = status


def api_get(path: str, params: dict | None = None, ttl: int | None = None):
    """GET ke Sanka API dengan cache in-memory sederhana."""
    ttl = settings.SANKAA_CACHE_TTL if ttl is None else ttl
    key = _cache_key(path, params)
    cached = cache.get(key)
    if cached is not None:
        return cached

    url = f"{settings.SANKAA_API_BASE}{path}"
    try:
        response = _session.get(url, params=params, timeout=settings.SANKAA_TIMEOUT)
    except Exception as exc:
        if "timeout" in str(exc).lower():
            raise UpstreamError("Sumber data timeout. Coba lagi sebentar.", 504) from exc
        raise UpstreamError("Tidak bisa menghubungi sumber data.", 502) from exc

    if response.status_code >= 400:
        logger.warning(
            "Upstream %s -> %s cf=%s body=%s",
            url,
            response.status_code,
            response.headers.get("cf-mitigated"),
            response.text[:200].replace("\n", " "),
        )
        raise UpstreamError(
            "Sumber data sedang tidak tersedia untuk permintaan ini.", response.status_code
        )

    try:
        data = response.json()
    except ValueError as exc:
        raise UpstreamError("Format respons sumber data tidak valid.") from exc

    cache.set(key, data, ttl)
    return data


def _cache_key(path: str, params: dict | None) -> str:
    raw = path + "|" + json.dumps(params or {}, sort_keys=True, default=str)
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()
    return f"sanka:{digest}"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
_CHAPTER_RE = re.compile(r"(\d+(?:\.\d+)?)")


def slug_from_link(link: str) -> str:
    if not link:
        return ""
    path = urlparse(link).path if link.startswith("http") else link
    path = path.split("?")[0].rstrip("/")
    return path.rsplit("/", 1)[-1] if path else ""


def chapter_number(value: str | None):
    if not value:
        return None
    match = _CHAPTER_RE.search(value.replace(",", "."))
    if not match:
        return None
    try:
        number = float(match.group(1))
    except ValueError:
        return None
    return int(number) if number.is_integer() else number


def _clean_type(value: str | None) -> str:
    if not value:
        return ""
    return str(value).strip().replace("Komik ", "")


def _join_genres(genres) -> str:
    if not genres:
        return ""
    names = []
    for genre in genres:
        if isinstance(genre, dict):
            name = genre.get("name") or genre.get("title") or genre.get("genre") or ""
        else:
            name = str(genre)
        name = name.strip()
        if name and name not in names:
            names.append(name)
    return ", ".join(names)


def normalize_card(raw: dict, *, source: str = "komiku") -> dict:
    link = raw.get("link") or raw.get("href") or raw.get("url") or ""
    slug = raw.get("slug") or slug_from_link(link)
    image = raw.get("image") or raw.get("thumbnail") or raw.get("cover") or ""
    title = raw.get("title") or raw.get("name") or "Tanpa judul"
    chapter = raw.get("chapter") or raw.get("latestChapter") or ""
    type_ = _clean_type(raw.get("type") or raw.get("comic_type"))
    genre = raw.get("genre") or ""
    return {
        "slug": slug,
        "title": title,
        "image": image,
        "chapter": chapter,
        "type": type_,
        "genre": genre if isinstance(genre, str) else _join_genres(genre),
        "meta": raw.get("time_ago") or raw.get("date") or chapter,
        "status": raw.get("status") or "",
        "rating": raw.get("rating"),
        "source": source,
    }


def _dedupe(cards: list[dict]) -> list[dict]:
    seen = set()
    unique = []
    for card in cards:
        slug = card.get("slug")
        if not slug or slug in seen:
            continue
        seen.add(slug)
        unique.append(card)
    return unique


# ---------------------------------------------------------------------------
# Comics
# ---------------------------------------------------------------------------
def get_genres() -> list[dict]:
    data = api_get("/comic/genres", ttl=60 * 60 * 6)
    items = data.get("data") if isinstance(data, dict) else data
    if not isinstance(items, list):
        return []
    return [
        {"name": item.get("name") or item.get("title"), "slug": item.get("value") or item.get("slug")}
        for item in items
        if isinstance(item, dict)
    ]


def get_trending(limit: int = 24) -> list[dict]:
    data = api_get("/comic/trending")
    items = data.get("trending", []) if isinstance(data, dict) else []
    return _dedupe([normalize_card(item) for item in items])[:limit]


def get_latest(limit: int = 24) -> list[dict]:
    data = api_get("/comic/terbaru")
    items = data.get("comics", []) if isinstance(data, dict) else []
    return _dedupe([normalize_card(item) for item in items])[:limit]


def get_all_comics() -> list[dict]:
    data = api_get("/comic/unlimited", ttl=60 * 60 * 6)
    items = data.get("comics", []) if isinstance(data, dict) else []
    return _dedupe([normalize_card(item) for item in items if isinstance(item, dict)])


def get_home() -> dict:
    trending = get_trending()
    latest = get_latest()
    try:
        genres = get_genres()
    except UpstreamError:
        genres = []
    spotlight = _dedupe(trending[:8] + latest)[:10]
    return {
        "trending": trending,
        "latest": latest,
        "genres": genres,
        "spotlight": spotlight,
    }


def search_comics(query: str) -> list[dict]:
    data = api_get("/comic/search", params={"q": query})
    items = data.get("data", []) if isinstance(data, dict) else []
    cards = []
    for item in items:
        card = normalize_card(item)
        card["description"] = item.get("description", "")
        cards.append(card)
    return _dedupe(cards)


def get_genre_comics(genre: str, limit: int = 40) -> list[dict]:
    data = api_get(f"/comic/genre/{genre}")
    items = data.get("comics", []) if isinstance(data, dict) else []
    cards = [normalize_card(item) for item in items]
    for card in cards:
        card["genre"] = card.get("genre") or genre.title()
    return _dedupe(cards)[:limit]


def get_for_you(genres: list[str], limit: int = 12) -> list[dict]:
    cards = []
    for genre in genres[:3]:
        try:
            cards.extend(get_genre_comics(genre, limit=8))
        except UpstreamError:
            continue
    return _dedupe(cards)[:limit]


def get_comic_detail(slug: str) -> dict:
    data = api_get(f"/comic/comic/{slug}")
    if not isinstance(data, dict) or not data.get("title"):
        raise UpstreamError("Komik tidak ditemukan.", 404)

    metadata = data.get("metadata") or {}
    chapters = []
    for chapter in data.get("chapters") or []:
        name = chapter.get("chapter") or chapter.get("title") or "Chapter"
        chapters.append(
            {
                "name": name,
                "slug": chapter.get("slug") or slug_from_link(chapter.get("link", "")),
                "date": chapter.get("date", ""),
                "number": chapter_number(name),
            }
        )

    genres = data.get("genres") or []
    return {
        "slug": data.get("slug") or slug,
        "title": data.get("title"),
        "title_indonesian": data.get("title_indonesian") or "",
        "image": data.get("image") or "",
        "synopsis": data.get("synopsis") or data.get("synopsis_full") or "",
        "summary": data.get("summary") or "",
        "type": _clean_type(metadata.get("type")),
        "author": metadata.get("author") or "",
        "status": metadata.get("status") or "",
        "concept": metadata.get("concept") or "",
        "age_rating": metadata.get("age_rating") or "",
        "reading_direction": metadata.get("reading_direction") or "",
        "genres": [
            {
                "name": (g.get("name") or g.get("title") or "").strip(),
                "slug": g.get("slug") or "",
            }
            for g in genres
            if isinstance(g, dict)
        ],
        "chapters": chapters,
        "latest_chapter": chapters[0] if chapters else None,
        "similar": _dedupe(
            [normalize_card(item) for item in data.get("similar_manga") or []]
        ),
        "total_chapters": len(chapters),
    }


def get_chapter(chapter_slug: str) -> dict:
    data = api_get(f"/comic/chapter/{chapter_slug}")
    if not isinstance(data, dict) or not data.get("images"):
        raise UpstreamError("Chapter tidak ditemukan.", 404)

    images = [
        url
        for url in data.get("images") or []
        if url and "promosi" not in url.lower() and "promo" not in url.lower()
    ]
    navigation = data.get("navigation") or {}
    comic_slug = navigation.get("chapterList") or ""
    if not comic_slug:
        comic_slug = chapter_slug.rsplit("-chapter-", 1)[0]

    return {
        "comic_slug": comic_slug,
        "manga_title": data.get("manga_title") or "",
        "chapter_title": data.get("chapter_title") or chapter_slug,
        "images": images,
        "previous_chapter": navigation.get("previousChapter"),
        "next_chapter": navigation.get("nextChapter"),
        "page_count": len(images),
    }


def get_chapter_navigation(chapter_slug: str) -> dict:
    data = api_get(f"/comic/chapter/{chapter_slug}/navigation", ttl=600)
    return data if isinstance(data, dict) else {}


# ---------------------------------------------------------------------------
# Anime
# ---------------------------------------------------------------------------
def normalize_anime(raw: dict) -> dict:
    href = raw.get("href") or ""
    return {
        "id": raw.get("animeId") or raw.get("slug") or slug_from_link(href),
        "title": raw.get("title") or "Tanpa judul",
        "poster": raw.get("poster") or raw.get("image") or "",
        "episodes": raw.get("episodes"),
        "release_day": raw.get("releaseDay") or "",
        "latest_release": raw.get("latestReleaseDate") or "",
        "score": raw.get("score") or "",
        "status": raw.get("status") or "",
    }


def get_anime_home() -> dict:
    data = api_get("/anime/home")
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    ongoing = (payload.get("ongoing") or {}).get("animeList") or []
    complete = (payload.get("complete") or {}).get("animeList") or []
    return {
        "ongoing": [normalize_anime(item) for item in ongoing],
        "complete": [normalize_anime(item) for item in complete],
    }


def get_all_anime() -> list[dict]:
    data = api_get("/anime/unlimited", ttl=60 * 60 * 6)
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    groups = payload.get("list") if isinstance(payload, dict) else []
    seen = set()
    cards = []
    for group in groups or []:
        if not isinstance(group, dict):
            continue
        for item in group.get("animeList") or []:
            if not isinstance(item, dict):
                continue
            card = normalize_anime(item)
            if not card["id"] or card["id"] in seen:
                continue
            seen.add(card["id"])
            cards.append(card)
    return cards


def get_anime_genres() -> list[dict]:
    data = api_get("/anime/genre", ttl=60 * 60 * 6)
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    items = payload.get("genreList") if isinstance(payload, dict) else []
    return [
        {"name": item.get("title") or "", "slug": item.get("genreId") or ""}
        for item in items or []
        if isinstance(item, dict) and item.get("title") and item.get("genreId")
    ]


def get_anime_genre(genre: str, limit: int = 30) -> list[dict]:
    data = api_get(f"/anime/genre/{genre}")
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    items = payload.get("animeList") if isinstance(payload, dict) else []
    seen = set()
    cards = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        card = normalize_anime(item)
        if not card["id"] or card["id"] in seen:
            continue
        seen.add(card["id"])
        cards.append(card)
    return cards[:limit]


def get_anime_for_you(genres: list[str], limit: int = 12) -> list[dict]:
    cards = []
    for genre in genres[:2]:
        try:
            cards.extend(get_anime_genre(genre, limit=8))
        except UpstreamError:
            continue
    seen = set()
    unique = []
    for card in cards:
        if not card["id"] or card["id"] in seen:
            continue
        seen.add(card["id"])
        unique.append(card)
    return unique[:limit]


def get_anime_detail(anime_id: str) -> dict:
    data = api_get(f"/anime/anime/{anime_id}")
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    if not payload:
        raise UpstreamError("Anime tidak ditemukan.", 404)

    episodes = []
    for episode in payload.get("episodeList") or []:
        episodes.append(
            {
                "title": episode.get("title") or "",
                "eps": episode.get("eps"),
                "date": episode.get("date") or "",
                "id": episode.get("episodeId") or slug_from_link(episode.get("href", "")),
            }
        )

    synopsis = payload.get("synopsis") or {}
    paragraphs = synopsis.get("paragraphs") if isinstance(synopsis, dict) else []
    if isinstance(paragraphs, list):
        synopsis_text = " ".join(str(p) for p in paragraphs if p)
    else:
        synopsis_text = str(paragraphs or payload.get("synopsis") or "")

    genres = payload.get("genreList") or []
    result = {
        "id": anime_id,
        "title": payload.get("title") or "",
        "poster": payload.get("poster") or "",
        "japanese": payload.get("japanese") or "",
        "score": payload.get("score") or "",
        "producers": payload.get("producers") or "",
        "type": payload.get("type") or "",
        "status": payload.get("status") or "",
        "duration": payload.get("duration") or "",
        "aired": payload.get("aired") or "",
        "studios": payload.get("studios") or "",
        "synopsis": synopsis_text,
        "genres": genres,
        "episodes": episodes,
        "related": [],
    }
    first_genre = next(
        (
            genre.get("genreId")
            for genre in genres
            if isinstance(genre, dict) and genre.get("genreId")
        ),
        "",
    )
    if first_genre:
        try:
            result["related"] = [
                card
                for card in get_anime_genre(first_genre, limit=10)
                if card["id"] != anime_id
            ][:8]
        except UpstreamError:
            pass
    return result


def search_anime(query: str) -> list[dict]:
    data = api_get(f"/anime/search/{query}")
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    items = payload.get("animeList") if isinstance(payload, dict) else payload
    return [normalize_anime(item) for item in items or [] if isinstance(item, dict)]


def get_anime_episode(episode_id: str) -> dict:
    data = api_get(f"/anime/episode/{episode_id}")
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    if not payload:
        raise UpstreamError("Episode tidak ditemukan.", 404)

    server = payload.get("server") or {}
    downloads = payload.get("downloadUrl") or {}
    return {
        "title": payload.get("title") or "",
        "anime_id": payload.get("animeId") or "",
        "release_time": payload.get("releaseTime") or "",
        "default_streaming_url": payload.get("defaultStreamingUrl") or "",
        "streams": server.get("qualities") or [],
        "downloads": downloads.get("qualities") or [],
        "prev": payload.get("prevEpisode") or None,
        "next": payload.get("nextEpisode") or None,
        "info": payload.get("info") or {},
    }


def get_anime_server(server_id: str) -> dict:
    data = api_get(f"/anime/server/{server_id}", ttl=600)
    payload = data.get("data", {}) if isinstance(data, dict) else {}
    url = payload.get("url") if isinstance(payload, dict) else ""
    if not url:
        raise UpstreamError("Server streaming tidak tersedia.", 404)
    return {"url": url}
