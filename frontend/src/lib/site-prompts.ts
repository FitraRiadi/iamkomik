export const COOKIE_CONSENT_KEY = "iamkomik-cookie-consent"
export const LOGIN_PROMPT_KEY = "iamkomik-login-prompt-dismissed"
export const PROMPT_CHANGE_EVENT = "iamkomik-prompt-change"

export function hasCookieConsent() {
  if (typeof window === "undefined") return false
  try {
    return Boolean(window.localStorage.getItem(COOKIE_CONSENT_KEY))
  } catch {
    return false
  }
}

export function wasLoginPromptDismissed() {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(LOGIN_PROMPT_KEY) === "1"
  } catch {
    return false
  }
}

function notifyPromptChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(PROMPT_CHANGE_EVENT))
}

export function saveCookieConsent(value: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    // The choice lasts for this page view when storage is blocked.
  }
  notifyPromptChange()
}

export function dismissLoginPrompt() {
  try {
    window.sessionStorage.setItem(LOGIN_PROMPT_KEY, "1")
  } catch {
    // sessionStorage can be blocked; hide for this page view only.
  }
  notifyPromptChange()
}
