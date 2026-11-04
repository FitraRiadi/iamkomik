import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useApiQuery } from "@/hooks/use-api-query"
import type { AnimeHomePayload } from "@/lib/types"
import { cn } from "@/lib/utils"

const frameClass =
  "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden sm:h-[560px] lg:h-[640px]"

function Scrims() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/45 to-background" />
    </>
  )
}

export function HighlightBackdrop({
  image,
  className,
}: {
  image?: string | null
  className?: string
}) {
  if (!image) return null

  return (
    <div aria-hidden className={cn(frameClass, className)}>
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full scale-105 object-cover object-[center_28%] opacity-45 dark:opacity-30"
      />
      <Scrims />
    </div>
  )
}

export function AnimeHighlightBackdrop({ posters }: { posters?: string[] }) {
  const { data } = useApiQuery<AnimeHomePayload>(
    posters && posters.length > 0 ? null : "/anime/home/",
  )

  const images = React.useMemo(() => {
    const source = posters?.length
      ? posters
      : [...(data?.ongoing ?? []), ...(data?.complete ?? [])].map((anime) => anime.poster)
    return [...new Set(source.filter(Boolean))]
  }, [data, posters])

  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (images.length <= 1) return

    setIndex(Math.floor(Math.random() * images.length))
    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (images.length <= 1) return current
        let next = Math.floor(Math.random() * images.length)
        if (next === current) next = (next + 1) % images.length
        return next
      })
    }, 8000)

    return () => window.clearInterval(timer)
  }, [images.length])

  if (images.length === 0) return null

  const current = images[index % images.length]

  return (
    <div aria-hidden className={frameClass}>
      <div className="absolute inset-0 opacity-45 dark:opacity-30">
        <AnimatePresence initial={false}>
          <motion.img
            key={current}
            src={current}
            alt=""
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.1, ease: "easeOut" },
              scale: { duration: 8, ease: "linear" },
            }}
            className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
          />
        </AnimatePresence>
      </div>
      <Scrims />
    </div>
  )
}
