import * as React from "react"
import { toast } from "sonner"

import { api, getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import type { ComicCard, Favorite, HistoryItem, LibraryPayload } from "@/lib/types"

interface ToggleInput {
  slug: string
  title: string
  image: string
  type?: string
  genre?: string
}

interface LibraryContextValue {
  favorites: Favorite[]
  history: HistoryItem[]
  loading: boolean
  savedCount: number
  isSaved: (slug: string) => boolean
  progressFor: (slug: string) => HistoryItem | undefined
  toggleFavorite: (comic: ToggleInput) => Promise<void>
  removeFavorite: (slug: string) => Promise<void>
  removeHistory: (slug: string) => Promise<void>
  refresh: () => Promise<void>
}

const LibraryContext = React.createContext<LibraryContextValue | undefined>(undefined)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const [favorites, setFavorites] = React.useState<Favorite[]>([])
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    try {
      const response = await api.get<LibraryPayload>("/library/")
      setFavorites(response.data.favorites ?? [])
      setHistory(response.data.history ?? [])
    } catch {
      // silent: halaman tetap bisa dipakai tanpa library
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    setLoading(true)
    void refresh()
  }, [refresh, user?.id])

  const savedSlugs = React.useMemo(
    () => new Set(favorites.map((favorite) => favorite.comic_slug)),
    [favorites],
  )

  const historyMap = React.useMemo(
    () => Object.fromEntries(history.map((item) => [item.comic_slug, item])),
    [history],
  )

  const toggleFavorite = React.useCallback(
    async (comic: ToggleInput) => {
      const saved = savedSlugs.has(comic.slug)
      const optimistic: Favorite = {
        comic_slug: comic.slug,
        title: comic.title,
        image: comic.image,
        comic_type: comic.type ?? "",
        genre: comic.genre ?? "",
        created_at: new Date().toISOString(),
      }

      if (saved) {
        setFavorites((current) => current.filter((item) => item.comic_slug !== comic.slug))
      } else {
        setFavorites((current) => [optimistic, ...current])
      }

      try {
        const response = await api.post<{ saved: boolean }>("/favorites/toggle/", {
          comic_slug: comic.slug,
          title: comic.title,
          image: comic.image,
          type: comic.type ?? "",
          genre: comic.genre ?? "",
        })
        if (response.data.saved) {
          toast.success(t("Disimpan ke koleksi"), {
            description: comic.title,
          })
        } else {
          toast(t("Dihapus dari koleksi"), { description: comic.title })
        }
      } catch (error) {
        setFavorites((current) =>
          saved
            ? [optimistic, ...current.filter((item) => item.comic_slug !== comic.slug)]
            : current.filter((item) => item.comic_slug !== comic.slug),
        )
        toast.error(t("Gagal update koleksi"), { description: getErrorMessage(error) })
      }
    },
    [savedSlugs, t],
  )

  const removeFavorite = React.useCallback(async (slug: string) => {
    const snapshot = favorites
    setFavorites((current) => current.filter((item) => item.comic_slug !== slug))
    try {
      await api.delete(`/favorites/${encodeURIComponent(slug)}/`)
      toast(t("Dihapus dari koleksi"))
    } catch (error) {
      setFavorites(snapshot)
      toast.error(t("Gagal menghapus"), { description: getErrorMessage(error) })
    }
  }, [favorites, t])

  const removeHistory = React.useCallback(async (slug: string) => {
    const snapshot = history
    setHistory((current) => current.filter((item) => item.comic_slug !== slug))
    try {
      await api.delete(`/history/${encodeURIComponent(slug)}/`)
      toast(t("Riwayat dihapus"))
    } catch (error) {
      setHistory(snapshot)
      toast.error(t("Gagal menghapus riwayat"), { description: getErrorMessage(error) })
    }
  }, [history, t])

  const value = React.useMemo<LibraryContextValue>(
    () => ({
      favorites,
      history,
      loading,
      savedCount: favorites.length,
      isSaved: (slug: string) => savedSlugs.has(slug),
      progressFor: (slug: string) => historyMap[slug],
      toggleFavorite,
      removeFavorite,
      removeHistory,
      refresh,
    }),
    [favorites, history, loading, savedSlugs, historyMap, toggleFavorite, removeFavorite, removeHistory, refresh],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const context = React.useContext(LibraryContext)
  if (!context) throw new Error("useLibrary harus dipakai di dalam LibraryProvider")
  return context
}

export function cardFromComic(comic: ComicCard): ToggleInput {
  return {
    slug: comic.slug,
    title: comic.title,
    image: comic.image,
    type: comic.type,
    genre: comic.genre,
  }
}
