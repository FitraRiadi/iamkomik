from __future__ import annotations

from collections import Counter
from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import services
from .models import ActivityEvent, Favorite, Reader, ReadingProgress
from .serializers import FavoriteSerializer, ReadingProgressSerializer

READING_MINUTES_PER_CHAPTER = 6


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def get_reader(request, create: bool = True):
    token = (
        request.headers.get("X-Reader-Id")
        or request.query_params.get("reader")
        or ""
    ).strip()
    if not token or not (8 <= len(token) <= 64):
        return None

    reader = Reader.objects.filter(token=token).first()
    if reader is None:
        if not create:
            return None
        reader, _ = Reader.objects.get_or_create(token=token)

    if reader and timezone.now() - reader.last_seen_at > timedelta(minutes=5):
        Reader.objects.filter(pk=reader.pk).update(last_seen_at=timezone.now())
    return reader


def log_event(reader, event_type: str, **kwargs):
    try:
        ActivityEvent.objects.create(reader=reader, event_type=event_type, **kwargs)
    except Exception:  # noqa: BLE001 - logging tidak boleh bikin request gagal
        pass


def upstream_error(exc: services.UpstreamError) -> Response:
    return Response(
        {"detail": exc.message, "upstream_status": exc.status},
        status=exc.status if exc.status in (404, 429, 502, 504) else status.HTTP_502_BAD_GATEWAY,
    )


def split_genres(value: str) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.replace("/", ",").split(",") if part.strip()]


# ---------------------------------------------------------------------------
# Discovery
# ---------------------------------------------------------------------------
@api_view(["GET"])
def home(request):
    try:
        payload = services.get_home()
    except services.UpstreamError as exc:
        return upstream_error(exc)

    payload["generated_at"] = timezone.now().isoformat()
    log_event(get_reader(request), ActivityEvent.EventType.HOME_VIEW)
    return Response(payload)


@api_view(["GET"])
def trending(request):
    try:
        return Response({"results": services.get_trending()})
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def latest(request):
    try:
        return Response({"results": services.get_latest()})
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def genres(request):
    try:
        return Response({"results": services.get_genres()})
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def genre_detail(request, genre: str):
    try:
        results = services.get_genre_comics(genre)
    except services.UpstreamError as exc:
        return upstream_error(exc)
    return Response({"genre": genre, "results": results})


