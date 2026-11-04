import { NavLink } from "react-router-dom"
import { Bookmark, ChartNoAxesColumn, Clapperboard, Compass, Home } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/jelajah", label: "Jelajah", icon: Compass, end: false },
  { to: "/anime", label: "Anime", icon: Clapperboard, end: false },
  { to: "/koleksi", label: "Koleksi", icon: Bookmark, end: false },
  { to: "/dashboard", label: "Statistik", icon: ChartNoAxesColumn, end: false },
]

export function MobileNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 px-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch gap-0.5 rounded-[1.75rem] border border-border/70 bg-background/90 p-1.5 shadow-[0_20px_55px_-22px_rgba(15,15,20,0.55)] backdrop-blur-2xl">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.35rem] px-0.5 py-1.5 text-[9.5px] font-bold leading-none tracking-[-0.01em] text-muted-foreground transition-colors",
                isActive && "text-primary",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "grid h-8 w-full max-w-[52px] place-items-center rounded-full transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "group-hover:bg-secondary group-active:scale-95",
                  )}
                >
                  <item.icon
                    className={cn("h-[17px] w-[17px]", isActive && "stroke-[2.5]")}
                    aria-hidden
                  />
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
