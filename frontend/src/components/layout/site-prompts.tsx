import * as React from "react"

import { CookieConsent } from "@/components/cookie-consent"
import { LoginPrompt } from "@/components/login-prompt"
import { PwaInstall } from "@/components/pwa-install"
import { useAuth } from "@/lib/auth"
import {
  hasCookieConsent,
  PROMPT_CHANGE_EVENT,
  wasLoginPromptDismissed,
} from "@/lib/site-prompts"

export function SitePrompts() {
  const { user, loading } = useAuth()
  const [cookieDone, setCookieDone] = React.useState(hasCookieConsent)
  const [loginDismissed, setLoginDismissed] = React.useState(wasLoginPromptDismissed)

  React.useEffect(() => {
    const update = () => {
      setCookieDone(hasCookieConsent())
      setLoginDismissed(wasLoginPromptDismissed())
    }
    window.addEventListener(PROMPT_CHANGE_EVENT, update)
    return () => window.removeEventListener(PROMPT_CHANGE_EVENT, update)
  }, [])

  const showLogin = cookieDone && !loading && !user && !loginDismissed
  const showInstall = cookieDone && !loading && !showLogin

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-stretch gap-2.5 md:inset-x-auto md:bottom-6 md:right-6 md:w-[360px]">
      <PwaInstall hidden={!showInstall} />
      {showLogin ? <LoginPrompt /> : null}
      {!cookieDone ? <CookieConsent /> : null}
    </div>
  )
}
