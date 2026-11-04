import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div className="max-w-2xl space-y-1.5">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="headline text-2xl text-balance sm:text-[28px]">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          to={actionHref}
          className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-border/80 bg-card px-3.5 py-2 text-xs font-bold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  )
}
