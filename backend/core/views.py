from __future__ import annotations

import uuid
from collections import Counter
from datetime import timedelta

import requests
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import ActivityEvent, Favorite, Reader, ReadingProgress
from .serializers import FavoriteSerializer, ReadingProgressSerializer

READING_MINUTES_PER_CHAPTER = 6
User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _touch_reader(reader: Reader) -> Reader:
    if reader and timezone.now() - reader.last_seen_at > timedelta(minutes=5):
        Reader.objects.filter(pk=reader.pk).update(last_seen_at=timezone.now())
    return reader


def get_reader(request, create: bool = True):
    user = getattr(request, "user", None)
    if user is None or not getattr(user, "is_authenticated", False):
        return None
    reader = Reader.objects.filter(user=user).first()
    if reader is None and create:
        display_name = (getattr(user, "first_name", "") or user.get_username())[:80]
        reader = Reader.objects.create(
            user=user,
            token=f"user-{uuid.uuid4().hex}",
            display_name=display_name,
        )
    return _touch_reader(reader) if reader else None


def merge_reader(user, anonymous_token: str | None) -> Reader | None:
    """Gabungkan koleksi perangkat anonim ke reader milik akun."""
    token = (anonymous_token or "").strip()
    anonymous = None
    if token and 8 <= len(token) <= 64:
        anonymous = Reader.objects.filter(token=token, user__isnull=True).first()

    target = Reader.objects.filter(user=user).first()

    if target is None and anonymous is not None:
        display_name = (user.first_name or user.get_username())[:80]
        anonymous.user = user
        anonymous.display_name = anonymous.display_name or display_name
        anonymous.save(update_fields=["user", "display_name", "last_seen_at"])
        return anonymous

    if target is None:
        display_name = (user.first_name or user.get_username())[:80]
        return Reader.objects.create(
            user=user,
            token=f"user-{uuid.uuid4().hex}",
            display_name=display_name,
        )

    if anonymous is None or anonymous.pk == target.pk:
        return target

    with transaction.atomic():
        for item in anonymous.favorites.all():
            Favorite.objects.update_or_create(
                reader=target,
                comic_slug=item.comic_slug,
                defaults={
                    "title": item.title,
                    "image": item.image,
                    "comic_type": item.comic_type,
                    "genre": item.genre,
                },
            )
        for item in anonymous.history.all():
            ReadingProgress.objects.update_or_create(
                reader=target,
                comic_slug=item.comic_slug,
                defaults={
                    "title": item.title,
                    "image": item.image,
                    "comic_type": item.comic_type,
                    "genre": item.genre,
                    "chapter_slug": item.chapter_slug,
                    "chapter_name": item.chapter_name,
                    "chapter_index": item.chapter_index,
                },
            )
        ActivityEvent.objects.filter(reader=anonymous).update(reader=target)
        anonymous.delete()
    return target


def user_payload(user) -> dict:
    name = user.first_name or user.get_username()
    avatar = Reader.objects.filter(user=user).values_list("avatar", flat=True).first() or ""
    return {
        "id": user.id,
        "name": name,
        "email": user.email or user.get_username(),
        "avatar": avatar,
    }


