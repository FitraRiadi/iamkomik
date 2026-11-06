import { Link } from "react-router-dom"
import { ArrowLeft, Compass, Ghost } from "lucide-react"

import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function NotFoundPage() {
  const { t } = useI18n()

  return (
    <PageTransition>
      <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <span className="font-display text-[120px] font-extrabold leading-none tracking-tighter text-primary/10 sm:text-[180px]">
            404
          </span>
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-card text-primary shadow-float">
            <Ghost className="h-7 w-7" />
          </span>
        </div>
        <h1 className="headline mt-2 text-3xl">{t("Halaman ini tidak ditemukan.")}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("Tautan mungkin salah, atau chapter yang Anda cari telah dipindahkan. Kembali ke beranda; masih banyak komik lain.")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {t("Kembali ke beranda")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/jelajah">
              <Compass className="h-4 w-4" />
              {t("Jelajah komik")}
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
