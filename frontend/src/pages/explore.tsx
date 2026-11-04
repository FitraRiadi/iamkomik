import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Compass,
  RefreshCw,
  Search,
  Shuffle,
  Sparkles,
  X,
} from "lucide-react"

import { ComicCard } from "@/components/comic-card"
import { EmptyState } from "@/components/empty-state"
import { AnimeHighlightBackdrop } from "@/components/highlight-backdrop"
import { LoadingGrid } from "@/components/loading-grid"
import { MasonryGrid } from "@/components/masonry-grid"
import { PageTransition } from "@/components/page-transition"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/hooks/use-api-query"
import type { ComicCard as ComicCardType, Genre } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ResultsPayload {
  results: ComicCardType[]
}

interface GenresPayload {
  results: Genre[]
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q")?.trim() ?? ""
  const genre = searchParams.get("genre") ?? ""

  const [input, setInput] = React.useState(query)
  const [seed, setSeed] = React.useState(0)

  React.useEffect(() => {
    setInput(query)
  }, [query])

  const endpoint =
    query.length >= 2
      ? `/comics/search/?q=${encodeURIComponent(query)}`
      : genre
        ? `/comics/genre/${encodeURIComponent(genre)}/`
        : "/comics/trending/"

  const { data, loading, error, refetch } = useApiQuery<ResultsPayload>(endpoint)
  const { data: genreData } = useApiQuery<GenresPayload>("/comics/genres/")

  const results = React.useMemo(() => {
    const base = data?.results ?? []
    if (!seed) return base
    const copy = [...base]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [data, seed])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    const trimmed = input.trim()
    if (trimmed) next.set("q", trimmed)
    else next.delete("q")
    next.delete("genre")
    setSearchParams(next)
  }

  const pickGenre = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete("q")
    if (value) next.set("genre", value)
    else next.delete("genre")
    setSearchParams(next)
    setSeed(0)
  }

  const clearFilters = () => {
    setSearchParams({})
    setInput("")
    setSeed(0)
  }

  const activeGenreName = (genreData?.results ?? []).find((item) => item.slug === genre)?.name

  return (
    <PageTransition>
      <div className="relative isolate">
        <AnimeHighlightBackdrop />
        <div className="container pt-10">
        <div className="relative overflow-hidden rounded-[5px] border border-border/60 bg-card/85 px-5 py-8 shadow-sm backdrop-blur-sm sm:px-8">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Jelajah</p>
              <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
                Temukan bacaan baru.
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Cari berdasarkan judul atau pilih genre. Semua hasil diambil langsung dari
                sumbernya, jadi update-nya cepat.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Badge variant="soft" className="gap-1.5 px-3 py-1.5">
                <Sparkles className="h-3 w-3" />
                {loading ? "Memuat…" : `${results.length} judul`}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setSeed((value) => value + 1)}>
                <Shuffle className="h-3.5 w-3.5" />
                Acak
              </Button>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="relative mt-6 flex items-center gap-2 rounded-full border border-border/80 bg-background p-1.5 pl-4 shadow-sm transition focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5"
          >
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Cari judul komik, manga, manhwa…"
              className="h-11 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/80"
            />
            {input || query ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <Button type="submit" size="sm" className="h-11 shrink-0 px-5">
              Cari
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="no-scrollbar mt-5 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => pickGenre("")}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition",
                !genre
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              Trending
            </button>
            {(genreData?.results ?? []).map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => pickGenre(item.slug)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold capitalize transition",
                  genre === item.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="headline text-2xl">
              {query
                ? `Hasil untuk “${query}”`
                : activeGenreName
                  ? `Genre ${activeGenreName}`
                  : "Lagi trending hari ini"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {query || genre ? (
                <button type="button" onClick={clearFilters} className="font-semibold text-primary hover:underline">
                  Reset filter
                </button>
              ) : (
                "Paling banyak dibuka pembaca IamKomik."
              )}
            </p>
          </div>
          {(query || genre) && (
            <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
              <Compass className="h-3 w-3" />
              Filter aktif
            </Badge>
          )}
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingGrid count={15} />
          ) : error ? (
            <EmptyState
              icon={RefreshCw}
              title="Gagal ambil data"
              description={error}
              actionLabel="Coba lagi"
              actionHref="/jelajah"
            >
              <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
                <RefreshCw className="h-3.5 w-3.5" />
                Muat ulang
              </Button>
            </EmptyState>
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Gak ada hasil"
              description="Coba kata kunci yang lebih pendek, atau pilih genre lain di atas."
              actionLabel="Kembali ke trending"
              actionHref="/jelajah"
            />
          ) : (
            <MasonryGrid>
              {results.map((comic, index) => (
                <motion.div key={`${comic.slug}-${seed}`} className="break-inside-avoid">
                  <ComicCard comic={comic} index={index} />
                </motion.div>
              ))}
            </MasonryGrid>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[5px] border border-dashed border-border bg-card/50 px-6 py-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Mau lihat yang lagi update?</p>
              <p className="text-xs text-muted-foreground">
                Halaman beranda nampilin chapter terbaru dari semua sumber.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              Balik ke beranda
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        </div>
      </div>
    </PageTransition>
  )
}
