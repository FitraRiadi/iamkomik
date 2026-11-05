import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Sparkles } from "lucide-react"

import { ComicCard } from "@/components/comic-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useI18n } from "@/lib/i18n"
import type { ComicCard as ComicCardType } from "@/lib/types"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResponse {
  results: ComicCardType[]
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [query, setQuery] = React.useState("")
  const [debounced, setDebounced] = React.useState("")

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data, loading } = useApiQuery<SearchResponse>(
    open && debounced.length >= 2
      ? `/comics/search/?q=${encodeURIComponent(debounced)}`
      : null,
  )

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    onOpenChange(false)
    navigate(trimmed ? `/jelajah?q=${encodeURIComponent(trimmed)}` : "/jelajah")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-3 p-0 sm:rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("Cari komik")}</DialogTitle>
          <DialogDescription>{t("Telusuri judul komik dari berbagai sumber.")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Cari judul komik…")}
            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            {t("Cari")}
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto px-3 pb-3">
          {query.trim().length < 2 ? (
            <div className="space-y-3 px-2 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {t("Coba cari")}
              </p>
              <div className="flex flex-wrap gap-2">
                {["Solo Leveling", "One Piece", "Manhwa", "Romance", "Action"].map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => setQuery(keyword)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="space-y-2 px-2 py-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-16 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (data?.results ?? []).length > 0 ? (
            <div className="grid grid-cols-2 gap-3 p-2 sm:grid-cols-3">
              {(data?.results ?? []).slice(0, 9).map((comic, index) => (
                <ComicCard
                  key={comic.slug}
                  comic={comic}
                  index={index}
                  showSave={false}
                  chapterLabel={comic.chapter || t("Lihat detail")}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="text-sm font-semibold">{t("Belum ketemu hasilnya")}</p>
              <p className="text-xs text-muted-foreground">
                {t("Coba kata kunci lain atau buka halaman jelajah.")}
              </p>
              <Link
                to={`/jelajah?q=${encodeURIComponent(query.trim())}`}
                onClick={() => onOpenChange(false)}
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                {t("Lihat semua hasil")}
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
