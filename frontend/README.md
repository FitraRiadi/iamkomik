# IamKomik Frontend

React + TypeScript + Vite client for IamKomik. See the [root README](../README.md) for the full project documentation, setup instructions, and API reference.

## Local development

```bash
pnpm install
pnpm dev
```

The Vite dev server runs on `http://localhost:5187` and proxies `/api` to the Django backend at `http://127.0.0.1:8123`.

These ports are intentionally non-default so IamKomik can run alongside other local projects. `strictPort` is enabled, so Vite fails instead of silently moving to another port.

## Production build

```bash
pnpm build
pnpm preview
```

The preview server runs on `http://127.0.0.1:4187`. The service worker is generated only for production builds.

## Environment

Local development uses the Vite proxy and does not need an environment file. For a deployed frontend, copy `.env.production.example` into the Vercel project environment and set `VITE_API_BASE_URL` to the public Django API URL (including `/api`).
