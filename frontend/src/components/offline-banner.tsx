import * as React from "react"
import { WifiOff } from "lucide-react"

import { useI18n } from "@/lib/i18n"

export function OfflineBanner() {
  const { t } = useI18n()
  const [online, setOnline] = React.useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  )

  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] font-semibold text-amber-700 dark:text-amber-300"
    >
      <span className="inline-flex items-center gap-1.5">
        <WifiOff className="h-3.5 w-3.5" />
        {t("Mode offline: halaman yang sudah dibuka tetap dapat dibaca; data baru akan dimuat saat kembali online.")}
      </span>
    </div>
  )
}
