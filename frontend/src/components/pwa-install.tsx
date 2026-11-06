import * as React from "react"
import { Download, X } from "lucide-react"

import { useI18n } from "@/lib/i18n"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "iamkomik-pwa-dismissed"

function isStandalone() {
  if (typeof window === "undefined") return false
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigatorWithStandalone.standalone)
  )
}

export function PwaInstall({ hidden = false }: { hidden?: boolean }) {
  const { t } = useI18n()
  const [promptEvent, setPromptEvent] = React.useState<InstallPromptEvent | null>(null)
  const [visible, setVisible] = React.useState(false)
  const [installing, setInstalling] = React.useState(false)

  React.useEffect(() => {
    if (isStandalone()) return
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return
    } catch {
      // localStorage can be blocked in private mode; still allow the prompt.
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
      setVisible(true)
    }
    const onInstalled = () => {
      setVisible(false)
      setPromptEvent(null)
      try {
        window.localStorage.setItem(DISMISS_KEY, "1")
      } catch {
        // noop
      }
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    setInstalling(true)
    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === "accepted") {
        setVisible(false)
        try {
          window.localStorage.setItem(DISMISS_KEY, "1")
        } catch {
          // noop
        }
      }
    } finally {
      setInstalling(false)
      setPromptEvent(null)
    }
  }

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // noop
    }
  }

  if (hidden || !visible) return null

  return (
    <div className="pointer-events-auto w-full rounded-[5px] border border-border/70 bg-card/95 p-3.5 shadow-float backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight">{t("Pasang IamKomik")}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {t("Buka lebih cepat, layar penuh, dan tetap dapat melanjutkan bacaan saat koneksi terputus.")}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void install()}
              disabled={installing}
              className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {installing ? t("Menyiapkan…") : t("Pasang sekarang")}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:text-foreground"
            >
              {t("Nanti")}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("Tutup ajakan pasang aplikasi")}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
