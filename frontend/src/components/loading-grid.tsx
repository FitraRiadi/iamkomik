import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const heights = ["h-56", "h-40", "h-64", "h-52", "h-44", "h-60"]

export function LoadingGrid({ count = 10, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        "pin-grid columns-2 gap-x-3.5 sm:columns-3 lg:columns-4 xl:columns-5",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="break-inside-avoid pb-4">
          <Skeleton className={cn("w-full rounded-[5px]", heights[index % heights.length])} />
          <Skeleton className="mt-3 h-3.5 w-4/5 rounded-full" />
          <Skeleton className="mt-2 h-3 w-2/5 rounded-full" />
        </div>
      ))}
    </div>
  )
}
