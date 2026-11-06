import * as React from "react"
import { LogIn, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { dismissLoginPrompt, wasLoginPromptDismissed } from "@/lib/site-prompts"

export function LoginPrompt() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const location = useLocation()
  const [ready, setReady] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(wasLoginPromptDismissed)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  if (!ready || loading || user || dismissed) return null
  if (location.pathname === "/masuk" || location.pathname === "/daftar") return null

  const dismiss = () => {
    setDismissed(true)
    dismissLoginPrompt()
  }

  const next = encodeURIComponent(location.pathname + location.search)

  return (
    <aside
      aria-labelledby="login-prompt-title"
      className="pointer-events-auto w-full rounded-[5px] border border-border/70 bg-card p-4 shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LogIn className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p id="login-prompt-title" className="text-sm font-bold leading-tight">
            {t("Belum masuk")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("Masuk untuk menyimpan koleksi, melanjutkan bacaan, dan membuka statistik Anda.")}
          </p>
          <Button asChild size="sm" className="mt-3 h-11 px-4">
            <Link to={`/masuk?next=${next}`}>{t("Masuk")}</Link>
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("Tutup ajakan masuk")}
          onClick={dismiss}
          className="-mr-1 -mt-1 h-11 w-11 shrink-0 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
