import axios from "axios"

import { getReaderId } from "./reader"

const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "")

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 25_000,
})

api.interceptors.request.use((config) => {
  config.headers.set("X-Reader-Id", getReaderId())
  return config
})

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string" && detail.trim()) return detail
    if (error.code === "ECONNABORTED") return "Request timeout. Coba lagi ya."
    if (!error.response) return "Gak bisa nyambung ke server. Cek backend lo masih jalan."
  }
  if (error instanceof Error && error.message) return error.message
  return "Ada yang error. Coba lagi sebentar."
}
