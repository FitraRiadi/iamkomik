import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import * as React from "react"

import { AppShell } from "@/components/layout/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LibraryProvider } from "@/hooks/use-library"
import { AnimePage } from "@/pages/anime"
import { AnimeDetailPage } from "@/pages/anime-detail"
import { AnimeEpisodePage } from "@/pages/anime-episode"
import { ComicDetailPage } from "@/pages/comic-detail"
import { DashboardPage } from "@/pages/dashboard"
import { ExplorePage } from "@/pages/explore"
import { HomePage } from "@/pages/home"
import { LibraryPage } from "@/pages/library"
import { NotFoundPage } from "@/pages/not-found"
import { ReaderPage } from "@/pages/reader"

function ScrollToTop() {
  const { pathname } = useLocation()

  React.useEffect(() => {
    if (!pathname.startsWith("/baca/")) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    }
  }, [pathname])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <ScrollToTop />
            <AppShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/jelajah" element={<ExplorePage />} />
                <Route path="/komik/:slug" element={<ComicDetailPage />} />
                <Route path="/baca/:slug/:chapterSlug" element={<ReaderPage />} />
                <Route path="/koleksi" element={<LibraryPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/anime/episode/:episodeId" element={<AnimeEpisodePage />} />
                <Route path="/anime/:animeId" element={<AnimeDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppShell>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </LibraryProvider>
    </ThemeProvider>
  )
}
