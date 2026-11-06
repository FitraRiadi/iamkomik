import { useLocation } from "react-router-dom"

import { MobileNav } from "@/components/layout/mobile-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { OfflineBanner } from "@/components/offline-banner"
import { SitePrompts } from "@/components/layout/site-prompts"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const immersive = location.pathname.startsWith("/baca/")
  const authPage = location.pathname === "/masuk" || location.pathname === "/daftar"
  const hideMobileNav = immersive || authPage

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        hideMobileNav ? "" : "pb-[calc(5.9rem+env(safe-area-inset-bottom))] md:pb-0",
      )}
    >
      {!immersive ? <SiteHeader /> : null}
      {!immersive ? <OfflineBanner /> : null}
      <main className="flex-1">{children}</main>
      {!immersive ? <SiteFooter /> : null}
      {!hideMobileNav ? <MobileNav /> : null}
      {!immersive ? <SitePrompts /> : null}
    </div>
  )
}
