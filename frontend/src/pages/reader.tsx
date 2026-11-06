import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  List,
  Loader2,
  Moon,
  Sun,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApiQuery } from "@/hooks/use-api-query"
import { useLibrary } from "@/hooks/use-library"
import { useTheme } from "@/components/theme-provider"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { ChapterDetail, ComicDetail } from "@/lib/types"

export function ReaderPage() {
  const { slug = "", chapterSlug = "" } = useParams()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { refresh } = useLibrary()
  const { t } = useI18n()
  const [progress, setProgress] = React.useState(0)

  const {
    data: chapter,
    loading,
    error,
  } = useApiQuery<ChapterDetail>(`/chapters/${encodeURIComponent(chapterSlug)}/`)
  const { data: comic } = useApiQuery<ComicDetail>(`/comics/${encodeURIComponent(slug)}/`)

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
    setProgress(0)
  }, [chapterSlug])

  React.useEffect(() => {
    if (chapter) void refresh()
  }, [chapter, refresh])

  React.useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const next = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0
      setProgress(next)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [chapter])

  const goToChapter = React.useCallback(
    (target: string | null | undefined) => {
      if (!target) return
      navigate(`/baca/${encodeURIComponent(slug)}/${encodeURIComponent(target)}`)
    },
    [navigate, slug],
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) {
        return
      }
      if (event.key === "ArrowLeft" && chapter?.previous_chapter) {
        goToChapter(chapter.previous_chapter)
      }
      if (event.key === "ArrowRight" && chapter?.next_chapter) {
        goToChapter(chapter.next_chapter)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [chapter, goToChapter])

  const chapters = comic?.chapters ?? []

  return (
    <div className="min-h-dvh bg-[#0a0a0c] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-2 px-2.5 sm:gap-3 sm:px-4">
          <Link
            to={`/komik/${encodeURIComponent(slug)}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label={t("Kembali ke detail komik")}
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold leading-tight text-zinc-200">
              {chapter?.comic?.title || comic?.title || chapter?.manga_title || t("Memuat…")}
            </p>
            <p className="truncate text-[10.5px] font-medium text-zinc-500">
              {chapter?.chapter_title || t("Chapter")}
              {chapter?.page_count ? ` · ${t("{count} gambar", { count: chapter.page_count })}` : ""}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {chapters.length > 0 ? (
              <Select value={chapterSlug} onValueChange={goToChapter}>
                <SelectTrigger className="h-9 w-[148px] border-white/15 bg-white/5 text-[11px] text-zinc-200 focus:ring-primary/40 sm:w-[180px]">
                  <SelectValue placeholder={t("Pilih chapter")} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {chapters.map((item) => (
                    <SelectItem key={item.slug} value={item.slug} className="text-xs">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            <Link
              to={`/komik/${encodeURIComponent(slug)}`}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[11px] font-bold text-zinc-300 transition hover:bg-white/10 sm:inline-flex"
            >
              <List className="h-3.5 w-3.5" />
              {t("Chapter")}
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label={t("Ganti tema")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-white/[0.06]">
          <div
            className="h-full bg-primary transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-medium">{t("Menyiapkan halaman…")}</p>
        </div>
      ) : error ? (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
            <ImageOff className="h-6 w-6 text-zinc-500" />
          </span>
          <h1 className="font-display text-xl font-bold">{t("Chapter tidak dapat dibuka")}</h1>
          <p className="text-sm text-zinc-500">{error}</p>
          <Button asChild className="mt-2">
            <Link to={`/komik/${encodeURIComponent(slug)}`}>{t("Kembali ke detail komik")}</Link>
          </Button>
        </div>
      ) : chapter ? (
        <>
          <div className="mx-auto flex max-w-[900px] flex-col gap-1.5 px-0 pb-6 pt-1 sm:px-4 sm:pt-4">
            {chapter.images.map((src, index) => (
              <ReaderImage key={`${src}-${index}`} src={src} index={index} />
            ))}
          </div>

          <div className="mx-auto max-w-[900px] px-4 pb-16">
            <div className="rounded-[5px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    {t("Chapter selesai")}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-white">
                    {chapter.chapter_title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {t("Progres Anda tersimpan otomatis. {percent}% halaman telah dibaca.", {
                      percent: progress.toFixed(0),
                    })}
                  </p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white sm:flex-none"
                    disabled={!chapter.previous_chapter}
                    onClick={() => goToChapter(chapter.previous_chapter)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("Sebelumnya")}
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none"
                    disabled={!chapter.next_chapter}
                    onClick={() => goToChapter(chapter.next_chapter)}
                  >
                    {t("Selanjutnya")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {chapters.length > 0 ? (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    {t("Pindah ke chapter")}
                  </p>
                  <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                    {chapters.slice(0, 40).map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => goToChapter(item.slug)}
                        className={cn(
                          "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                          item.slug === chapterSlug
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-white",
                        )}
                      >
                        {item.name.replace(/chapter/i, "Ch.")}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              <span className="h-px w-10 bg-white/10" />
              {t("Gunakan tombol ← → untuk berpindah chapter")}
              <span className="h-px w-10 bg-white/10" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function ReaderImage({ src, index }: { src: string; index: number }) {
  const { t } = useI18n()
  const [loaded, setLoaded] = React.useState(false)
  const [failed, setFailed] = React.useState(false)

  if (failed) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 text-center">
        <ImageOff className="h-5 w-5 text-zinc-600" />
        <p className="text-[11px] text-zinc-500">
          {t("Gambar halaman {page} gagal dimuat.", { page: index + 1 })}
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-[180px] w-full overflow-hidden bg-white/[0.02] sm:rounded-xl">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
        </div>
      ) : null}
      <img
        src={src}
        alt={t("Halaman {page}", { page: index + 1 })}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "mx-auto block h-auto w-full transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  )
}
