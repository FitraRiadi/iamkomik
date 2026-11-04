# IamKomik

A Pinterest-inspired comic and anime reader with a masonry-first interface, an immersive chapter reader, anonymous collections, reading analytics, and offline support.

IamKomik is a full-stack portfolio project: a React single-page app talking to a Django REST API that proxies and caches content from the public [Sanka API](https://github.com/SankaVollereii/Rest-Api-Anime-and-Comic).

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Django](https://img.shields.io/badge/Django-6-092E20?style=flat-square&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql&logoColor=white)

## Overview

- **No sign-up required.** Each browser gets an anonymous reader ID and its own favorites, reading history, and statistics.
- **Image-first browsing.** Masonry grids, editorial highlights, genre shortcuts, and continue-reading cards keep discovery fast.
- **Made for actual reading.** A distraction-free reader remembers your progress and supports keyboard chapter navigation.
- **Installable.** A custom service worker precaches the application shell and keeps previously visited images available offline.

## Features

### Comics

- Pinterest-style home page with trending and latest-update masonry grids.
- Search by title, browse by genre, and shuffle the current results.
- Comic detail page with synopsis, metadata, chapter search, sorting, and similar titles.
- Immersive reader with scroll progress, previous/next chapter navigation, and automatic history saving.
- Anonymous favorites and a personal library with a portable reader ID.

### Anime

- Ongoing and completed anime collections.
- Anime search, detail pages, episode lists, embedded players, mirror servers, and download links.
- Graceful fallback when a third-party player cannot be embedded.

### Experience

- Responsive desktop and mobile layouts with a floating mobile dock.
- Light and dark themes with accessible chart labels.
- Animated hero collage, rotating anime highlight backdrops, and an auto-advancing editor carousel.
- Claymorphism-style controls, compact 5px card corners, and reduced-motion-friendly framer-motion transitions.
- PWA manifest, install prompt, offline app shell, and app-shell caching.
- Reading dashboard powered by Tremor: KPIs, activity chart, top genres, type distribution, weekly goal, and recent activity.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router |
| Styling | Tailwind CSS, shadcn/ui patterns, Radix UI, Lucide, Tremor, Framer Motion |
| Data fetching | Axios with a small typed query hook |
| Backend | Django, Django REST Framework, django-cors-headers |
| Database | PostgreSQL |
| PWA | Web App Manifest, custom service worker generated at build time |
| Package manager | pnpm |
| Python environment | `venv` |

## Architecture

```text
Browser
  │
  ├─ React SPA (Vite, port 5173 / 4173)
  │     │
  │     └─ /api/*  ──proxy──►  Django REST API (127.0.0.1:8010)
  │                                │
  │                                ├─ PostgreSQL (readers, favorites, history, activity)
  │                                └─ Sanka API (comics, chapters, anime, episodes)
  │
  └─ Service worker (production build only)
        ├─ precached app shell
        ├─ cache-first images and assets
        └─ network-only /api requests
```

## Project Structure

```text
iamkomik/
├─ backend/                     Django API
│  ├─ config/                   settings, URLs, WSGI
│  ├─ core/                     models, views, serializers, upstream service, admin
│  ├─ .env.example              environment template
│  ├─ requirements.txt
│  └─ manage.py
├─ frontend/                    Vite React app
│  ├─ public/                   manifest, icons, static assets
│  ├─ scripts/                  PWA icon generation and local screenshots
│  ├─ src/
│  │  ├─ components/            layout, cards, UI primitives, PWA helpers
│  │  ├─ hooks/                 API query and library context
│  │  ├─ lib/                   API client, types, formatting, reader ID
│  │  └─ pages/                 home, explore, comic, reader, library, anime, dashboard
│  ├─ pwa-sw.template.js        service worker template
│  ├─ tailwind.config.js
│  └─ vite.config.ts            dev/preview proxy and service worker emission
└─ .gitignore
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- Python 3.12 or newer
- PostgreSQL 16 or newer (18 is used in development)

### 1. Clone the repository

```bash
git clone https://github.com/FitraRiadi/iamkomik.git
cd iamkomik
```

### 2. Configure and run the backend

Create a virtual environment and install dependencies:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

On macOS or Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Create the environment file and fill in your local database credentials:

```powershell
Copy-Item .env.example .env
```

```bash
cp .env.example .env
```

Create the PostgreSQL database (only once), then run migrations:

```powershell
createdb -U postgres iamkomik
python manage.py migrate
python manage.py createsuperuser   # optional, enables /admin
python manage.py runserver 127.0.0.1:8010
```

The API is available at `http://127.0.0.1:8010/api/health/`.

### 3. Run the frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://127.0.0.1:8010`.

### 4. Build and test the PWA

The service worker is generated only for production builds:

```bash
cd frontend
pnpm build
pnpm preview --host 127.0.0.1
```

Open `http://127.0.0.1:4173`.

> PWA installation requires a secure context. `localhost` and `127.0.0.1` work during development; production deployments need HTTPS. Make sure `/sw.js`, `/manifest.webmanifest`, and `/icons/*` are publicly reachable.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust the values. Never commit `.env`.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DJANGO_SECRET_KEY` | Yes | dev fallback | Django signing key |
| `DJANGO_DEBUG` | No | `True` | Debug mode; disable in production |
| `DJANGO_ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `POSTGRES_DB` | Yes | `iamkomik` | Database name |
| `POSTGRES_USER` | Yes | `postgres` | Database user |
| `POSTGRES_PASSWORD` | Yes | empty | Database password |
| `POSTGRES_HOST` | No | `127.0.0.1` | Database host |
| `POSTGRES_PORT` | No | `5432` | Database port |
| `SANKAA_API_BASE` | No | `https://www.sankavollerei.web.id` | Upstream content API |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173` | Allowed browser origins |

The frontend uses relative `/api` requests and does not require its own environment file.

## API Reference

All read endpoints accept an optional `X-Reader-Id` header. The frontend stores this ID in `localStorage` and sends it automatically.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health/` | Service health check |
| `GET` | `/api/home/` | Trending, latest, genres, and editor spotlight |
| `GET` | `/api/comics/trending/` | Trending comics |
| `GET` | `/api/comics/latest/` | Recently updated comics |
| `GET` | `/api/comics/genres/` | Available genres |
| `GET` | `/api/comics/genre/<slug>/` | Comics in a genre |
| `GET` | `/api/comics/search/?q=` | Comic search |
| `GET` | `/api/comics/<slug>/` | Comic detail and chapter list |
| `GET` | `/api/chapters/<chapter_slug>/` | Chapter images and navigation |
| `GET` | `/api/library/` | Anonymous favorites and history |
| `POST` | `/api/favorites/toggle/` | Add or remove a favorite |
| `POST` | `/api/history/` | Save reading progress |
| `GET` | `/api/stats/` | Aggregated reading statistics |
| `GET` | `/api/anime/home/` | Ongoing and completed anime |
| `GET` | `/api/anime/<anime_id>/` | Anime detail and episodes |
| `GET` | `/api/anime/episode/<episode_id>/` | Stream and download sources |
| `GET` | `/api/anime/server/<server_id>/` | Resolve a mirror server URL |

## PWA and Offline Behavior

- The service worker precaches the app shell, manifest, icons, and hashed Vite assets.
- Images and chapter assets are cached cache-first after they are viewed.
- `/api/` requests stay network-only so library data and statistics are never stale.
- The install prompt appears when the browser reports installability. On iOS, use **Share → Add to Home Screen**.
- The mobile dock respects `env(safe-area-inset-bottom)` so it clears the home indicator on modern phones.

Regenerate the PWA icon set after changing the brand mark:

```bash
cd frontend
node scripts/generate-pwa-icons.mjs
```

## Useful Commands

### Frontend

```bash
pnpm dev       # development server with HMR
pnpm build     # type-check and create a production build
pnpm lint      # run Oxlint
pnpm preview   # serve the production build locally
```

### Backend

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8010
```

## Notes and Troubleshooting

- The backend intentionally runs on port **8010** to avoid conflicts with other local projects. If you change it, update `frontend/vite.config.ts`.
- Some images, iframes, or CDN assets block hotlinking. Readers use `referrerPolicy="no-referrer"`; if an embedded player still fails, use the **Open player in a new tab** action.
- The upstream API is rate-limited. The backend caches expensive responses in memory for five minutes; restarting the API clears that cache.
- Favorites and history are tied to the anonymous reader ID. Use **Copy ID** on the Library page to move a collection to another browser.
- Django admin exposes `Reader`, `Favorite`, `ReadingProgress`, and `ActivityEvent` models at `/admin`.
- The service worker runs only in production/preview builds, so HMR is never blocked by a stale app shell.

## Credits

- Content and metadata are provided by the public [Sanka API](https://github.com/SankaVollereii/Rest-Api-Anime-and-Comic). All comic and anime assets belong to their respective owners.
- Built by [Fitra Riadi](https://github.com/FitraRiadi).

## Disclaimer

IamKomik is an educational and portfolio project. It does not host or own the comics, anime, images, or video streams displayed by the upstream API. Use it responsibly and respect the rights of content owners.
