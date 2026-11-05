import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bookmark,
  Flame,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { ComicCard } from "@/components/comic-card"
import { AnimeHighlightBackdrop } from "@/components/highlight-backdrop"
import { LoadingGrid } from "@/components/loading-grid"
import { MasonryGrid } from "@/components/masonry-grid"
import { PageTransition } from "@/components/page-transition"
import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useLibrary } from "@/hooks/use-library"
import { formatRelative } from "@/lib/format"
import { useI18n } from "@/lib/i18n"
import type { ComicCard as ComicCardType, HomePayload } from "@/lib/types"
import { cn } from "@/lib/utils"

export function HomePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiQuery<HomePayload>("/home/")
  const { history } = useLibrary()
  const [query, setQuery] = React.useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/jelajah?q=${encodeURIComponent(trimmed)}` : "/jelajah")
  }

  const spotlight = data?.spotlight ?? []
  const genres = data?.genres ?? []

  return (
    <PageTransition>
      <div className="relative isolate">
        <AnimeHighlightBackdrop />
        <div className="container">
        <section className="grid items-center gap-10 pb-8 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-16 lg:pt-16">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {t("6.000+ komik · update tiap hari")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="headline mt-5 text-[42px] leading-[0.98] text-balance sm:text-6xl xl:text-[68px]"
            >
              {t("Baca komik favorit,")}
              <br />
              <span className="relative inline-block text-primary">
                {t("tanpa drama.")}
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-primary/25"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 9C60 3 120 2 180 5C220 7 260 8 298 4"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
            >
              {t("Ribuan judul dari berbagai sumber, dikumpulin jadi satu tampilan yang rapi. Simpan yang lo suka, lanjutin bacaan kapan aja.")}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              onSubmit={submit}
              className="mt-7 flex max-w-xl items-center gap-2 rounded-full border border-border/80 bg-card p-1.5 pl-4 shadow-pin transition focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5"
            >
              <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Mau baca apa hari ini?")}
                className="h-11 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/80"
              />
              <Button type="submit" size="sm" className="h-11 shrink-0 px-5">
                {t("Cari komik")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t("Populer")}
              </span>
              {(genres.length ? genres.slice(0, 5) : [{ name: "Action", slug: "action" }, { name: "Romance", slug: "romance" }, { name: "Fantasy", slug: "fantasy" }]).map(
                (genre) => (
                  <Link
                    key={genre.slug}
                    to={`/jelajah?genre=${encodeURIComponent(genre.slug)}`}
                    className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                  >
                    {genre.name}
                  </Link>
                ),
              )}
            </motion.div>
          </div>

          <HeroCollage comics={spotlight} loading={loading} />
        </section>

        {error ? (
          <div className="mb-10 flex flex-col items-start justify-between gap-3 rounded-[5px] border border-destructive/20 bg-destructive/5 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
              {t("Coba lagi")}
            </Button>
          </div>
        ) : null}

        {history.length > 0 ? <ContinueReading history={history.slice(0, 6)} /> : null}

        <section className="py-10">
          <SectionHeading
            eyebrow={t("Lagi naik daun")}
            title={t("Yang ramai dibaca minggu ini")}
            description={t("Pilihan dari daftar trending — biasanya yang paling sering update.")}
            actionLabel={t("Lihat semua")}
            actionHref="/jelajah"
          />
          {loading ? (
            <LoadingGrid count={10} />
          ) : (
            <MasonryGrid>
              {(data?.trending ?? []).slice(0, 15).map((comic, index) => (
                <ComicCard key={comic.slug} comic={comic} index={index} />
              ))}
            </MasonryGrid>
          )}
        </section>

        {spotlight.length > 0 ? <EditorCarousel comics={spotlight.slice(0, 5)} /> : null}

        <section className="py-6">
          <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-[5px] border border-border/60 bg-card/50 px-4 py-3.5">
            <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t("Genre")}
            </span>
            {(genres.length ? genres : []).slice(0, 14).map((genre) => (
              <Link
                key={genre.slug}
                to={`/jelajah?genre=${encodeURIComponent(genre.slug)}`}
                className="rounded-full border border-transparent bg-secondary px-3 py-1.5 text-[11px] font-semibold text-secondary-foreground transition hover:border-primary/20 hover:bg-accent hover:text-accent-foreground"
              >
                {genre.name}
              </Link>
            ))}
            <Link
              to="/jelajah"
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              {t("Semua genre")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        <section className="py-8">
          <SectionHeading
            eyebrow={t("Baru update")}
            title={t("Chapter baru, jangan sampai kelewatan")}
            description={t("Diurutkan dari yang paling baru di-update oleh sumbernya.")}
            actionLabel={t("Jelajah semua")}
            actionHref="/jelajah"
          />
          {loading ? (
            <LoadingGrid count={12} />
          ) : (
            <MasonryGrid>
              {(data?.latest ?? []).slice(0, 20).map((comic, index) => (
                <ComicCard key={comic.slug} comic={comic} index={index} />
              ))}
            </MasonryGrid>
          )}
        </section>

        <section className="py-10">
          <div className="relative overflow-hidden rounded-[5px] border border-primary/15 bg-gradient-to-br from-primary via-primary to-rose-700 px-6 py-10 text-primary-foreground sm:px-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-black/10 blur-2xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <Badge variant="glass" className="border-white/20 bg-white/15 text-white">
                  <BarChart3 className="h-3 w-3" />
                  {t("Reading insights")}
                </Badge>
                <h2 className="headline mt-4 text-3xl text-balance sm:text-4xl">
                  {t("Lo udah baca berapa chapter minggu ini?")}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
                  {t("Semua aktivitas baca lo tercatat otomatis. Cek statistik, streak, dan genre favorit lo di dashboard.")}
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="shrink-0 bg-white text-primary hover:bg-white/90"
              >
                <Link to="/dashboard">
                  {t("Buka dashboard")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        </div>
      </div>
    </PageTransition>
  )
}

function HeroCollage({ comics, loading }: { comics: ComicCardType[]; loading: boolean }) {
  const { t } = useI18n()
  const items = React.useMemo(() => comics.slice(0, 3), [comics])
  const [ordered, setOrdered] = React.useState<ComicCardType[]>(items)

  React.useEffect(() => {
    setOrdered(items)
  }, [items])

  React.useEffect(() => {
    if (ordered.length < 2) return

    const timer = window.setInterval(() => {
      setOrdered((current) =>
        current.length < 2 ? current : [...current.slice(1), current[0]],
      )
    }, 3500)

    return () => window.clearInterval(timer)
  }, [ordered.length])

  if (loading || ordered.length === 0) {
    return (
      <div className="relative mx-auto grid aspect-[5/4] w-full max-w-md grid-cols-2 gap-3 p-4">
        <Skeleton className="col-span-1 mt-8 rounded-[5px]" />
        <Skeleton className="col-span-1 rounded-[5px]" />
        <Skeleton className="col-span-1 rounded-[5px]" />
        <Skeleton className="col-span-1 mb-8 rounded-[5px]" />
      </div>
    )
  }

  const positions = [
    "left-0 top-[12%] w-[44%] -rotate-6",
    "right-0 top-0 w-[52%] rotate-3",
    "bottom-[2%] left-[20%] w-[50%] rotate-2",
  ]

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-md select-none sm:max-w-lg">
      <div className="absolute left-[8%] top-[10%] h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-[5%] right-[5%] h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />

      {ordered.map((comic, index) => (
        <motion.div
          key={comic.slug}
          layout
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.65,
            delay: 0.1 + index * 0.08,
            ease: [0.22, 1, 0.36, 1],
            layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          }}
          className={cn("absolute", positions[index % positions.length])}
          style={{ zIndex: 10 - index }}
        >
          <motion.div
            animate={{ y: index % 2 === 0 ? [0, -8, 0] : [0, 8, 0] }}
            transition={{ duration: 6 + index, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Link
              to={`/komik/${encodeURIComponent(comic.slug)}`}
              className="group block overflow-hidden rounded-[5px] border border-white/50 bg-card p-1.5 shadow-float transition-transform duration-300 hover:scale-[1.03] dark:border-white/10"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px]">
                {comic.image ? (
                  <img
                    src={comic.image}
                    alt={comic.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-accent p-4 text-center font-display text-sm font-bold">
                    {comic.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="line-clamp-2 text-[11px] font-bold leading-tight text-white drop-shadow">
                    {comic.title}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="absolute right-[2%] top-[46%] z-20 flex items-center gap-2 rounded-[5px] border border-border/70 bg-card/95 px-3 py-2 shadow-pin backdrop-blur"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
          <TrendingUp className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-medium text-muted-foreground">{t("Update hari ini")}</p>
          <p className="text-xs font-bold">{t("40+ chapter baru")}</p>
        </div>
      </motion.div>
    </div>
  )
}

function ContinueReading({
  history,
}: {
  history: Array<{
    comic_slug: string
    title: string
    image: string
    chapter_slug: string
    chapter_name: string
    updated_at: string
  }>
}) {
  const { t, language } = useI18n()
  return (
    <section className="py-4">
      <SectionHeading
        eyebrow={t("Lanjutin")}
        title={t("Masih penasaran sama ceritanya?")}
        actionLabel={t("Semua riwayat")}
        actionHref="/koleksi"
      />
      <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {history.map((item, index) => (
          <motion.div
            key={item.comic_slug}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-[280px] shrink-0 snap-start"
          >
            <Link
              to={`/baca/${encodeURIComponent(item.comic_slug)}/${encodeURIComponent(item.chapter_slug ?? "")}`}
              className="group flex items-center gap-3 rounded-[5px] border border-border/70 bg-card p-2.5 shadow-sm transition hover:border-primary/25 hover:shadow-pin"
            >
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[3px] bg-muted">
                {item.image ? (
                  <img src={item.image} alt={item.title} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-bold leading-snug group-hover:text-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-primary">{item.chapter_name}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatRelative(item.updated_at, language)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                  {t("Lanjut baca")}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function EditorCarousel({ comics }: { comics: ComicCardType[] }) {
  const { t } = useI18n()
  const [index, setIndex] = React.useState(0)
  const total = comics.length

  React.useEffect(() => {
    setIndex((current) => (total > 0 ? current % total : 0))
  }, [total])

  React.useEffect(() => {
    if (total <= 1) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [total])

  if (total === 0) return null

  const comic = comics[index] ?? comics[0]
  const move = (step: number) => {
    setIndex((current) => (current + step + total) % total)
  }

  return (
    <section className="py-8">
      <div className="relative overflow-hidden rounded-[5px] border border-border/60 bg-foreground text-background">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={comic.slug}
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -26 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {comic.image ? (
              <img
                src={comic.image}
                alt=""
                aria-hidden
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-sm"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/20" />
            <div className="relative grid min-h-[330px] items-center gap-8 px-6 py-10 sm:px-10 md:grid-cols-[1fr_auto]">
              <div className="max-w-xl">
                <Badge className="border-white/20 bg-white/15 text-white backdrop-blur">
                  <Flame className="h-3 w-3" />
                  {t("Pilihan editor")}
                </Badge>
                <h2 className="headline mt-4 line-clamp-2 text-3xl text-white sm:text-4xl">
                  {comic.title}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                  {comic.chapter ? t("{chapter} baru aja rilis. ", { chapter: comic.chapter }) : ""}
                  {t("Buka detailnya buat lihat sinopsis, daftar chapter, dan rekomendasi serupa.")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Button
                    asChild
                    size="lg"
                    className="border-white/50 bg-white text-black hover:bg-white/90"
                  >
                    <Link to={`/komik/${encodeURIComponent(comic.slug)}`}>
                      <BookOpen className="h-4 w-4" />
                      {t("Lihat detail")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                  >
                    <Link to={`/komik/${encodeURIComponent(comic.slug)}`}>
                      <Bookmark className="h-4 w-4" />
                      {t("Simpan dulu")}
                    </Link>
                  </Button>
                </div>
              </div>

              <Link
                to={`/komik/${encodeURIComponent(comic.slug)}`}
                className="group relative hidden w-44 shrink-0 overflow-hidden rounded-[5px] border border-white/20 shadow-float md:block"
              >
                {comic.image ? (
                  <img
                    src={comic.image}
                    alt={comic.title}
                    referrerPolicy="no-referrer"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <span className="absolute right-2 top-2 rounded-full bg-white/20 p-1.5 backdrop-blur">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {total > 1 ? (
          <span className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            {index + 1} / {total}
          </span>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {comics.map((item, itemIndex) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setIndex(itemIndex)}
                aria-label={`Slide ${itemIndex + 1}: ${item.title}`}
                aria-current={itemIndex === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  itemIndex === index
                    ? "w-7 bg-primary"
                    : "w-3 bg-border hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => move(-1)}
              aria-label={t("Slide sebelumnya")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => move(1)}
              aria-label={t("Slide berikutnya")}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
