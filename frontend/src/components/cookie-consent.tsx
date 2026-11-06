import * as React from "react"
import { Cookie, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { hasCookieConsent, saveCookieConsent } from "@/lib/site-prompts"

export function CookieConsent() {
  const { t } = useI18n()
  const [visible, setVisible] = React.useState(() => !hasCookieConsent())

  if (!visible) return null

  const choose = (value: "accepted" | "rejected") => {
    setVisible(false)
    saveCookieConsent(value)
  }

  return (
    <section
      aria-labelledby="cookie-consent-title"
      className="pointer-events-auto w-full rounded-[5px] border border-border/70 bg-card p-4 shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-foreground">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p id="cookie-consent-title" className="text-sm font-bold leading-tight">
            {t("Kami memakai cookie")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t(
              "Cookie dan penyimpanan lokal menjaga sesi masuk, tema, dan preferensi Anda. Cookie penting tetap aktif.",
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-11 px-4"
              onClick={() => choose("accepted")}
            >
              {t("Terima")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-11 px-4"
              onClick={() => choose("rejected")}
            >
              {t("Tolak")}
            </Button>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("Tutup pemberitahuan cookie")}
          onClick={() => choose("rejected")}
          className="-mr-1 -mt-1 h-11 w-11 shrink-0 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
