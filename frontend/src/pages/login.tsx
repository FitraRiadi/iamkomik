import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, BookmarkCheck, KeyRound, Loader2, Mail, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, login } = useAuth()
  const { t } = useI18n()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")

  const next = searchParams.get("next") || "/koleksi"

  React.useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [navigate, next, user])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (!email.trim()) {
      setError(t("Email wajib diisi."))
      return
    }
    if (!password) {
      setError(t("Password wajib diisi."))
      return
    }

    setBusy(true)
    try {
      await login(email.trim(), password)
      toast.success(t("Berhasil masuk. Selamat baca!"))
      navigate(next, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageTransition>
      <div className="container py-10 sm:py-14">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[5px] border border-border/70 bg-card shadow-float lg:grid-cols-[1fr_1.05fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-rose-700 p-9 text-primary-foreground lg:block">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-white/15 font-display text-base font-extrabold">
                  ik
                </span>
                <span className="font-display text-2xl font-extrabold tracking-[-0.04em]">
                  iamkomik<span className="text-white/70">.</span>
                </span>
              </Link>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("Akun")}
                </span>
                <h2 className="headline mt-4 text-4xl leading-tight text-white">
                  {t("Bacaan lo, rapi di sini.")}
                </h2>
                <ul className="mt-6 space-y-3 text-sm text-white/85">
                  {[
                    t("Koleksi dan riwayat tersinkron ke akun."),
                    t("Bisa lanjut baca di perangkat lain."),
                    t("Data perangkat lama otomatis digabung."),
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <BookmarkCheck className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-white/60">IamKomik · React + Django + Supabase</p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <p className="eyebrow">{t("Masuk")}</p>
            <h1 className="headline mt-2 text-3xl text-balance sm:text-4xl">
              {t("Selamat datang kembali")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("Masuk ke akun IamKomik buat sinkronin koleksi dan riwayat baca lo.")}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground/80">{t("Email")}</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground/80">{t("Password")}</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </label>

              {error ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {busy ? t("Mencoba masuk…") : t("Masuk")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("Belum punya akun?")}{" "}
              <Link to="/daftar" className="font-bold text-primary hover:underline">
                {t("Daftar sekarang")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
