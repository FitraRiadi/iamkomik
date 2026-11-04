import * as React from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  Bookmark,
  ChartNoAxesColumn,
  ChevronDown,
  Clipboard,
  Clapperboard,
  Compass,
  Home,
  Moon,
  Search,
  Sun,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { SearchDialog } from "@/components/layout/search-dialog"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLibrary } from "@/hooks/use-library"
import { getReaderId } from "@/lib/reader"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/jelajah", label: "Jelajah", icon: Compass, end: false },
  { to: "/anime", label: "Anime", icon: Clapperboard, end: false },
  { to: "/koleksi", label: "Koleksi", icon: Bookmark, end: false },
  { to: "/dashboard", label: "Statistik", icon: ChartNoAxesColumn, end: false },
]

export function SiteHeader() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { savedCount } = useLibrary()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const desktopInput = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (event.key === "/" && !typing) {
        event.preventDefault()
        if (window.matchMedia("(min-width: 768px)").matches) {
          desktopInput.current?.focus()
        } else {
          setSearchOpen(true)
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/jelajah?q=${encodeURIComponent(trimmed)}` : "/jelajah")
  }

  const copyReaderId = async () => {
    try {
      await navigator.clipboard.writeText(getReaderId())
      toast.success("ID perangkat disalin", {
        description: "Bisa dipakai buat backup data koleksi lo.",
      })
    } catch {
      toast.error("Gagal menyalin ID perangkat")
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="container flex h-[68px] items-center gap-3">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-glow transition-transform group-hover:-rotate-6">
              <span className="font-display text-[15px] font-extrabold leading-none">ik</span>
            </span>
            <span className="hidden font-display text-[21px] font-extrabold tracking-[-0.04em] sm:block">
              iamkomik<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="ml-3 hidden items-center gap-0.5 rounded-full border border-border/60 bg-card/60 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-secondary text-foreground shadow-sm",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form
              onSubmit={submitSearch}
              className="hidden w-[240px] items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 shadow-sm transition-all focus-within:w-[300px] focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 lg:flex xl:w-[320px] xl:focus-within:w-[380px]"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={desktopInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari komik…"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
              />
              <kbd className="hidden rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground xl:block">
                /
              </kbd>
            </form>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Cari komik"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card p-1 pr-2 transition hover:border-primary/30"
                  aria-label="Menu profil"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 font-display text-primary">F</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex items-center gap-2 py-2">
                  <UserRound className="h-4 w-4" />
                  <span>
                    Pembaca IamKomik
                    <span className="block text-[10px] font-medium text-muted-foreground">
                      Mode anonim · tersimpan lokal
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/koleksi">
                    <Bookmark className="h-4 w-4" />
                    Koleksi gue
                    {savedCount > 0 ? (
                      <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                        {savedCount}
                      </span>
                    ) : null}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <ChartNoAxesColumn className="h-4 w-4" />
                    Statistik bacaan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void copyReaderId()}>
                  <Clipboard className="h-4 w-4" />
                  Salin ID perangkat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Mode terang" : "Mode gelap"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
