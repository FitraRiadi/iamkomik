import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, Globe2, ListMusic, Loader2, Lock, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApiQuery } from "@/hooks/use-api-query"
import { api, getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import type { Playlist } from "@/lib/types"

export function ProfilePlaylists() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiQuery<{ results: Playlist[] }>(
    user ? "/playlists/" : null,
  )
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isPublic, setIsPublic] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [busyId, setBusyId] = React.useState<number | null>(null)

  const playlists = data?.results ?? []

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    if (name.trim().length < 2) {
      toast.error(t("Nama playlist minimal 2 karakter."))
      return
    }
    setBusy(true)
    try {
      await api.post("/playlists/", {
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic,
      })
      setName("")
      setDescription("")
      setIsPublic(true)
      toast.success(t("Playlist dibuat."))
      refetch()
    } catch (requestError) {
      toast.error(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const toggleVisibility = async (playlist: Playlist) => {
    setBusyId(playlist.id)
    try {
      await api.patch(`/playlists/${playlist.id}/`, { is_public: !playlist.is_public })
      refetch()
    } catch (requestError) {
      toast.error(getErrorMessage(requestError))
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (playlist: Playlist) => {
    if (!window.confirm(t("Hapus playlist \"{name}\"?", { name: playlist.name }))) return
    setBusyId(playlist.id)
    try {
      await api.delete(`/playlists/${playlist.id}/`)
      toast.success(t("Playlist dihapus."))
      refetch()
    } catch (requestError) {
      toast.error(getErrorMessage(requestError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mt-8 rounded-[5px] border border-border/70 bg-card p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{t("Koleksi")}</p>
          <h2 className="headline mt-1 text-2xl">{t("Playlist Anda")}</h2>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {t("Susun komik favorit menjadi playlist. Playlist publik tampil di profil Anda.")}
          </p>
        </div>
        {user ? (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={`/u/${user.id}`}>
              {t("Lihat profil publik")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : null}
      </div>

      <form onSubmit={create} className="mt-5 grid gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-4 sm:grid-cols-[1fr_1.2fr_auto]">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          placeholder={t("Nama playlist")}
          required
        />
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={280}
          placeholder={t("Deskripsi singkat (opsional)")}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isPublic ? "soft" : "outline"}
            size="sm"
            onClick={() => setIsPublic((value) => !value)}
            className="shrink-0"
          >
            {isPublic ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {isPublic ? t("Publik") : t("Pribadi")}
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {busy ? t("Membuat…") : t("Buat")}
          </Button>
        </div>
      </form>

      <div className="mt-5">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("Memuat playlist…")}
          </div>
        ) : error ? (
          <p className="py-4 text-xs text-destructive">{error}</p>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
            <ListMusic className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-semibold">{t("Belum ada playlist")}</p>
            <p className="text-xs text-muted-foreground">
              {t("Buat playlist pertama dengan formulir di atas.")}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {playlists.map((playlist) => (
              <article key={playlist.id} className="rounded-xl border border-border/60 bg-background/60 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{playlist.name}</p>
                    {playlist.description ? (
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {playlist.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={playlist.is_public ? t("Jadikan pribadi") : t("Jadikan publik")}
                      onClick={() => void toggleVisibility(playlist)}
                      disabled={busyId === playlist.id}
                    >
                      {playlist.is_public ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("Hapus playlist")}
                      onClick={() => void remove(playlist)}
                      disabled={busyId === playlist.id}
                      className="text-muted-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    {playlist.is_public ? <Globe2 className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                    {playlist.is_public ? t("Publik") : t("Pribadi")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {t("{count} komik", { count: playlist.items.length })}
                  </span>
                </div>

                {playlist.items.length > 0 ? (
                  <div className="mt-3 flex gap-1.5 overflow-hidden">
                    {playlist.items.slice(0, 5).map((item) => (
                      <Link
                        key={item.slug}
                        to={`/komik/${encodeURIComponent(item.slug)}`}
                        className="block h-14 w-11 shrink-0 overflow-hidden rounded-md bg-muted"
                        title={item.title}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
