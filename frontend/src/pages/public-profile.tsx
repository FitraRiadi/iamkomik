import * as React from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Flame,
  GraduationCap,
  Heart,
  ListMusic,
  MessageCircle,
  Sparkles,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageTransition } from "@/components/page-transition"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n"
import type { PublicProfile } from "@/lib/types"

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  first_read: BookOpen,
  collector: Heart,
  streak_7: Flame,
  bookworm: GraduationCap,
  discussion: MessageCircle,
}

export function PublicProfilePage() {
  const { userId = "" } = useParams()
  const { t, language } = useI18n()
  const { data, loading, error } = useApiQuery<PublicProfile>(
    userId ? `/users/${encodeURIComponent(userId)}/` : null,
  )

  if (loading) return <ProfileSkeleton />

  if (error || !data) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Sparkles}
          title={t("Profil tidak ditemukan")}
          description={error ?? t("Pengguna ini belum tersedia atau telah dihapus.")}
          actionLabel={t("Kembali ke beranda")}
          actionHref="/"
        />
      </div>
    )
  }

  const initial = data.name.trim().charAt(0).toUpperCase() || "P"
  const stats = [
    { label: t("Chapter dibaca"), value: data.stats.chapters_read },
    { label: t("Komik disimpan"), value: data.stats.favorites },
    { label: t("Komentar"), value: data.stats.comments },
    { label: t("Streak"), value: t("{count} hari", { count: data.stats.streak_days }) },
  ]

  return (
    <PageTransition>
      <div className="container py-10 sm:py-14">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/jelajah"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("Kembali ke jelajah")}
          </Link>
          {data.is_me ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/profil">{t("Atur profil")}</Link>
            </Button>
          ) : null}
        </div>

        <section className="relative overflow-hidden rounded-[5px] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24 border border-border/70">
              <AvatarImage src={data.avatar} alt={data.name} />
              <AvatarFallback className="bg-primary/10 font-display text-3xl text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{t("Profil pembaca")}</p>
              <h1 className="headline mt-1 text-3xl text-balance sm:text-4xl">{data.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("Bergabung {date}", { date: formatDate(data.joined_at, language) })}
              </p>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                {data.bio || t("Pembaca ini belum menulis bio.")}
              </p>
            </div>
          </div>

          {data.badges.length > 0 ? (
            <div className="relative mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t("Lencana")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.badges.map((badge) => {
                  const Icon = badgeIcons[badge.id] ?? Sparkles
                  return (
                    <Badge key={badge.id} variant="soft" className="gap-1.5 px-3 py-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      {t(badge.label)}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t("Playlist publik")}</p>
              <h2 className="headline mt-1 text-2xl">{t("Koleksi {name}", { name: data.name })}</h2>
            </div>
          </div>

          {data.playlists.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[5px] border border-dashed border-border bg-card/50 py-12 text-center">
              <ListMusic className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-semibold">{t("Belum ada playlist publik")}</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {t("Playlist yang dibagikan akan tampil di sini.")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="group block rounded-[5px] border border-border/60 bg-card p-4 transition hover:border-primary/30 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="headline text-lg transition group-hover:text-primary">{playlist.name}</h3>
                      {playlist.description ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {playlist.description}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {t("{count} komik", { count: playlist.items.length })}
                    </Badge>
                  </div>

                  {playlist.items.length > 0 ? (
                    <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                      {playlist.items.map((item) => (
                        <div key={item.slug} className="w-[92px] shrink-0">
                          <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-snug transition group-hover:text-primary">
                            {item.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">{t("Playlist ini masih kosong.")}</p>
                  )}

                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                    {t("Buka playlist")}
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container py-10">
      <Skeleton className="h-4 w-32 rounded-full" />
      <div className="mt-5 rounded-[5px] border border-border/60 bg-card p-6">
        <div className="flex items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-4 w-full max-w-md rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