def auth_payload(user) -> dict:
    token, _ = Token.objects.get_or_create(user=user)
    return {"token": token.key, "user": user_payload(user)}


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
# Accounts
# ---------------------------------------------------------------------------
@api_view(["POST"])
@authentication_classes([])
def register(request):
    name = (request.data.get("name") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    if len(name) < 2:
        return Response({"detail": "Nama minimal 2 karakter."}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({"detail": "Email wajib diisi."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_email(email)
    except ValidationError:
        return Response({"detail": "Format email tidak valid."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username__iexact=email).exists():
        return Response(
            {"detail": "Email ini sudah terdaftar. Silakan masuk."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        validate_password(password)
    except ValidationError as exc:
        return Response({"detail": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name[:150],
        )
        merge_reader(user, request.headers.get("X-Reader-Id"))
        payload = auth_payload(user)
    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@authentication_classes([])
def login(request):
    identifier = (request.data.get("email") or request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    if not identifier or not password:
        return Response(
            {"detail": "Email dan password wajib diisi."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    username = identifier.lower() if "@" in identifier else identifier
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Email atau password salah."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    merge_reader(user, request.headers.get("X-Reader-Id"))
    return Response(auth_payload(user))


@api_view(["POST"])
@authentication_classes([])
def google_login(request):
    if not settings.GOOGLE_CLIENT_ID:
        return Response(
            {"detail": "Login Google belum dikonfigurasi."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    credential = (request.data.get("credential") or "").strip()
    if not credential:
        return Response({"detail": "Token Google wajib dikirim."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        response = requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": credential},
            timeout=10,
        )
    except requests.RequestException:
        return Response(
            {"detail": "Gagal memverifikasi token Google."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if response.status_code != 200:
        return Response(
            {"detail": "Token Google tidak valid."}, status=status.HTTP_401_UNAUTHORIZED
        )

    payload = response.json()
    if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
        return Response(
            {"detail": "Token Google bukan untuk aplikasi ini."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if str(payload.get("email_verified", "")).lower() != "true":
        return Response(
            {"detail": "Email Google belum terverifikasi."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    email = (payload.get("email") or "").strip().lower()
    if not email:
        return Response({"detail": "Email Google tidak dapat dibaca."}, status=status.HTTP_400_BAD_REQUEST)

    name = (payload.get("name") or payload.get("given_name") or email.split("@")[0])[:150]
    user = User.objects.filter(email__iexact=email).first() or User.objects.filter(
        username__iexact=email
    ).first()

    if user is None:
        user = User.objects.create_user(username=email, email=email, first_name=name)
        user.set_unusable_password()
        user.save(update_fields=["password"])
    else:
        changed = []
        if not user.email:
            user.email = email
            changed.append("email")
        if not user.first_name:
            user.first_name = name
            changed.append("first_name")
        if changed:
            user.save(update_fields=changed)

    merge_reader(user, request.headers.get("X-Reader-Id"))
    return Response(auth_payload(user))


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    reader = get_reader(request)
    if reader is None:
        return Response({"detail": "Reader tidak dikenal."}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PATCH":
        if "name" in request.data:
            name = (request.data.get("name") or "").strip()
            if len(name) < 2:
                return Response(
                    {"detail": "Nama minimal 2 karakter."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            request.user.first_name = name[:150]
            request.user.save(update_fields=["first_name"])
            reader.display_name = name[:80]

        if "avatar" in request.data:
            avatar = request.data.get("avatar") or ""
            if avatar and not (avatar.startswith("data:image/") and ";base64," in avatar):
                return Response(
                    {"detail": "Format avatar tidak didukung."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if len(avatar) > 700_000:
                return Response(
                    {"detail": "Avatar terlalu besar. Maksimal 500 KB."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reader.avatar = avatar

        reader.save(update_fields=["display_name", "avatar"])

    return Response({"user": user_payload(request.user)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    reader = get_reader(request)
    return Response(
        {
            "user": user_payload(request.user),
            "has_reader": reader is not None,
        }
    )


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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def favorites(request):
    reader = get_reader(request, create=False)
    if not reader:
        return Response({"results": []})
    return Response(
        {"results": FavoriteSerializer(Favorite.objects.filter(reader=reader), many=True).data}
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_favorite(request):
    reader = get_reader(request)
    if not reader:
        return Response(
            {"detail": "Silakan masuk terlebih dahulu."}, status=status.HTTP_401_UNAUTHORIZED
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
@permission_classes([IsAuthenticated])
def remove_favorite(request, slug: str):
    reader = get_reader(request)
    if not reader:
        return Response({"detail": "Reader tidak dikenal."}, status=status.HTTP_400_BAD_REQUEST)
    Favorite.objects.filter(reader=reader, comic_slug=slug).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_history(request):
    reader = get_reader(request)
    if not reader:
        return Response(
            {"detail": "Silakan masuk terlebih dahulu."}, status=status.HTTP_401_UNAUTHORIZED
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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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
