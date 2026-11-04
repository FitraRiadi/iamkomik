import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Play, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { AnimeCard as AnimeCardType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AnimeCard({
  anime,
  index = 0,
  className,
}: {
  anime: AnimeCardType
  index?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: Math.min(index % 6, 5) * 0.035 }}
      className={cn("group", className)}
    >
      <Link to={`/anime/${encodeURIComponent(anime.id)}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[5px] bg-muted shadow-sm">
          {anime.poster ? (
            <img
              src={anime.poster}
              alt={anime.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center bg-accent">
              <Sparkles className="h-6 w-6 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/0" />

          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
            {anime.status ? (
              <Badge variant="glass" className="border-white/15 text-[10px]">
                {anime.status}
              </Badge>
            ) : null}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="line-clamp-2 text-[12px] font-bold leading-snug text-white drop-shadow">
              {anime.title}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-white/70">
              {anime.episodes ? <span>{anime.episodes} eps</span> : null}
              {anime.release_day ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{anime.release_day}</span>
                </>
              ) : null}
              {anime.latest_release ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{anime.latest_release}</span>
                </>
              ) : null}
            </div>
          </div>

          <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
