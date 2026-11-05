import axios from "axios"

import { getAuthToken } from "./auth-storage"
import { getStoredLanguage, translate } from "./i18n"
import { getReaderId } from "./reader"

const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "")

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 25_000,
})

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

export function getErrorMessage(error: unknown): string {
  const language = getStoredLanguage()
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string" && detail.trim()) return detail
    if (error.code === "ECONNABORTED") {
      return translate(language, "Request timeout. Coba lagi ya.")
    }
    if (!error.response) {
      return translate(language, "Gak bisa nyambung ke server. Cek backend lo masih jalan.")
    }
  }
  if (error instanceof Error && error.message) return error.message
  return translate(language, "Ada yang error. Coba lagi sebentar.")
}
