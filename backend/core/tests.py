from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ActivityEvent


class UpstreamFallbackTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    @patch("core.services._session.get")
    def test_home_uses_browser_payloads_without_network_request(self, upstream_get):
        response = self.client.post(
            "/api/upstream-fallback/",
            {
                "api_path": "/home/",
                "query": {},
                "payloads": [
                    {
                        "path": "/comic/trending",
                        "data": {
                            "trending": [
                                {"title": "Alpha", "link": "/manga/alpha/"}
                            ]
                        },
                    },
                    {
                        "path": "/comic/terbaru",
                        "data": {
                            "comics": [
                                {"title": "Beta", "link": "/manga/beta/"}
                            ]
                        },
                    },
                    {
                        "path": "/comic/genres",
                        "data": {
                            "data": [{"name": "Action", "value": "action"}]
                        },
                    },
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["trending"][0]["slug"], "alpha")
        self.assertEqual(response.json()["latest"][0]["slug"], "beta")
        upstream_get.assert_not_called()

    @patch("core.services._session.get")
    def test_missing_related_payload_is_requested_before_side_effects(
        self, upstream_get
    ):
        detail = {
            "path": "/anime/anime/example",
            "data": {
                "data": {
                    "title": "Example",
                    "genreList": [{"genreId": "action", "title": "Action"}],
                }
            },
        }
        first = self.client.post(
            "/api/upstream-fallback/",
            {"api_path": "/anime/example/", "query": {}, "payloads": [detail]},
            format="json",
        )

        self.assertEqual(first.status_code, 428)
        self.assertEqual(
            first.json()["missing"],
            [{"path": "/anime/genre/action", "params": {}}],
        )
        self.assertEqual(ActivityEvent.objects.count(), 0)

        second = self.client.post(
            "/api/upstream-fallback/",
            {
                "api_path": "/anime/example/",
                "query": {},
                "payloads": [
                    detail,
                    {
                        "path": "/anime/genre/action",
                        "data": {
                            "data": {
                                "animeList": [
                                    {"animeId": "other", "title": "Other"}
                                ]
                            }
                        },
                    },
                ],
            },
            format="json",
        )

        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.json()["related"][0]["id"], "other")
        self.assertEqual(ActivityEvent.objects.count(), 1)
        upstream_get.assert_not_called()

    @patch("core.services._session.get")
    def test_search_forwards_query_to_existing_view(self, upstream_get):
        response = self.client.post(
            "/api/upstream-fallback/",
            {
                "api_path": "/comics/search/",
                "query": {"q": " alpha "},
                "payloads": [
                    {
                        "path": "/comic/search",
                        "params": {"q": "alpha"},
                        "data": {
                            "data": [
                                {"title": "Alpha", "link": "/manga/alpha/"}
                            ]
                        },
                    }
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["query"], "alpha")
        self.assertEqual(response.json()["results"][0]["slug"], "alpha")
        upstream_get.assert_not_called()

    def test_unknown_api_route_is_rejected(self):
        response = self.client.post(
            "/api/upstream-fallback/",
            {"api_path": "/library/", "query": {}, "payloads": []},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
