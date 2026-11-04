/* IamKomik service worker — app shell + runtime asset cache. */
const VERSION = "__BUILD_VERSION__"
const PRECACHE_ASSETS = __PRECACHE_ASSETS__
const SHELL_CACHE = `iamkomik-shell-${VERSION}`
const ASSET_CACHE = `iamkomik-assets-${VERSION}`
const IMAGE_CACHE = "iamkomik-images-v1"
const CURRENT_CACHES = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE])
const MAX_ASSET_ENTRIES = 160
const MAX_IMAGE_ENTRIES = 220

const APP_SHELL = [...new Set(PRECACHE_ASSETS)]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.all(
          APP_SHELL.map(async (url) => {
            try {
              const response = await fetch(url, { cache: "reload" })
              if (response.ok) await putInCache(cache, url, response)
            } catch {
              // A missing optional icon should not break installation.
            }
          }),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !CURRENT_CACHES.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // API responses stay network-only so collection/stat data is never stale.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return

  // SPA navigations: network first, fall back to the cached shell for offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            event.waitUntil(
              caches
                .open(SHELL_CACHE)
                .then((cache) => putInCache(cache, "/index.html", copy))
                .catch(() => undefined),
            )
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE)
          return (await cache.match("/index.html")) || (await cache.match("/")) || Response.error()
        }),
    )
    return
  }

  // Comic pages, posters, fonts, and app assets are safe to cache-first.
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_ENTRIES))
    return
  }

  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") ||
      ["style", "script", "font", "manifest"].includes(request.destination))
  ) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, MAX_ASSET_ENTRIES))
    return
  }

  if (url.origin !== self.location.origin && ["style", "font"].includes(request.destination)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, MAX_ASSET_ENTRIES))
  }
})

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  // Precached shell assets live in SHELL_CACHE, so check all caches first.
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response && (response.ok || response.type === "opaque")) {
      await putInCache(cache, request, response.clone())
      await trimCache(cacheName, maxEntries).catch(() => undefined)
    }
    return response
  } catch {
    return cached || Response.error()
  }
}

async function putInCache(cache, request, response) {
  // Some static servers send `Vary: Origin`; module/style requests include an
  // Origin header while the precache fetch does not, which would make
  // cache.match() miss. Strip Vary for readable responses before storing.
  if (response.type === "opaque") {
    await cache.put(request, response)
    return
  }
  const headers = new Headers(response.headers)
  headers.delete("Vary")
  // The body is read decoded, so drop encoding/length headers from the copy.
  headers.delete("Content-Encoding")
  headers.delete("Content-Length")
  const body = await response.blob()
  await cache.put(
    request,
    new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }),
  )
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)))
}
