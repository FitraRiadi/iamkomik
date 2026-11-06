import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Bookmark, BookOpen, Clock3, History, Trash2 } from "lucide-react"

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
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LibraryPage() {
  const { favorites, history, loading, removeHistory } = useLibrary()
  const { t, language } = useI18n()

  return (
    <PageTransition>
      <div className="relative isolate">
        <AnimeHighlightBackdrop />
        <div className="container pt-10">
        <section className="relative overflow-hidden rounded-[5px] border border-border/60 bg-gradient-to-br from-card/90 via-card/85 to-accent/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">{t("Koleksi pribadi")}</p>
              <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
                {t("Bacaan Anda, rapi di sini.")}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {t("Semua komik yang Anda simpan dan riwayat baca tersimpan otomatis di akun Anda.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="soft" className="gap-1.5 px-3 py-1.5">
                <Bookmark className="h-3 w-3" />
                {t("{count} favorit", { count: favorites.length })}
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-background/60 px-3 py-1.5">
                <History className="h-3 w-3" />
                {t("{count} riwayat", { count: history.length })}
              </Badge>
            </div>
          </div>
        </section>

        <Tabs defaultValue="favorites" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="favorites">
                <Bookmark className="h-3.5 w-3.5" />
                {t("Favorit")}
                <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-bold">
                  {favorites.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock3 className="h-3.5 w-3.5" />
                {t("Riwayat baca")}
                <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-bold">
                  {history.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <Button asChild variant="ghost" size="sm">
              <Link to="/jelajah">
                {t("Cari komik lagi")}
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
                title={t("Belum ada komik yang disimpan")}
                description={t("Tekan tombol Simpan pada kartu komik mana pun, maka komik akan muncul di sini.")}
                actionLabel={t("Mulai jelajah")}
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
                      meta: formatRelative(favorite.created_at, language),
                    }}
                    chapterLabel={t("Tersimpan")}
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
                title={t("Belum ada riwayat baca")}
                description={t("Buka chapter pertama dari komik favorit Anda; riwayatnya akan muncul di sini secara otomatis.")}
                actionLabel={t("Cari komik")}
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
                            {item.chapter_name || t("Chapter")}
                          </Badge>
                          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground opacity-0 transition group-hover:opacity-100">
                            {t("Lanjutkan")}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                        <div className="space-y-1 p-3">
                          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug transition group-hover:text-primary">
                            {item.title}
                          </h3>
                          <p className="text-[10.5px] text-muted-foreground">
                            {t("Dibaca {time}", { time: formatRelative(item.updated_at, language) })}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeHistory(item.comic_slug)}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition hover:bg-destructive group-hover:opacity-100"
                        aria-label={t("Hapus riwayat")}
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
          <div>
            <p className="text-sm font-bold">{t("Koleksi tersimpan di akun Anda")}</p>
            <p className="text-xs text-muted-foreground">
              {t("Masuk dari perangkat lain untuk membuka koleksi dan riwayat yang sama.")}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard">
              {t("Lihat statistik")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
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