@api_view(["GET"])
def search(request):
    query = (request.query_params.get("q") or "").strip()
    if len(query) < 2:
        return Response(
            {"detail": "Kata kunci minimal 2 karakter.", "results": []},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        results = services.search_comics(query)
    except services.UpstreamError as exc:
        return upstream_error(exc)

    log_event(
        get_reader(request),
        ActivityEvent.EventType.SEARCH,
        query=query[:255],
        metadata={"result_count": len(results)},
    )
    return Response({"query": query, "results": results})


@api_view(["GET"])
def comic_detail(request, slug: str):
    try:
        comic = services.get_comic_detail(slug)
    except services.UpstreamError as exc:
        return upstream_error(exc)

    reader = get_reader(request)
    log_event(
        reader,
        ActivityEvent.EventType.COMIC_VIEW,
        comic_slug=comic["slug"],
        title=comic["title"][:255],
        genre=", ".join(g["name"] for g in comic["genres"])[:120],
    )
    return Response(comic)


@api_view(["GET"])
def chapter_detail(request, chapter_slug: str):
    try:
        chapter = services.get_chapter(chapter_slug)
    except services.UpstreamError as exc:
        return upstream_error(exc)

    comic = None
    try:
        comic = services.get_comic_detail(chapter["comic_slug"])
    except services.UpstreamError:
        comic = None

    chapter["comic"] = (
        {
            "slug": comic["slug"],
            "title": comic["title"],
            "image": comic["image"],
            "type": comic["type"],
            "genres": comic["genres"],
        }
        if comic
        else None
    )

    reader = get_reader(request)
    if reader and comic:
        index = next(
            (
                item["number"]
                for item in comic.get("chapters", [])
                if item["slug"] == chapter_slug
            ),
            None,
        )
        ReadingProgress.objects.update_or_create(
            reader=reader,
            comic_slug=comic["slug"],
            defaults={
                "title": comic["title"][:255],
                "image": comic["image"],
                "comic_type": comic["type"][:40],
                "genre": ", ".join(g["name"] for g in comic["genres"])[:120],
                "chapter_slug": chapter_slug[:255],
                "chapter_name": chapter["chapter_title"][:120],
                "chapter_index": index,
            },
        )

    log_event(
        reader,
        ActivityEvent.EventType.CHAPTER_READ,
        comic_slug=chapter["comic_slug"],
        title=(comic or {}).get("title", chapter.get("manga_title", ""))[:255],
        metadata={
            "chapter_slug": chapter_slug,
            "chapter_name": chapter["chapter_title"],
            "page_count": chapter["page_count"],
        },
    )
    return Response(chapter)


# ---------------------------------------------------------------------------
# Library
# ---------------------------------------------------------------------------
@api_view(["GET"])
def library(request):
    reader = get_reader(request)
    if not reader:
        return Response({"favorites": [], "history": []})
    return Response(
        {
            "favorites": FavoriteSerializer(
                Favorite.objects.filter(reader=reader)[:100], many=True
            ).data,
            "history": ReadingProgressSerializer(
                ReadingProgress.objects.filter(reader=reader)[:100], many=True
            ).data,
        }
    )


@api_view(["GET"])
def favorites(request):
    reader = get_reader(request, create=False)
    if not reader:
        return Response({"results": []})
    return Response(
        {"results": FavoriteSerializer(Favorite.objects.filter(reader=reader), many=True).data}
    )


@api_view(["POST"])
def toggle_favorite(request):
    reader = get_reader(request)
    if not reader:
        return Response(
            {"detail": "Header X-Reader-Id wajib dikirim."}, status=status.HTTP_400_BAD_REQUEST
        )

    slug = (request.data.get("comic_slug") or "").strip()
    if not slug:
        return Response({"detail": "comic_slug wajib diisi."}, status=status.HTTP_400_BAD_REQUEST)

    favorite = Favorite.objects.filter(reader=reader, comic_slug=slug).first()
    if favorite:
        favorite.delete()
        return Response({"saved": False, "comic_slug": slug})

    favorite = Favorite.objects.create(
        reader=reader,
        comic_slug=slug[:255],
        title=(request.data.get("title") or slug)[:255],
        image=(request.data.get("image") or "")[:1000],
        comic_type=(request.data.get("type") or request.data.get("comic_type") or "")[:40],
        genre=(request.data.get("genre") or "")[:120],
    )
    log_event(
        reader,
        ActivityEvent.EventType.FAVORITE,
        comic_slug=favorite.comic_slug,
        title=favorite.title,
        genre=favorite.genre,
    )
    return Response(
        {"saved": True, "favorite": FavoriteSerializer(favorite).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
def remove_favorite(request, slug: str):
    reader = get_reader(request)
    if not reader:
        return Response({"detail": "Reader tidak dikenal."}, status=status.HTTP_400_BAD_REQUEST)
    Favorite.objects.filter(reader=reader, comic_slug=slug).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def save_history(request):
    reader = get_reader(request)
    if not reader:
        return Response(
            {"detail": "Header X-Reader-Id wajib dikirim."}, status=status.HTTP_400_BAD_REQUEST
        )

    slug = (request.data.get("comic_slug") or "").strip()
    chapter_slug = (request.data.get("chapter_slug") or "").strip()
    if not slug or not chapter_slug:
        return Response(
            {"detail": "comic_slug dan chapter_slug wajib diisi."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    progress, _ = ReadingProgress.objects.update_or_create(
        reader=reader,
        comic_slug=slug[:255],
        defaults={
            "title": (request.data.get("title") or slug)[:255],
            "image": (request.data.get("image") or "")[:1000],
            "comic_type": (request.data.get("type") or request.data.get("comic_type") or "")[:40],
            "genre": (request.data.get("genre") or "")[:120],
            "chapter_slug": chapter_slug[:255],
            "chapter_name": (request.data.get("chapter_name") or "")[:120],
            "chapter_index": request.data.get("chapter_index"),
        },
    )
    return Response(ReadingProgressSerializer(progress).data)


@api_view(["DELETE"])
def remove_history(request, slug: str):
    reader = get_reader(request)
    if not reader:
        return Response({"detail": "Reader tidak dikenal."}, status=status.HTTP_400_BAD_REQUEST)
    ReadingProgress.objects.filter(reader=reader, comic_slug=slug).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Dashboard stats
# ---------------------------------------------------------------------------
def empty_stats() -> dict:
    today = timezone.localdate()
    return {
        "totals": {
            "favorites": 0,
            "comics_read": 0,
            "chapters_read": 0,
            "streak_days": 0,
            "reading_minutes": 0,
        },
        "delta_chapters": 0,
        "series": [
            {"date": (today - timedelta(days=i)).strftime("%d %b"), "Dibaca": 0, "Dilihat": 0}
            for i in range(13, -1, -1)
        ],
        "genres": [],
        "types": [],
        "top_comics": [],
        "recent": [],
    }


def compute_streak(dates) -> int:
    if not dates:
        return 0
    day_set = set(dates)
    today = timezone.localdate()
    cursor = today if today in day_set else today - timedelta(days=1)
    streak = 0
    while cursor in day_set:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


@api_view(["GET"])
def stats(request):
    reader = get_reader(request, create=False)
    if not reader:
        return Response(empty_stats())

    now = timezone.now()
    window_start = now - timedelta(days=29)
    events = list(
        ActivityEvent.objects.filter(reader=reader, created_at__gte=window_start).order_by(
            "created_at"
        )
    )
    favorites = list(Favorite.objects.filter(reader=reader))
    history = list(ReadingProgress.objects.filter(reader=reader))

    chapter_events = [e for e in events if e.event_type == ActivityEvent.EventType.CHAPTER_READ]
    view_events = [e for e in events if e.event_type == ActivityEvent.EventType.COMIC_VIEW]

    def local_day(event):
        return timezone.localtime(event.created_at).date()

    reads_by_day = Counter(local_day(e) for e in chapter_events)
    views_by_day = Counter(local_day(e) for e in view_events)

    today = timezone.localdate()
    series = []
    for offset in range(13, -1, -1):
        day = today - timedelta(days=offset)
        series.append(
            {
                "date": day.strftime("%d %b"),
                "Dibaca": reads_by_day.get(day, 0),
                "Dilihat": views_by_day.get(day, 0),
            }
        )

    all_chapter_dates = list(
        ActivityEvent.objects.filter(
            reader=reader, event_type=ActivityEvent.EventType.CHAPTER_READ
        ).values_list("created_at", flat=True)
    )
    streak = compute_streak([timezone.localtime(dt).date() for dt in all_chapter_dates])

    total_chapters = ActivityEvent.objects.filter(
        reader=reader, event_type=ActivityEvent.EventType.CHAPTER_READ
    ).count()

    genre_counter = Counter()
    for item in history:
        genre_counter.update(split_genres(item.genre))
    for item in favorites:
        genre_counter.update(split_genres(item.genre))

    type_counter = Counter()
    for item in history:
        if item.comic_type:
            type_counter[item.comic_type] += 1
    for item in favorites:
        if item.comic_type:
            type_counter[item.comic_type] += 1

    comic_counter = Counter()
    comic_titles = {}
    for event in chapter_events:
        if not event.comic_slug:
            continue
        comic_counter[event.comic_slug] += 1
        comic_titles[event.comic_slug] = event.title or event.comic_slug

    last7 = sum(1 for e in chapter_events if local_day(e) > today - timedelta(days=7))
    prev7 = sum(
        1
        for e in chapter_events
        if today - timedelta(days=14) < local_day(e) <= today - timedelta(days=7)
    )
    if prev7:
        delta = round((last7 - prev7) / prev7 * 100)
    else:
        delta = 100 if last7 else 0

    recent = []
    for event in ActivityEvent.objects.filter(reader=reader)[:10]:
        recent.append(
            {
                "event_type": event.event_type,
                "label": {
                    "chapter_read": "Baca chapter",
                    "comic_view": "Lihat komik",
                    "favorite": "Simpan komik",
                    "search": "Cari komik",
                    "home_view": "Buka beranda",
                    "anime_view": "Lihat anime",
                }.get(event.event_type, event.event_type),
                "title": event.title or event.comic_slug or event.query,
                "comic_slug": event.comic_slug,
                "created_at": event.created_at.isoformat(),
            }
        )

    return Response(
        {
            "totals": {
                "favorites": len(favorites),
                "comics_read": len(history),
                "chapters_read": total_chapters,
                "streak_days": streak,
                "reading_minutes": total_chapters * READING_MINUTES_PER_CHAPTER,
            },
            "delta_chapters": delta,
            "series": series,
            "genres": [
                {"name": name, "value": count}
                for name, count in genre_counter.most_common(6)
            ],
            "types": [
                {"name": name, "value": count} for name, count in type_counter.most_common(5)
            ],
            "top_comics": [
                {"slug": slug, "title": comic_titles.get(slug, slug), "reads": count}
                for slug, count in comic_counter.most_common(5)
            ],
            "recent": recent,
        }
    )


# ---------------------------------------------------------------------------
# Anime
# ---------------------------------------------------------------------------
@api_view(["GET"])
def anime_home(request):
    try:
        return Response(services.get_anime_home())
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def anime_detail(request, anime_id: str):
    try:
        anime = services.get_anime_detail(anime_id)
    except services.UpstreamError as exc:
        return upstream_error(exc)

    log_event(
        get_reader(request),
        ActivityEvent.EventType.ANIME_VIEW,
        title=anime["title"][:255],
        metadata={"anime_id": anime_id},
    )
    return Response(anime)


@api_view(["GET"])
def anime_search(request):
    query = (request.query_params.get("q") or "").strip()
    if len(query) < 2:
        return Response(
            {"detail": "Kata kunci minimal 2 karakter.", "results": []},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        return Response({"query": query, "results": services.search_anime(query)})
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def anime_episode(request, episode_id: str):
    try:
        return Response(services.get_anime_episode(episode_id))
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def anime_server(request, server_id: str):
    try:
        return Response(services.get_anime_server(server_id))
    except services.UpstreamError as exc:
        return upstream_error(exc)


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "iamkomik-api"})
