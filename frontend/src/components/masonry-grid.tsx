import { cn } from "@/lib/utils"

interface MasonryGridProps {
  children: React.ReactNode
  className?: string
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  return (
    <div
      className={cn(
        "pin-grid columns-2 gap-x-3.5 sm:columns-3 lg:columns-4 xl:columns-5",
        className,
      )}
    >
      {children}
    </div>
  )
}
