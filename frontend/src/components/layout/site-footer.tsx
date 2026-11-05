import { Link } from "react-router-dom"
import { ArrowUpRight, Github, Heart } from "lucide-react"

import { useI18n } from "@/lib/i18n"

const exploreLinks = [
  { label: "Komik trending", href: "/jelajah" },
  { label: "Update terbaru", href: "/jelajah" },
  { label: "Anime ongoing", href: "/anime" },
  { label: "Koleksi gue", href: "/koleksi" },
]

const metaLinks = [
  { label: "Statistik bacaan", href: "/dashboard" },
  { label: "Dokumentasi API", href: "https://www.sankavollerei.web.id/comic", external: true },
  { label: "Repo sumber API", href: "https://github.com/SankaVollereii/Rest-Api-Anime-and-Comic", external: true },
]

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-primary text-primary-foreground">
              <span className="font-display text-[15px] font-extrabold leading-none">ik</span>
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.04em]">
              iamkomik<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("Ruang baca komik & anime dengan tampilan yang gak bikin pusing. Simpan favorit, lanjutin bacaan, dan lihat kebiasaan baca lo dalam satu tempat.")}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-primary" />
            {t("Dibuat untuk tugas & portofolio")}
          </div>
        </div>

        <div>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Jelajahi")}
          </p>
          <ul className="space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Sumber & info")}
          </p>
          <ul className="space-y-2.5">
            {metaLinks.map((link) =>
              link.external ? (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition hover:text-primary"
                  >
                    {t(link.label)}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} IamKomik. {t("Data komik & anime dari Sanka API.")}</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              React + Django + PostgreSQL
            </span>
            <a
              href="https://github.com/SankaVollereii/Rest-Api-Anime-and-Comic"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              API
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
