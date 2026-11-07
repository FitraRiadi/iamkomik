from django.conf import settings
from django.db import models
from django.utils import timezone


class Reader(models.Model):
    """Identitas baca. Bisa anonim per perangkat atau terhubung ke akun."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reader",
    )
    token = models.CharField(max_length=64, unique=True)
    display_name = models.CharField(max_length=80, blank=True, default="")
    avatar = models.TextField(blank=True, default="")  # shortcut: data URL, pindah ke object storage kalau avatar membesar
    weekly_goal = models.PositiveSmallIntegerField(default=10)
    preferred_genres = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-last_seen_at"]

    def __str__(self):
        return self.display_name or self.token[:12]


class Favorite(models.Model):
    reader = models.ForeignKey(Reader, on_delete=models.CASCADE, related_name="favorites")
    comic_slug = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    image = models.URLField(max_length=1000, blank=True, default="")
    comic_type = models.CharField(max_length=40, blank=True, default="")
    genre = models.CharField(max_length=120, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["reader", "comic_slug"], name="unique_favorite_per_reader")
        ]

    def __str__(self):
        return self.title


class ReadingProgress(models.Model):
    reader = models.ForeignKey(Reader, on_delete=models.CASCADE, related_name="history")
    comic_slug = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    image = models.URLField(max_length=1000, blank=True, default="")
    comic_type = models.CharField(max_length=40, blank=True, default="")
    genre = models.CharField(max_length=120, blank=True, default="")
    chapter_slug = models.CharField(max_length=255)
    chapter_name = models.CharField(max_length=120, blank=True, default="")
    chapter_index = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["reader", "comic_slug"], name="unique_progress_per_reader")
        ]

    def __str__(self):
        return f"{self.title} - {self.chapter_name}"


class ActivityEvent(models.Model):
    class EventType(models.TextChoices):
        HOME_VIEW = "home_view", "Home view"
        COMIC_VIEW = "comic_view", "Comic view"
        CHAPTER_READ = "chapter_read", "Chapter read"
        SEARCH = "search", "Search"
        FAVORITE = "favorite", "Favorite"
        ANIME_VIEW = "anime_view", "Anime view"

    reader = models.ForeignKey(
        Reader, on_delete=models.SET_NULL, null=True, blank=True, related_name="events"
    )
    event_type = models.CharField(max_length=32, choices=EventType.choices)
    comic_slug = models.CharField(max_length=255, blank=True, default="")
    title = models.CharField(max_length=255, blank=True, default="")
    query = models.CharField(max_length=255, blank=True, default="")
    genre = models.CharField(max_length=120, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["event_type", "created_at"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.event_type} · {self.title or self.comic_slug or self.query}"
