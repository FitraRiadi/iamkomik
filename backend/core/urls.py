from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    # accounts
    path("auth/register/", views.register, name="register"),
    path("auth/login/", views.login, name="login"),
    path("auth/google/", views.google_login, name="google-login"),
    path("auth/logout/", views.logout, name="logout"),
    path("auth/me/", views.me, name="me"),
    path("auth/profile/", views.profile, name="profile"),
    # discovery
    path("home/", views.home, name="home"),
    path("comics/trending/", views.trending, name="trending"),
    path("comics/latest/", views.latest, name="latest"),
    path("comics/genres/", views.genres, name="genres"),
    path("comics/genre/<str:genre>/", views.genre_detail, name="genre-detail"),
    path("comics/search/", views.search, name="search"),
    path("comics/<str:slug>/", views.comic_detail, name="comic-detail"),
    path("chapters/<str:chapter_slug>/", views.chapter_detail, name="chapter-detail"),
    # library
    path("library/", views.library, name="library"),
    path("favorites/", views.favorites, name="favorites"),
    path("favorites/toggle/", views.toggle_favorite, name="favorite-toggle"),
    path("favorites/<str:slug>/", views.remove_favorite, name="favorite-remove"),
    path("history/", views.save_history, name="history-save"),
    path("history/<str:slug>/", views.remove_history, name="history-remove"),
    # stats
    path("stats/", views.stats, name="stats"),
    # anime
    path("anime/home/", views.anime_home, name="anime-home"),
    path("anime/search/", views.anime_search, name="anime-search"),
    path("anime/episode/<str:episode_id>/", views.anime_episode, name="anime-episode"),
    path("anime/server/<str:server_id>/", views.anime_server, name="anime-server"),
    path("anime/<str:anime_id>/", views.anime_detail, name="anime-detail"),
]
