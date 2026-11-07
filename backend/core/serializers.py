from rest_framework import serializers

from .models import ActivityEvent, Comment, Favorite, Playlist, ReadingProgress


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


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "target_type", "target_id", "body", "created_at", "author"]

    def get_author(self, obj):
        user = obj.reader.user
        name = (user.first_name or user.get_username()) if user else obj.reader.display_name
        return {
            "id": user.id if user else None,
            "name": name or "Pembaca",
            "avatar": obj.reader.avatar,
        }


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = [
            "id",
            "name",
            "description",
            "is_public",
            "items",
            "created_at",
            "updated_at",
        ]
