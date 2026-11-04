import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Layers,
  ListFilter,
  Play,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react"

import { ComicCard } from "@/components/comic-card"
import { EmptyState } from "@/components/empty-state"
import { HighlightBackdrop } from "@/components/highlight-backdrop"
import { MasonryGrid } from "@/components/masonry-grid"
import { PageTransition } from "@/components/page-transition"
import { SaveButton } from "@/components/save-button"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useLibrary } from "@/hooks/use-library"
import { cn } from "@/lib/utils"
import type { ComicDetail } from "@/lib/types"

export function ComicDetailPage() {
  const { slug = "" } = useParams()
  const { data, loading, error } = useApiQuery<ComicDetail>(
    `/comics/${encodeURIComponent(slug)}/`,
  )
  const { progressFor } = useLibrary()
  const progress = progressFor(slug)

  const [expanded, setExpanded] = React.useState(false)
  const [chapterQuery, setChapterQuery] = React.useState("")
  const [descending, setDescending] = React.useState(true)
  const [showAll, setShowAll] = React.useState(false)

  const chapters = React.useMemo(() => {
    const base = data?.chapters ?? []
    const filtered = chapterQuery.trim()
      ? base.filter((chapter) =>
          chapter.name.toLowerCase().includes(chapterQuery.trim().toLowerCase()),
        )
      : base
    return descending ? filtered : [...filtered].reverse()
  }, [data, chapterQuery, descending])

  const visibleChapters = showAll ? chapters : chapters.slice(0, 25)
  const readTarget = progress?.chapter_slug ?? data?.latest_chapter?.slug ?? data?.chapters[0]?.slug

  if (loading) return <DetailSkeleton />

  if (error || !data) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={BookOpen}
          title="Komik gak ketemu"
          description={error ?? "Data komik ini belum tersedia di sumbernya. Coba judul lain aja."}
          actionLabel="Balik ke jelajah"
          actionHref="/jelajah"
        />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="relative isolate">
        <HighlightBackdrop image={data.image} />
        <div className="container">
        <div className="flex items-center gap-2 py-5 text-xs font-medium text-muted-foreground">
          <Link to="/" className="transition hover:text-foreground">
            Beranda
          </Link>
          <span>/</span>
          <Link to="/jelajah" className="transition hover:text-foreground">
            Jelajah
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-foreground">{data.title}</span>
        </div>

        <section className="relative overflow-hidden rounded-[5px] border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
          {data.image ? (
            <img
              src={data.image}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-3xl dark:opacity-10"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-card/40 via-card/75 to-card/90" />

          <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[210px_1fr] lg:grid-cols-[240px_1fr] lg:gap-10 lg:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="mx-auto w-48 sm:w-52 md:mx-0 md:w-full"
            >
              <div className="overflow-hidden rounded-[5px] border border-border/60 bg-muted shadow-float">
                {data.image ? (
                  <img
                    src={data.image}
                    alt={data.title}
                    referrerPolicy="no-referrer"
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[3/4] place-items-center bg-accent p-5 text-center">
                    <BookOpen className="h-8 w-8 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="mt-3 hidden items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground md:flex">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {data.total_chapters} chapter tersedia
              </div>
            </motion.div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {data.type ? <Badge>{data.type}</Badge> : null}
                {data.status ? <Badge variant="soft">{data.status}</Badge> : null}
                {data.age_rating ? <Badge variant="outline">{data.age_rating}</Badge> : null}
                {data.reading_direction ? (
                  <Badge variant="outline">{data.reading_direction}</Badge>
                ) : null}
              </div>

              <h1 className="headline mt-4 text-3xl text-balance sm:text-4xl lg:text-5xl">
                {data.title}
              </h1>
              {data.title_indonesian ? (
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  {data.title_indonesian}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  {data.total_chapters} chapter
                </span>
                {data.latest_chapter ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    Update {data.latest_chapter.date || data.latest_chapter.name}
                  </span>
                ) : null}
                {data.author ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5" />
                    {data.author}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {data.genres.map((genre) => (
                  <Link
                    key={genre.slug || genre.name}
                    to={`/jelajah?genre=${encodeURIComponent(genre.slug)}`}
                    className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              <div className="mt-5">
                <p
                  className={cn(
                    "whitespace-pre-line text-sm leading-relaxed text-foreground/75",
                    !expanded && "line-clamp-4",
                  )}
                >
                  {data.synopsis || "Belum ada sinopsis untuk komik ini."}
                </p>
                {(data.synopsis ?? "").length > 260 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    {expanded ? "Sembunyikan" : "Baca selengkapnya"}
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {readTarget ? (
                  <Button asChild size="lg">
                    <Link to={`/baca/${encodeURIComponent(data.slug)}/${encodeURIComponent(readTarget)}`}>
                      <Play className="h-4 w-4" />
                      {progress ? `Lanjut ${progress.chapter_name}` : "Mulai baca"}
                    </Link>
                  </Button>
                ) : null}
                <SaveButton
                  comic={{
                    slug: data.slug,
                    title: data.title,
                    image: data.image,
                    type: data.type,
                    genre: data.genres.map((genre) => genre.name).join(", "),
                  }}
                  className="h-12 px-5 text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="order-2 lg:order-1">
            <div className="rounded-[5px] border border-border/60 bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="headline text-xl">Daftar chapter</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {data.chapters.length} chapter · Klik buat mulai baca
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-52 sm:flex-none">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={chapterQuery}
                      onChange={(event) => setChapterQuery(event.target.value)}
                      placeholder="Cari chapter…"
                      className="h-9 rounded-full pl-9 text-xs"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setDescending((value) => !value)}
                    aria-label="Urutkan chapter"
                    title={descending ? "Terbaru dulu" : "Terlama dulu"}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {visibleChapters.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <ListFilter className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-semibold">Chapter gak ketemu</p>
                  <p className="text-xs text-muted-foreground">Coba kata kunci lain.</p>
                </div>
              ) : (
                <div className="mt-2 divide-y divide-border/60">
                  {visibleChapters.map((chapter) => (
                    <Link
                      key={chapter.slug}
                      to={`/baca/${encodeURIComponent(data.slug)}/${encodeURIComponent(chapter.slug)}`}
                      className="group flex items-center gap-3 py-3 transition hover:bg-secondary/40 sm:px-2"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                        {chapter.number ?? "•"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold group-hover:text-primary">
                          {chapter.name}
                        </p>
                        {chapter.date ? (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{chapter.date}</p>
                        ) : null}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              )}

              {chapters.length > 25 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll((value) => !value)}
                  className="mt-3 w-full"
                >
                  {showAll ? "Tampilkan lebih sedikit" : `Tampilkan semua (${chapters.length})`}
                </Button>
              ) : null}
            </div>
          </section>

          <aside className="order-1 space-y-4 lg:order-2">
            <div className="rounded-[5px] border border-border/60 bg-card p-5">
              <h3 className="headline text-lg">Info komik</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow icon={Layers} label="Tipe" value={data.type || "—"} />
                <InfoRow icon={BookOpen} label="Total chapter" value={String(data.total_chapters)} />
                <InfoRow icon={CalendarDays} label="Update terakhir" value={data.latest_chapter?.date || "—"} />
                <InfoRow icon={UserRound} label="Author" value={data.author || "—"} />
                <InfoRow icon={Sparkles} label="Status" value={data.status || "—"} />
              </dl>
            </div>

            {progress ? (
              <div className="rounded-[5px] border border-primary/20 bg-accent/60 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-foreground">
                  Terakhir dibaca
                </p>
                <p className="mt-2 font-display text-lg font-bold text-foreground">
                  {progress.chapter_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lanjutin dari tempat lo berhenti.
                </p>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link to={`/baca/${encodeURIComponent(data.slug)}/${encodeURIComponent(progress.chapter_slug)}`}>
                    Lanjut baca
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="rounded-[5px] border border-dashed border-border bg-card/50 p-5">
              <p className="text-sm font-bold">Tips baca</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Semua chapter yang lo buka otomatis tersimpan ke riwayat. Gak perlu takut
                kehilangan posisi baca.
              </p>
            </div>
          </aside>
        </div>

        {data.similar.length > 0 ? (
          <section className="mt-12">
            <SectionHeading
              eyebrow="Mirip gini"
              title="Kalau suka yang ini, coba juga"
              description="Rekomendasi dari sumber yang sama."
            />
            <MasonryGrid>
              {data.similar.map((comic, index) => (
                <ComicCard key={comic.slug} comic={comic} index={index} />
              ))}
            </MasonryGrid>
          </section>
        ) : null}

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/jelajah">
              <ArrowLeft className="h-4 w-4" />
              Balik ke jelajah
            </Link>
          </Button>
        </div>
        </div>
      </div>
    </PageTransition>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="text-right text-xs font-semibold">{value}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-4 w-56 rounded-full" />
      <div className="mt-5 grid gap-7 rounded-[5px] border border-border/60 bg-card p-6 md:grid-cols-[220px_1fr]">
        <Skeleton className="mx-auto aspect-[3/4] w-48 rounded-[5px] md:w-full" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-10 w-4/5 rounded-xl" />
          <Skeleton className="h-4 w-2/5 rounded-full" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-12 w-36 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
