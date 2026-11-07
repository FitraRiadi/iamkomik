import axios from "axios"

import { getAuthToken } from "./auth-storage"
import { getStoredLanguage, translate } from "./i18n"
import { getReaderId } from "./reader"

const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "")

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 25_000,
})

const sankaBaseURL = "https://www.sankavollerei.web.id"
const retryableUpstreamStatuses = new Set([403, 429, 500, 502, 503, 504])

interface SankaRequest {
  path: string
  params?: Record<string, string>
}

interface SankaPayload extends SankaRequest {
  data: object
}

interface FallbackPlan {
  apiPath: string
  query: Record<string, string>
  requests: SankaRequest[]
}

api.interceptors.request.use((config) => {
  config.headers.set("X-Reader-Id", getReaderId())
  const token = getAuthToken()
  if (token) {
    config.headers.set("Authorization", `Token ${token}`)
  } else {
    config.headers.delete("Authorization")
  }
  return config
})

function fallbackPlan(apiUrl: string, configParams: unknown): FallbackPlan | null {
  let parsed: URL
  try {
    parsed = new URL(apiUrl, "https://iamkomik.local")
  } catch {
    return null
  }

  let apiPath: string
  try {
    apiPath = decodeURIComponent(parsed.pathname)
  } catch {
    return null
  }

  const query = Object.fromEntries(parsed.searchParams.entries())
  if (configParams instanceof URLSearchParams) {
    configParams.forEach((value, key) => {
      query[key] = value
    })
  } else if (configParams && typeof configParams === "object" && !Array.isArray(configParams)) {
    for (const [key, value] of Object.entries(configParams)) {
      if (value !== undefined && value !== null && !Array.isArray(value)) query[key] = String(value)
    }
  }

  const staticPaths: Record<string, string[]> = {
    "/home/": ["/comic/trending", "/comic/terbaru", "/comic/genres"],
    "/comics/trending/": ["/comic/trending"],
    "/comics/latest/": ["/comic/terbaru"],
    "/comics/genres/": ["/comic/genres"],
    "/anime/home/": ["/anime/home"],
    "/anime/genres/": ["/anime/genre"],
  }
  if (staticPaths[apiPath]) {
    return { apiPath, query, requests: staticPaths[apiPath].map((path) => ({ path })) }
  }

  if (apiPath === "/comics/search/") {
    const q = (query.q || "").trim()
    if (q.length < 2) return null
    query.q = q
    return { apiPath, query, requests: [{ path: "/comic/search", params: { q } }] }
  }
  if (apiPath === "/anime/search/") {
    const q = (query.q || "").trim()
    if (q.length < 2) return null
    query.q = q
    return { apiPath, query, requests: [{ path: `/anime/search/${q}` }] }
  }

  const dynamicPaths: Array<[RegExp, string]> = [
    [/^\/comics\/genre\/([^/]+)\/$/, "/comic/genre/"],
    [/^\/comics\/([^/]+)\/$/, "/comic/comic/"],
    [/^\/chapters\/([^/]+)\/$/, "/comic/chapter/"],
    [/^\/anime\/genre\/([^/]+)\/$/, "/anime/genre/"],
    [/^\/anime\/episode\/([^/]+)\/$/, "/anime/episode/"],
    [/^\/anime\/server\/([^/]+)\/$/, "/anime/server/"],
    [/^\/anime\/([^/]+)\/$/, "/anime/anime/"],
  ]
  for (const [pattern, upstreamPrefix] of dynamicPaths) {
    const match = apiPath.match(pattern)
    if (match) return { apiPath, query, requests: [{ path: `${upstreamPrefix}${match[1]}` }] }
  }
  return null
}

function isSankaRequest(value: unknown): value is SankaRequest {
  if (!value || typeof value !== "object") return false
  const request = value as SankaRequest
  if (
    typeof request.path !== "string" ||
    (!request.path.startsWith("/comic/") && !request.path.startsWith("/anime/"))
  ) {
    return false
  }
  return (
    request.params === undefined ||
    (typeof request.params === "object" &&
      request.params !== null &&
      Object.entries(request.params).every(
        ([key, param]) => typeof key === "string" && typeof param === "string",
      ))
  )
}

async function fetchSanka(request: SankaRequest, signal?: AbortSignal): Promise<SankaPayload> {
  const url = new URL(request.path, sankaBaseURL)
  for (const [key, value] of Object.entries(request.params || {})) url.searchParams.set(key, value)
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  })
  if (!response.ok) throw new Error(`Sanka API ${response.status}`)
  const data: unknown = await response.json()
  if (!data || typeof data !== "object") throw new Error("Respons Sanka API tidak valid")
  return { ...request, data }
}

async function browserFallback(
  plan: FallbackPlan,
  signal?: AbortSignal,
) {
  const payloads = new Map<string, SankaPayload>()
  const addRequests = async (requests: SankaRequest[]) => {
    const fresh = requests.filter(
      (request) => !payloads.has(`${request.path}|${JSON.stringify(request.params || {})}`),
    )
    const results = await Promise.all(fresh.map((request) => fetchSanka(request, signal)))
    for (const payload of results) {
      payloads.set(`${payload.path}|${JSON.stringify(payload.params || {})}`, payload)
    }
  }

  await addRequests(plan.requests)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await api.post(
      "/upstream-fallback/",
      {
        api_path: plan.apiPath,
        query: plan.query,
        payloads: [...payloads.values()],
      },
      { signal, validateStatus: () => true },
    )
    if (response.status >= 200 && response.status < 300) return response
    if (response.status !== 428 || attempt === 1) throw new Error("Fallback API gagal")

    const missing = (response.data as { missing?: unknown }).missing
    if (!Array.isArray(missing) || !missing.length || !missing.every(isSankaRequest)) {
      throw new Error("Permintaan fallback tidak valid")
    }
    await addRequests(missing)
  }
  throw new Error("Fallback API gagal")
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.config?.method?.toLowerCase() !== "get") {
      return Promise.reject(error)
    }
    const upstreamStatus = Number(
      (error.response?.data as { upstream_status?: unknown } | undefined)?.upstream_status,
    )
    const plan = fallbackPlan(error.config.url || "", error.config.params)
    if (!retryableUpstreamStatuses.has(upstreamStatus) || !plan) return Promise.reject(error)

    try {
      const response = await browserFallback(plan, error.config.signal as AbortSignal | undefined)
      return { ...response, config: error.config }
    } catch {
      return Promise.reject(error)
    }
  },
)

export function getErrorMessage(error: unknown): string {
  const language = getStoredLanguage()
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string" && detail.trim()) return detail
    if (error.code === "ECONNABORTED") {
      return translate(language, "Waktu permintaan habis. Silakan coba lagi.")
    }
    if (!error.response) {
      return translate(language, "Tidak dapat terhubung ke server. Periksa apakah backend masih berjalan.")
    }
  }
  if (error instanceof Error && error.message) return error.message
  return translate(language, "Terjadi kesalahan. Silakan coba lagi.")
}
