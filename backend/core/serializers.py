from rest_framework import serializers

from .models import ActivityEvent, Favorite, ReadingProgress


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["comic_slug", "title", "image", "comic_type", "genre", "created_at"]


class ReadingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = [
            "comic_slug",
            "title",
            "image",
            "comic_type",
            "genre",
            "chapter_slug",
            "chapter_name",
            "chapter_index",
            "updated_at",
        ]


class ActivityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityEvent
        fields = ["event_type", "comic_slug", "title", "query", "genre", "created_at"]
