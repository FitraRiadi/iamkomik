import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock3,
  Play,
  Star,
  Tv,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageTransition } from "@/components/page-transition"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useI18n } from "@/lib/i18n"
import type { AnimeDetail } from "@/lib/types"

export function AnimeDetailPage() {
  const { animeId = "" } = useParams()
  const { t } = useI18n()
  const { data, loading, error } = useApiQuery<AnimeDetail>(
    `/anime/${encodeURIComponent(animeId)}/`,
  )
  const [expanded, setExpanded] = React.useState(false)

  if (loading) return <AnimeDetailSkeleton />

  if (error || !data) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Clapperboard}
          title={t("Anime tidak ditemukan")}
          description={error ?? t("Data anime ini belum tersedia di sumber.")}
          actionLabel={t("Kembali ke anime")}
          actionHref="/anime"
        />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container">
        <div className="flex items-center gap-2 py-5 text-xs font-medium text-muted-foreground">
          <Link to="/anime" className="transition hover:text-foreground">
            Anime
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-foreground">{data.title}</span>
        </div>

        <section className="relative overflow-hidden rounded-[5px] border border-border/60 bg-card">
          {data.poster ? (
            <img
              src={data.poster}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-3xl dark:opacity-10"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-card/40 via-card/85 to-card" />

          <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[210px_1fr] lg:grid-cols-[240px_1fr] lg:gap-10 lg:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="mx-auto w-48 sm:w-52 md:mx-0 md:w-full"
            >
              <div className="overflow-hidden rounded-[5px] border border-border/60 bg-muted shadow-float">
                {data.poster ? (
                  <img src={data.poster} alt={data.title} referrerPolicy="no-referrer" className="aspect-[3/4] w-full object-cover" />
                ) : (
                  <div className="grid aspect-[3/4] place-items-center">
                    <Clapperboard className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {data.type ? <Badge>{data.type}</Badge> : null}
                {data.status ? <Badge variant="soft">{data.status}</Badge> : null}
                {data.score ? (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {data.score}
                  </Badge>
                ) : null}
                {data.duration ? <Badge variant="outline">{data.duration}</Badge> : null}
              </div>

              <h1 className="headline mt-4 text-3xl text-balance sm:text-4xl lg:text-5xl">
                {data.title}
              </h1>
              {data.japanese ? (
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">{data.japanese}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                {data.aired ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {data.aired}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Tv className="h-3.5 w-3.5" />
                  {t("{count} episode tersedia", { count: data.episodes.length })}
                </span>
                {data.studios ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clapperboard className="h-3.5 w-3.5" />
                    {data.studios}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {data.genres.map((genre) => (
                  <span
                    key={genre.genreId || genre.title}
                    className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
                  >
                    {genre.title}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <p
                  className={cnSynopsis(!expanded)}
                >
                  {data.synopsis || t("Belum ada sinopsis untuk anime ini.")}
                </p>
                {(data.synopsis ?? "").length > 280 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    {expanded ? t("Sembunyikan") : t("Baca selengkapnya")}
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                ) : null}
              </div>

              {data.episodes[0] ? (
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <Button asChild size="lg">
                    <Link to={`/anime/episode/${encodeURIComponent(data.episodes[0].id)}`}>
                      <Play className="h-4 w-4 fill-current" />
                      {t("Tonton episode {episode}", {
                        episode: data.episodes[0].eps ?? t("terbaru"),
                      })}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/anime">
                      <ArrowLeft className="h-4 w-4" />
                      {t("Daftar anime")}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section>
            <div className="rounded-[5px] border border-border/60 bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h2 className="headline text-xl">{t("Daftar episode")}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("{count} episode tersedia", { count: data.episodes.length })}
                  </p>
                </div>
                <Badge variant="outline">
                  <Clock3 className="h-3 w-3" />
                  {data.duration || "-"}
                </Badge>
              </div>

              {data.episodes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Clapperboard className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-semibold">{t("Belum ada episode")}</p>
                  <p className="text-xs text-muted-foreground">{t("Silakan periksa kembali nanti.")}</p>
                </div>
              ) : (
                <div className="mt-2 divide-y divide-border/60">
                  {data.episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      to={`/anime/episode/${encodeURIComponent(episode.id)}`}
                      className="group flex items-center gap-3 py-3 transition hover:bg-secondary/40 sm:px-2"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                        {episode.eps ?? "•"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold group-hover:text-primary">
                          {episode.title || t("Episode {episode}", { episode: episode.eps ?? "" })}
                        </p>
                        {episode.date ? (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{episode.date}</p>
                        ) : null}
                      </div>
                      <Play className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition group-hover:fill-primary group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[5px] border border-border/60 bg-card p-5">
              <h3 className="headline text-lg">{t("Informasi")}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label={t("Judul Jepang")} value={data.japanese || "-"} />
                <InfoRow label={t("Studio")} value={data.studios || "-"} />
                <InfoRow label={t("Produser")} value={data.producers || "-"} />
                <InfoRow label={t("Tipe")} value={data.type || "-"} />
                <InfoRow label={t("Status")} value={data.status || "-"} />
                <InfoRow label={t("Tayang")} value={data.aired || "-"} />
              </dl>
            </div>
            <div className="rounded-[5px] border border-dashed border-border bg-card/50 p-5">
              <p className="text-sm font-bold">{t("Catatan")}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {t("Video disematkan dari server sumber. Jika pemutar tidak muncul, buka server alternatif di halaman episode.")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}

function cnSynopsis(collapsed: boolean) {
  return collapsed
    ? "whitespace-pre-line text-sm leading-relaxed text-foreground/75 line-clamp-4"
    : "whitespace-pre-line text-sm leading-relaxed text-foreground/75"
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-xs font-semibold">{value}</dd>
    </div>
  )
}

function AnimeDetailSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-4 w-48 rounded-full" />
      <div className="mt-5 grid gap-7 rounded-[5px] border border-border/60 bg-card p-6 md:grid-cols-[220px_1fr]">
        <Skeleton className="mx-auto aspect-[3/4] w-48 rounded-[5px] md:w-full" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-10 w-4/5 rounded-xl" />
          <Skeleton className="h-4 w-2/5 rounded-full" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-full" />
        </div>
      </div>
    </div>
  )
}
