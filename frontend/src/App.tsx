import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import * as React from "react"

import { AppShell } from "@/components/layout/app-shell"
import { RequireAuth } from "@/components/require-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LibraryProvider } from "@/hooks/use-library"
import { AuthProvider } from "@/lib/auth"
import { I18nProvider } from "@/lib/i18n"
import { AnimePage } from "@/pages/anime"
import { AnimeDetailPage } from "@/pages/anime-detail"
import { AnimeEpisodePage } from "@/pages/anime-episode"
import { ComicDetailPage } from "@/pages/comic-detail"
import { DashboardPage } from "@/pages/dashboard"
import { ExplorePage } from "@/pages/explore"
import { HomePage } from "@/pages/home"
import { LibraryPage } from "@/pages/library"
import { LoginPage } from "@/pages/login"
import { NotFoundPage } from "@/pages/not-found"
import { OnboardingPage } from "@/pages/onboarding"
import { PlaylistDetailPage } from "@/pages/playlist-detail"
import { ProfilePage } from "@/pages/profile"
import { PublicProfilePage } from "@/pages/public-profile"
import { ReaderPage } from "@/pages/reader"
import { RegisterPage } from "@/pages/register"

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
      <I18nProvider>
        <AuthProvider>
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
                    <Route path="/koleksi" element={<RequireAuth><LibraryPage /></RequireAuth>} />
                    <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                    <Route path="/profil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                    <Route path="/u/:userId" element={<PublicProfilePage />} />
                    <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
                    <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
                    <Route path="/masuk" element={<LoginPage />} />
                    <Route path="/daftar" element={<RegisterPage />} />
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
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
