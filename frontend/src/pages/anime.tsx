import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Clapperboard, RefreshCw, Search, Sparkles } from "lucide-react"

import { AnimeCard } from "@/pages/anime-card"
import { EmptyState } from "@/components/empty-state"
import { AnimeHighlightBackdrop } from "@/components/highlight-backdrop"
import { PageTransition } from "@/components/page-transition"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useI18n } from "@/lib/i18n"
import type { AnimeCard as AnimeCardType, AnimeHomePayload } from "@/lib/types"

interface AnimeSearchPayload {
  results: AnimeCardType[]
}

export function AnimePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [query, setQuery] = React.useState("")
  const [debounced, setDebounced] = React.useState("")

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 400)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data, loading, error, refetch } = useApiQuery<AnimeHomePayload>("/anime/home/")
  const search = useApiQuery<AnimeSearchPayload>(
    debounced.length >= 2 ? `/anime/search/?q=${encodeURIComponent(debounced)}` : null,
  )

  const searching = debounced.length >= 2
  const results = search.data?.results ?? []
  const posters = React.useMemo(
    () =>
      [...(data?.ongoing ?? []), ...(data?.complete ?? [])]
        .map((anime) => anime.poster)
        .filter(Boolean),
    [data],
  )

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (query.trim().length < 2) return
    setDebounced(query.trim())
  }

  return (
    <PageTransition>
      <div className="relative isolate">
        <AnimeHighlightBackdrop posters={posters} />
        <div className="container pt-10">
        <section className="relative overflow-hidden rounded-[5px] border border-border/60 bg-[#0b0a09] px-6 py-10 text-white sm:px-10">
          {data?.ongoing?.[0]?.poster ? (
            <img
              src={data.ongoing[0].poster}
              alt=""
              aria-hidden
              referrerPolicy="no-referrer"
              className="absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-top opacity-35 sm:block"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0a09] via-[#0b0a09]/90 to-[#0b0a09]/30" />
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <Badge variant="glass" className="border-white/20 bg-white/10 text-white">
              <Clapperboard className="h-3 w-3" />
              Anime
            </Badge>
            <h1 className="headline mt-4 text-4xl text-balance text-white sm:text-5xl">
              {t("Anime sedang tayang, tamat, hingga yang sedang populer.")}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70">
              {t("Cari judul, lihat episode, dan tonton langsung dari sumbernya. Semua dalam satu tempat.")}
            </p>

            <form
              onSubmit={submit}
              className="mt-6 flex max-w-xl items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 pl-4 backdrop-blur"
            >
              <Search className="h-[18px] w-[18px] shrink-0 text-white/60" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Cari anime…")}
                className="h-10 w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/50"
              />
              <Button type="submit" size="sm" className="h-10 shrink-0 bg-white px-5 text-black hover:bg-white/90">
                {t("Cari")}
              </Button>
            </form>
          </div>
        </section>

        {searching ? (
          <section className="py-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">{t("Pencarian")}</p>
                <h2 className="headline mt-1 text-2xl">
                  {t("Hasil untuk “{query}”", { query: debounced })}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setDebounced("") }}>
                {t("Atur ulang")}
              </Button>
            </div>
            {search.loading ? (
              <AnimeGridSkeleton />
            ) : results.length === 0 ? (
              <EmptyState
                icon={Search}
                title={t("Anime tidak ditemukan")}
                description={t("Coba kata kunci lain, atau kembali ke daftar anime yang sedang tayang.")}
                actionLabel={t("Kembali ke anime")}
                actionHref="/anime"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {results.map((anime, index) => (
                  <AnimeCard key={anime.id} anime={anime} index={index} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="py-10">
              <SectionHeading
                eyebrow={t("Sedang tayang")}
                title={t("Anime sedang tayang")}
                description={t("Episode terbaru dari sumber yang tersedia.")}
                actionLabel={t("Cari anime")}
                actionHref="/anime"
              />
              {loading ? (
                <AnimeGridSkeleton />
              ) : error ? (
                <EmptyState
                  icon={RefreshCw}
                  title={t("Gagal mengambil data anime")}
                  description={error}
                  actionLabel={t("Coba lagi")}
                  actionHref="/anime"
                >
                  <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("Muat ulang")}
                  </Button>
                </EmptyState>
              ) : (data?.ongoing ?? []).length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title={t("Belum ada anime yang sedang tayang")}
                  description={t("Sumber sedang kosong. Silakan periksa kembali nanti.")}
                  actionLabel={t("Kembali ke beranda")}
                  actionHref="/"
                />
              ) : (
                <div className="no-scrollbar -mx-1 flex snap-x gap-3.5 overflow-x-auto px-1 pb-2 xl:grid xl:grid-cols-5 xl:overflow-visible">
                  {(data?.ongoing ?? []).map((anime, index) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      index={index}
                      className="w-[168px] shrink-0 snap-start xl:w-auto"
                    />
                  ))}
                </div>
              )}
            </section>

            {(data?.complete ?? []).length > 0 ? (
              <section className="pb-10">
                <SectionHeading
                  eyebrow={t("Maraton")}
                  title={t("Yang sudah tamat")}
                  description={t("Cocok untuk maraton akhir pekan.")}
                />
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {(data?.complete ?? []).map((anime, index) => (
                    <AnimeCard key={anime.id} anime={anime} index={index} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="pb-12">
              <div className="flex flex-col items-start justify-between gap-4 rounded-[5px] border border-dashed border-border bg-card/50 p-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Clapperboard className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t("Anime di sini menggunakan sumber Otakudesu.")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("Tautan streaming dan unduhan disediakan langsung oleh API.")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                  {t("Lihat statistik")}
                </Button>
              </div>
            </section>
          </>
        )}
        </div>
      </div>
    </PageTransition>
  )
}

function AnimeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[3/4] w-full rounded-[5px]" />
          <Skeleton className="mt-2.5 h-3 w-4/5 rounded-full" />
        </div>
      ))}
    </div>
  )
}
