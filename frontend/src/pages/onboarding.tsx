import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Target, UserRound } from "lucide-react"
import { toast } from "sonner"

import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApiQuery } from "@/hooks/use-api-query"
import { getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import type { Genre } from "@/lib/types"
import { cn } from "@/lib/utils"

const fallbackGenres: Genre[] = [
  { name: "Action", slug: "action" },
  { name: "Romance", slug: "romance" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Comedy", slug: "comedy" },
  { name: "Horror", slug: "horror" },
  { name: "Mystery", slug: "mystery" },
  { name: "Adventure", slug: "adventure" },
  { name: "Slice of Life", slug: "slice-of-life" },
]

const goalPresets = [3, 7, 14, 21]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const { t } = useI18n()
  const { data, loading } = useApiQuery<{ results: Genre[] }>("/comics/genres/")

  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState(user?.name ?? "")
  const [selected, setSelected] = React.useState<string[]>(user?.preferred_genres ?? [])
  const [goal, setGoal] = React.useState(String(user?.weekly_goal ?? 10))
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")

  const genres = React.useMemo(() => {
    const items = (data?.results ?? []).filter((genre) => genre.slug)
    return items.length ? items : fallbackGenres
  }, [data])

  const genreName = (slug: string) =>
    genres.find((genre) => genre.slug === slug)?.name ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

  const steps = [t("Nama"), t("Kategori"), t("Target"), t("Siap")]

  const toggleGenre = (slug: string) => {
    setSelected((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    )
  }

  const next = () => {
    setError("")
    if (step === 0 && name.trim().length < 2) {
      setError(t("Nama minimal 2 karakter."))
      return
    }
    if (step === 1 && selected.length === 0) {
      setError(t("Pilih minimal satu kategori."))
      return
    }
    if (step === 2) {
      const value = Number(goal)
      if (!Number.isInteger(value) || value < 1 || value > 100) {
        setError(t("Target mingguan harus antara 1 dan 100 chapter."))
        return
      }
    }
    setStep((current) => Math.min(current + 1, 3))
  }

  const finish = async () => {
    setError("")
    setBusy(true)
    try {
      await updateProfile({
        name: name.trim(),
        weekly_goal: Number(goal),
        preferred_genres: selected,
      })
      toast.success(t("Profil siap. Selamat membaca!"))
      navigate("/", { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageTransition>
      <div className="container py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">{t("Kenalan dulu")}</p>
          <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
            {t("Buat pengalaman baca yang pas untuk Anda.")}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t("Empat langkah singkat, lalu beranda akan menampilkan komik yang lebih sesuai dengan selera Anda.")}
          </p>

          <div className="mt-8 rounded-[5px] border border-border/70 bg-card p-5 shadow-float sm:p-8">
            <div className="flex items-center gap-2">
              {steps.map((label, index) => (
                <React.Fragment key={label}>
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold transition",
                        index < step && "border-primary bg-primary text-primary-foreground",
                        index === step && "border-primary bg-primary/10 text-primary",
                        index > step && "border-border bg-secondary text-muted-foreground",
                      )}
                    >
                      {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate text-[11px] font-bold sm:block",
                        index === step ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 ? (
                    <span
                      className={cn(
                        "h-px flex-1",
                        index < step ? "bg-primary" : "bg-border",
                      )}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-8">
              {step === 0 ? (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    {t("Langkah 1")}
                  </span>
                  <h2 className="headline mt-4 text-2xl">{t("Mau dipanggil siapa?")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("Nama ini tampil di profil dan sapaan beranda.")}
                  </p>
                  <label className="mt-5 block space-y-1.5">
                    <span className="text-xs font-bold text-foreground/80">{t("Nama")}</span>
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      placeholder={t("Nama panggilan")}
                      required
                    />
                  </label>
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("Langkah 2")}
                  </span>
                  <h2 className="headline mt-4 text-2xl">{t("Kategori apa yang Anda suka?")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("Pilih beberapa. Beranda akan memakai kategori ini untuk rekomendasi.")}
                  </p>
                  {loading ? (
                    <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("Memuat kategori…")}
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {genres.map((genre) => {
                        const active = selected.includes(genre.slug)
                        return (
                          <button
                            key={genre.slug}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleGenre(genre.slug)}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-accent",
                            )}
                          >
                            <span className="truncate">{genre.name}</span>
                            {active ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                    <Target className="h-3.5 w-3.5" />
                    {t("Langkah 3")}
                  </span>
                  <h2 className="headline mt-4 text-2xl">{t("Target baca mingguan")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("Tentukan berapa chapter yang ingin Anda selesaikan setiap minggu.")}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {goalPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGoal(String(preset))}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-bold transition",
                          Number(goal) === preset
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-accent",
                        )}
                      >
                        {t("{count} chapter", { count: preset })}
                      </button>
                    ))}
                  </div>
                  <label className="mt-5 block max-w-[180px] space-y-1.5">
                    <span className="text-xs font-bold text-foreground/80">{t("Atau isi sendiri")}</span>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={goal}
                      onChange={(event) => setGoal(event.target.value)}
                      required
                    />
                  </label>
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                    <Check className="h-3.5 w-3.5" />
                    {t("Langkah 4")}
                  </span>
                  <h2 className="headline mt-4 text-2xl">{t("Profil siap!")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("Beranda Anda akan langsung menampilkan rekomendasi dari kategori pilihan.")}
                  </p>
                  <div className="mt-5 space-y-3 rounded-xl border border-border/70 bg-secondary/40 p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {t("Nama")}
                      </p>
                      <p className="mt-0.5 text-sm font-bold">{name.trim()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {t("Kategori")}
                      </p>
                      <p className="mt-0.5 text-sm font-bold">
                        {selected.map(genreName).join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {t("Target mingguan")}
                      </p>
                      <p className="mt-0.5 text-sm font-bold">
                        {t("{count} chapter per minggu", { count: Number(goal) })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <div className="mt-7 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0 || busy}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Kembali")}
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={next}>
                  {t("Lanjut")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={() => void finish()} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {busy ? t("Menyiapkan…") : t("Masuk ke beranda")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
