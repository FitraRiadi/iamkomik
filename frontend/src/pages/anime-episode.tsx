import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  MonitorPlay,
  Server,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/empty-state"
import { PageTransition } from "@/components/page-transition"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { api, getErrorMessage } from "@/lib/api"
import type { AnimeEpisode } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AnimeEpisodePage() {
  const { episodeId = "" } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useApiQuery<AnimeEpisode>(
    `/anime/episode/${encodeURIComponent(episodeId)}/`,
  )
  const [streamUrl, setStreamUrl] = React.useState("")
  const [activeServer, setActiveServer] = React.useState("")
  const [serverLoading, setServerLoading] = React.useState("")

  React.useEffect(() => {
    if (data?.default_streaming_url) {
      setStreamUrl(data.default_streaming_url)
      setActiveServer("default")
    }
  }, [data])

  const playServer = async (serverId: string, serverName: string) => {
    setServerLoading(serverId)
    try {
      const response = await api.get<{ url: string }>(
        `/anime/server/${encodeURIComponent(serverId)}/`,
      )
      if (response.data.url) {
        setStreamUrl(response.data.url)
        setActiveServer(serverId)
        toast.success(`Server ${serverName} aktif`)
      }
    } catch (requestError) {
      toast.error("Server gak bisa dibuka", { description: getErrorMessage(requestError) })
    } finally {
      setServerLoading("")
    }
  }

  if (loading) return <EpisodeSkeleton />

  if (error || !data) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={MonitorPlay}
          title="Episode gak bisa dibuka"
          description={error ?? "Episode ini belum tersedia."}
          actionLabel="Balik ke anime"
          actionHref="/anime"
        />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container pt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link to="/anime" className="transition hover:text-foreground">
            Anime
          </Link>
          <span>/</span>
          {data.anime_id ? (
            <>
              <Link
                to={`/anime/${encodeURIComponent(data.anime_id)}`}
                className="transition hover:text-foreground"
              >
                Detail anime
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="line-clamp-1 text-foreground">Nonton</span>
        </div>

        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="headline text-2xl text-balance sm:text-3xl">{data.title || "Episode"}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {data.release_time ? <span>{data.release_time}</span> : null}
              <Badge variant="outline" className="gap-1">
                <MonitorPlay className="h-3 w-3" />
                Embed player
              </Badge>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={data.anime_id ? `/anime/${encodeURIComponent(data.anime_id)}` : "/anime"}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Daftar episode
            </Link>
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[5px] border border-border/60 bg-black shadow-float">
          <div className="relative aspect-video w-full">
            {streamUrl ? (
              <iframe
                key={streamUrl}
                src={streamUrl}
                title={data.title}
                className="h-full w-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
                <MonitorPlay className="h-8 w-8" />
                <p className="text-sm">Player belum tersedia.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.prev?.episodeId}
              onClick={() => {
                if (data.prev?.episodeId) navigate(`/anime/episode/${data.prev.episodeId}`)
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Sebelumnya
            </Button>
            <Button
              size="sm"
              disabled={!data.next?.episodeId}
              onClick={() => {
                if (data.next?.episodeId) navigate(`/anime/episode/${data.next.episodeId}`)
              }}
            >
              Selanjutnya
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          {streamUrl ? (
            <Button asChild variant="ghost" size="sm">
              <a href={streamUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Buka player di tab baru
              </a>
            </Button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[5px] border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <h2 className="headline text-lg">Pilih server</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Kalau player utama gak jalan, coba server lain di bawah.
            </p>

            <div className="mt-4 space-y-4">
              {data.streams.length === 0 ? (
                <p className="text-xs text-muted-foreground">Server streaming gak tersedia.</p>
              ) : (
                data.streams.map((quality) => (
                  <div key={quality.title}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {quality.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quality.serverList.map((server) => (
                        <button
                          key={server.serverId}
                          type="button"
                          onClick={() => void playServer(server.serverId, server.title)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                            activeServer === server.serverId
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                          )}
                        >
                          {serverLoading === server.serverId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          {server.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-[5px] bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Kalau iframe diblokir server sumber, pakai tombol “Buka player di tab baru”.
            </div>
          </section>

          <aside className="rounded-[5px] border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <h2 className="headline text-lg">Download</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Link download dari sumber. Ukuran bisa berubah.
            </p>

            <div className="mt-4 space-y-3">
              {data.downloads.length === 0 ? (
                <p className="text-xs text-muted-foreground">Link download gak tersedia.</p>
              ) : (
                data.downloads.map((quality) => (
                  <div key={quality.title} className="rounded-[5px] border border-border/60 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wide">{quality.title}</p>
                      <span className="text-[10px] text-muted-foreground">{quality.size}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {quality.urls.map((link) => (
                        <a
                          key={`${quality.title}-${link.title}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground"
                        >
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}

function EpisodeSkeleton() {
  return (
    <div className="container py-6">
      <Skeleton className="h-4 w-40 rounded-full" />
      <Skeleton className="mt-4 h-8 w-2/3 rounded-xl" />
      <Skeleton className="mt-5 aspect-video w-full rounded-[5px]" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-64 rounded-[5px]" />
        <Skeleton className="h-64 rounded-[5px]" />
      </div>
    </div>
  )
}
