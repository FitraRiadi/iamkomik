import { Bookmark, BookmarkCheck } from "lucide-react"

import { useLibrary } from "@/hooks/use-library"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { ComicCard } from "@/lib/types"

interface SaveButtonProps {
  comic: Pick<ComicCard, "slug" | "title" | "image" | "type" | "genre">
  className?: string
  compact?: boolean
}

export function SaveButton({ comic, className, compact = false }: SaveButtonProps) {
  const { isSaved, toggleFavorite } = useLibrary()
  const { t } = useI18n()
  const saved = isSaved(comic.slug)

  return (
    <button
      type="button"
      aria-label={saved ? t("Hapus dari koleksi") : t("Simpan ke koleksi")}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void toggleFavorite({
          slug: comic.slug,
          title: comic.title,
          image: comic.image,
          type: comic.type,
          genre: comic.genre,
        })
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-bold shadow-clay backdrop-blur-md transition-all duration-200 active:scale-95",
        saved
          ? "bg-primary text-primary-foreground hover:brightness-105"
          : compact
            ? "bg-black/55 text-white hover:bg-primary hover:text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        compact && "h-9 w-9 justify-center px-0",
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {!compact && <span>{saved ? t("Tersimpan") : t("Simpan")}</span>}
    </button>
  )
}
