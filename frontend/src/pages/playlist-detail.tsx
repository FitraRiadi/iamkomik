import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ArrowUpRight, Globe2, ListMusic, Lock } from "lucide-react"

import { ComicCard } from "@/components/comic-card"
import { EmptyState } from "@/components/empty-state"
import { MasonryGrid } from "@/components/masonry-grid"
import { PageTransition } from "@/components/page-transition"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useAuth } from "@/lib/auth"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n"
import type { PlaylistDetail } from "@/lib/types"

export function PlaylistDetailPage() {
  const { playlistId = "" } = useParams()
  const { t, language } = useI18n()
  const { user } = useAuth()
  const { data, loading, error } = useApiQuery<PlaylistDetail>(
    playlistId ? `/playlists/${encodeURIComponent(playlistId)}/view/` : null,
  )

  if (loading) return <PlaylistSkeleton />

  if (error || !data) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ListMusic}
          title={t("Playlist tidak ditemukan")}
          description={error ?? t("Playlist ini belum tersedia atau telah dihapus.")}
          actionLabel={t("Kembali ke beranda")}
          actionHref="/"
        />
      </div>
    )
  }

  const initial = data.owner.name.trim().charAt(0).toUpperCase() || "P"
  const isOwner = user?.id === data.owner.id
  const ownerHref = `/u/${data.owner.id}`

  return (
    <PageTransition>
      <div className="container py-10 sm:py-14">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to={ownerHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("Kembali ke profil")}
          </Link>
          {isOwner ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/profil">{t("Atur playlist")}</Link>
            </Button>
          ) : null}
        </div>

        <section className="relative overflow-hidden rounded-[5px] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">{data.is_public ? t("Playlist publik") : t("Playlist")}</p>
              <h1 className="headline mt-1 text-3xl text-balance sm:text-4xl">{data.name}</h1>
              {data.description ? (
                <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                  {data.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant={data.is_public ? "soft" : "outline"} className="gap-1.5 px-3 py-1.5">
                  {data.is_public ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {data.is_public ? t("Publik") : t("Pribadi")}
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5">
                  {t("{count} komik", { count: data.items.length })}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {t("Diperbarui {date}", { date: formatDate(data.updated_at, language) })}
                </span>
              </div>
            </div>

            <Link
              to={ownerHref}
              className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl border border-border/70 bg-background/60 p-2.5 pr-3 transition hover:border-primary/30 hover:bg-accent/30"
            >
              <Avatar className="h-10 w-10 border border-border/70">
                <AvatarImage src={data.owner.avatar} alt={data.owner.name} />
                <AvatarFallback className="bg-primary/10 font-display text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("Dibuat oleh")}
                </span>
                <span className="block truncate text-sm font-bold">{data.owner.name}</span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Link>
          </div>
        </section>

        <section className="mt-8">
          {data.items.length === 0 ? (
            <EmptyState
              icon={ListMusic}
              title={t("Playlist kosong")}
              description={t("Belum ada komik di playlist ini.")}
            />
          ) : (
            <MasonryGrid>
              {data.items.map((comic, index) => (
                <ComicCard
                  key={comic.slug}
                  comic={comic}
                  index={index}
                  showSave={false}
                />
              ))}
            </MasonryGrid>
          )}
        </section>
      </div>
    </PageTransition>
  )
}

function PlaylistSkeleton() {
  return (
    <div className="container py-10 sm:py-14">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-5 h-52 w-full rounded-[5px]" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] w-full rounded-[5px]" />
        ))}
      </div>
    </div>
  )
}
