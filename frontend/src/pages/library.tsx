import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Clock3,
  Copy,
  History,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { ComicCard } from "@/components/comic-card"
import { EmptyState } from "@/components/empty-state"
import { AnimeHighlightBackdrop } from "@/components/highlight-backdrop"
import { MasonryGrid } from "@/components/masonry-grid"
import { PageTransition } from "@/components/page-transition"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLibrary } from "@/hooks/use-library"
import { formatRelative } from "@/lib/format"
import { getReaderId } from "@/lib/reader"
import { cn } from "@/lib/utils"

export function LibraryPage() {
  const { favorites, history, loading, removeHistory } = useLibrary()

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(getReaderId())
      toast.success("ID perangkat disalin")
    } catch {
      toast.error("Gagal menyalin ID")
    }
  }

  return (
    <PageTransition>
      <div className="relative isolate">
        <AnimeHighlightBackdrop />
        <div className="container pt-10">
        <section className="relative overflow-hidden rounded-[5px] border border-border/60 bg-gradient-to-br from-card/90 via-card/85 to-accent/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Koleksi pribadi</p>
              <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
                Bacaan lo, rapi di sini.
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Semua komik yang lo simpan dan riwayat baca tersimpan otomatis di perangkat ini.
                Gak perlu bikin akun.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft" className="gap-1.5 px-3 py-1.5">
                <Bookmark className="h-3 w-3" />
                {favorites.length} favorit
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-background/60 px-3 py-1.5">
                <History className="h-3 w-3" />
                {history.length} riwayat
              </Badge>
              <Button variant="outline" size="sm" onClick={() => void copyId()}>
                <Copy className="h-3.5 w-3.5" />
                Salin ID
              </Button>
            </div>
          </div>
        </section>

        <Tabs defaultValue="favorites" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="favorites">
                <Bookmark className="h-3.5 w-3.5" />
                Favorit
                <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-bold">
                  {favorites.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock3 className="h-3.5 w-3.5" />
                Riwayat baca
                <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-bold">
                  {history.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <Button asChild variant="ghost" size="sm">
              <Link to="/jelajah">
                Cari komik lagi
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <TabsContent value="favorites">
            {loading ? (
              <LibrarySkeleton />
            ) : favorites.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="Belum ada komik yang disimpan"
                description="Tekan tombol Simpan di card komik mana pun, nanti muncul di sini."
                actionLabel="Mulai jelajah"
                actionHref="/jelajah"
              />
            ) : (
              <MasonryGrid>
                {favorites.map((favorite, index) => (
                  <ComicCard
                    key={favorite.comic_slug}
                    index={index}
                    comic={{
                      slug: favorite.comic_slug,
                      title: favorite.title,
                      image: favorite.image,
                      chapter: "",
                      type: favorite.comic_type,
                      genre: favorite.genre,
                      meta: formatRelative(favorite.created_at),
                    }}
                    chapterLabel="Tersimpan"
                  />
                ))}
              </MasonryGrid>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <LibrarySkeleton />
            ) : history.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Belum ada riwayat baca"
                description="Buka chapter pertama dari komik favorit lo, riwayatnya bakal otomatis muncul di sini."
                actionLabel="Cari komik"
                actionHref="/jelajah"
              />
            ) : (
              <div className="pin-grid columns-2 gap-x-3.5 sm:columns-3 lg:columns-4 xl:columns-5">
                {history.map((item, index) => (
                  <motion.div
                    key={item.comic_slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.035 }}
                    className="break-inside-avoid"
                  >
                    <div className="group relative overflow-hidden rounded-[5px] border border-border/70 bg-card">
                      <Link
                        to={`/baca/${encodeURIComponent(item.comic_slug)}/${encodeURIComponent(item.chapter_slug)}`}
                        className="block"
                      >
                        <div className={cn("relative overflow-hidden bg-muted", index % 3 === 0 ? "aspect-[4/5]" : index % 3 === 1 ? "aspect-square" : "aspect-[3/4]")}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full place-items-center bg-accent">
                              <BookOpen className="h-6 w-6 text-primary/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <Badge
                            variant="glass"
                            className="absolute bottom-2.5 left-2.5 border-white/15 text-[10px]"
                          >
                            {item.chapter_name || "Chapter"}
                          </Badge>
                          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground opacity-0 transition group-hover:opacity-100">
                            Lanjut
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                        <div className="space-y-1 p-3">
                          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug transition group-hover:text-primary">
                            {item.title}
                          </h3>
                          <p className="text-[10.5px] text-muted-foreground">
                            Dibaca {formatRelative(item.updated_at)}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeHistory(item.comic_slug)}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition hover:bg-destructive group-hover:opacity-100"
                        aria-label="Hapus riwayat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[5px] border border-dashed border-border bg-card/50 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Data lo aman di perangkat ini</p>
              <p className="text-xs text-muted-foreground">
                Simpan ID perangkat buat mindahin koleksi ke browser lain.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void copyId()}>
              <Copy className="h-3.5 w-3.5" />
              Salin ID
            </Button>
            <Button asChild size="sm">
              <Link to="/dashboard">
                Lihat statistik
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
        </div>
      </div>
    </PageTransition>
  )
}

function LibrarySkeleton() {
  return (
    <div className="pin-grid columns-2 gap-x-3.5 sm:columns-3 lg:columns-4 xl:columns-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="break-inside-avoid pb-4">
          <Skeleton className={cn("w-full rounded-[5px]", index % 3 === 0 ? "h-64" : "h-48")} />
          <Skeleton className="mt-3 h-3.5 w-4/5 rounded-full" />
          <Skeleton className="mt-2 h-3 w-1/3 rounded-full" />
        </div>
      ))}
    </div>
  )
}
