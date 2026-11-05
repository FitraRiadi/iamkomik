export type FormatLanguage = "id" | "en"

const relativeFormatters: Record<FormatLanguage, Intl.RelativeTimeFormat> = {
  id: new Intl.RelativeTimeFormat("id", { numeric: "auto" }),
  en: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
}

export function formatRelative(iso?: string | null, language: FormatLanguage = "id"): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const relative = relativeFormatters[language]
  const diff = date.getTime() - Date.now()
  const minutes = Math.round(diff / 60_000)
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute")

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, "hour")

  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return relative.format(days, "day")

  return date.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDate(iso?: string | null, language: FormatLanguage = "id"): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatMinutes(minutes: number, language: FormatLanguage = "id"): string {
  if (!minutes) return language === "en" ? "0 min" : "0 menit"
  if (minutes < 60) return `${minutes} ${language === "en" ? "min" : "menit"}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!rest) return `${hours} ${language === "en" ? "hr" : "jam"}`
  return language === "en"
    ? `${hours} hr ${rest} min`
    : `${hours} jam ${rest} mnt`
}

export function truncate(value: string, max = 90): string {
  if (!value) return ""
  return value.length > max ? `${value.slice(0, max).trim()}…` : value
}

export function chapterNumberFromName(name: string): number | null {
  const match = name.replace(",", ".").match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

export function greeting(language: FormatLanguage = "id"): string {
  const hour = new Date().getHours()
  if (language === "en") {
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 19) return "Selamat sore"
  return "Selamat malam"
}
