import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const dirname = path.dirname(fileURLToPath(import.meta.url))
const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:8123",
    changeOrigin: true,
  },
}

/**
 * Emit a service worker with a build-specific cache version and the hashed
 * Vite bundle in its precache list. This keeps the installed app usable offline
 * even on the first visit.
 */
function pwaServiceWorker(): Plugin {
  return {
    name: "iamkomik-pwa-service-worker",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle)
        .filter((fileName) => fileName.startsWith("assets/"))
        .map((fileName) => `/${fileName}`)
      const precache = [
        "/",
        "/index.html",
        "/manifest.webmanifest",
        "/favicon.svg",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/icons/icon-maskable-512.png",
        "/apple-touch-icon.png",
        ...assets,
      ]
      const template = fs.readFileSync(path.resolve(dirname, "pwa-sw.template.js"), "utf8")
      const source = template
        .replace("__BUILD_VERSION__", Date.now().toString())
        .replace("__PRECACHE_ASSETS__", JSON.stringify(precache))
      this.emitFile({ type: "asset", fileName: "sw.js", source })
    },
  }
}

export default defineConfig({
  plugins: [react(), pwaServiceWorker()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5187,
    strictPort: true,
    proxy: apiProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 4187,
    strictPort: true,
    proxy: apiProxy,
  },
})
