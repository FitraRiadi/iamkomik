import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("Memuat akun…")}
      </div>
    )
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/masuk?next=${next}`} replace />
  }

  return <>{children}</>
}
