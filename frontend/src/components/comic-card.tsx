import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { BookOpen, Layers } from "lucide-react"

import { SaveButton } from "@/components/save-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ComicCard as ComicCardType } from "@/lib/types"

const ratios = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/6]",
  "aspect-[4/3]",
  "aspect-[3/4]",
]

interface ComicCardProps {
  comic: ComicCardType
  index?: number
  className?: string
  showSave?: boolean
  chapterLabel?: string
}

export function ComicCard({
  comic,
  index = 0,
  className,
  showSave = true,
  chapterLabel,
}: ComicCardProps) {
  const ratio = ratios[index % ratios.length]
  const [imageFailed, setImageFailed] = React.useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: Math.min(index % 6, 5) * 0.035 }}
      className={cn("group relative", className)}
    >
      <Link
        to={`/komik/${encodeURIComponent(comic.slug)}`}
        className="block focus-visible:outline-none"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[5px] bg-muted shadow-[0_1px_0_0_rgba(0,0,0,0.03)]",
            ratio,
          )}
        >
          {comic.image && !imageFailed ? (
            <img
              src={comic.image}
              alt={comic.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary via-accent to-secondary p-4 text-center">
              <BookOpen className="h-7 w-7 text-primary/60" />
              <span className="line-clamp-3 font-display text-sm font-bold text-foreground/70">
                {comic.title}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-2.5 top-2.5 flex max-w-[85%] flex-wrap gap-1.5">
            {comic.type ? (
              <Badge variant="glass" className="border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                <Layers className="h-3 w-3" />
                {comic.type}
              </Badge>
            ) : null}
          </div>

          {showSave ? (
            <div className="absolute right-2.5 top-2.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <SaveButton comic={comic} compact />
            </div>
          ) : null}

          {(chapterLabel || comic.chapter) ? (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
              <Badge
                variant="glass"
                className="border-white/15 px-2.5 py-1 text-[10px] font-semibold normal-case tracking-normal"
              >
                {chapterLabel || comic.chapter}
              </Badge>
            </div>
          ) : null}

        </div>

        <div className="space-y-1 px-1 pb-1 pt-2.5">
          <h3 className="line-clamp-2 text-[13.5px] font-bold leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
            {comic.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            {comic.genre ? (
              <span className="line-clamp-1">{comic.genre.split(",")[0]}</span>
            ) : (
              <span>Komik</span>
            )}
            {comic.meta ? (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                <span className="line-clamp-1">{comic.meta}</span>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
