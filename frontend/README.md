# IamKomik Frontend

React + TypeScript + Vite client for IamKomik. See the [root README](../README.md) for the full project documentation, setup instructions, and API reference.

## Local development

```bash
pnpm install
pnpm dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` to the Django backend at `http://127.0.0.1:8010`.

## Production build

```bash
pnpm build
pnpm preview --host 127.0.0.1
```

The preview server runs on `http://127.0.0.1:4173`. The service worker is generated only for production builds.
