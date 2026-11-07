import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Check, ListPlus, Loader2, Lock, Plus, Globe2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApiQuery } from "@/hooks/use-api-query"
import { api, getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import type { ComicCard, Playlist } from "@/lib/types"

export function PlaylistPicker({ comic }: { comic: ComicCard }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const location = useLocation()
  const { data, loading, refetch } = useApiQuery<{ results: Playlist[] }>(
    user ? "/playlists/" : null,
  )
  const [busyId, setBusyId] = React.useState<number | null>(null)

  const playlists = data?.results ?? []
  const next = encodeURIComponent(location.pathname + location.search)

  const toggle = async (playlist: Playlist) => {
    setBusyId(playlist.id)
    try {
      const response = await api.post<{ action: "added" | "removed" }>(
        `/playlists/${playlist.id}/items/`,
        {
          slug: comic.slug,
          title: comic.title,
          image: comic.image,
          type: comic.type,
          genre: comic.genre,
        },
      )
      toast.success(
        response.data.action === "added"
          ? t("Ditambahkan ke {name}.", { name: playlist.name })
          : t("Dihapus dari {name}.", { name: playlist.name }),
      )
      refetch()
    } catch (requestError) {
      toast.error(getErrorMessage(requestError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="lg">
          <ListPlus className="h-4 w-4" />
          {t("Playlist")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("Simpan ke playlist")}</DialogTitle>
          <DialogDescription>
            {t("Tambahkan {title} ke salah satu playlist Anda.", { title: comic.title })}
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground">
              {t("Masuk terlebih dahulu untuk membuat dan mengatur playlist.")}
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link to={`/masuk?next=${next}`}>{t("Masuk")}</Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 py-8 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("Memuat playlist…")}
          </div>
        ) : playlists.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4">
            <p className="text-sm font-bold">{t("Belum ada playlist")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Buat playlist pertama dari halaman profil, lalu kembali ke sini.")}
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to="/profil">{t("Buat playlist")}</Link>
            </Button>
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {playlists.map((playlist) => {
              const contains = playlist.items.some((item) => item.slug === comic.slug)
              return (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{playlist.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="gap-1 px-2 py-0.5 text-[10px]">
                        {playlist.is_public ? (
                          <Globe2 className="h-2.5 w-2.5" />
                        ) : (
                          <Lock className="h-2.5 w-2.5" />
                        )}
                        {playlist.is_public ? t("Publik") : t("Pribadi")}
                      </Badge>
                      <span>{t("{count} komik", { count: playlist.items.length })}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={contains ? "secondary" : "outline"}
                    disabled={busyId === playlist.id}
                    onClick={() => void toggle(playlist)}
                    className="shrink-0"
                  >
                    {busyId === playlist.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : contains ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {contains ? t("Tersimpan") : t("Tambah")}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
