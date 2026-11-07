from django.contrib import admin

from .models import ActivityEvent, Favorite, Reader, ReadingProgress


@admin.register(Reader)
class ReaderAdmin(admin.ModelAdmin):
    list_display = ("token", "display_name", "user", "weekly_goal", "created_at", "last_seen_at")
    search_fields = ("token", "display_name", "user__email")
    raw_id_fields = ("user",)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("title", "comic_slug", "reader", "comic_type", "created_at")
    search_fields = ("title", "comic_slug")
    list_filter = ("comic_type",)


@admin.register(ReadingProgress)
class ReadingProgressAdmin(admin.ModelAdmin):
    list_display = ("title", "chapter_name", "reader", "updated_at")
    search_fields = ("title", "comic_slug", "chapter_slug")


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "comic_slug", "reader", "created_at")
    list_filter = ("event_type",)
    search_fields = ("comic_slug", "query")
