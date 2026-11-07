import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, Camera, Loader2, Mail, Save, Target, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { PageTransition } from "@/components/page-transition"
import { ProfilePlaylists } from "@/components/profile-playlists"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"

function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File harus berupa gambar."))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Ukuran gambar maksimal 5 MB."))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const size = 256
        const scale = Math.min(1, size / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("Gagal memproses gambar."))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      image.onerror = () => reject(new Error("Gagal membaca gambar."))
      image.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error("Gagal membaca file."))
    reader.readAsDataURL(file)
  })
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { t } = useI18n()
  const [name, setName] = React.useState(user?.name ?? "")
  const [avatar, setAvatar] = React.useState(user?.avatar ?? "")
  const [bio, setBio] = React.useState(user?.bio ?? "")
  const [weeklyGoal, setWeeklyGoal] = React.useState(String(user?.weekly_goal ?? 10))
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const fileInput = React.useRef<HTMLInputElement>(null)

  const initial = (name || user?.email || "I").trim().charAt(0).toUpperCase()
  const preferredGenres = user?.preferred_genres ?? []
  const genreLabel = (value: string) =>
    value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

  const pickAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      setError("")
      setAvatar(await resizeAvatar(file))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (name.trim().length < 2) {
      setError(t("Nama minimal 2 karakter."))
      return
    }
    const goal = Number(weeklyGoal)
    if (!Number.isInteger(goal) || goal < 1 || goal > 100) {
      setError(t("Target mingguan harus antara 1 dan 100 chapter."))
      return
    }

    setBusy(true)
    try {
      await updateProfile({ name: name.trim(), avatar, bio: bio.trim(), weekly_goal: goal })
      toast.success(t("Profil diperbarui"))
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">{t("Akun")}</p>
              <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
                {t("Profil Anda")}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {t("Atur nama, bio, target baca, dan playlist yang tampil di akun IamKomik.")}
              </p>
            </div>
            {user ? (
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to={`/u/${user.id}`}>
                  {t("Profil publik & lencana")}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>

          <form
            onSubmit={submit}
            className="mt-8 rounded-[5px] border border-border/70 bg-card p-5 sm:p-7"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 border border-border/70">
                <AvatarImage src={avatar} alt={name || t("Avatar profil")} />
                <AvatarFallback className="bg-primary/10 font-display text-2xl text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => void pickAvatar(event)}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                  <Camera className="h-3.5 w-3.5" />
                  {t("Pilih foto")}
                </Button>
                {avatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatar("")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("Hapus foto")}
                  </Button>
                ) : null}
                <p className="w-full text-[11px] text-muted-foreground">
                  {t("JPG, PNG, atau WebP. Foto akan diperkecil menjadi 256 px.")}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground/80">{t("Nama")}</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="pl-10"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground/80">{t("Email")}</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={user?.email ?? ""} className="pl-10" readOnly disabled />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {t("Email digunakan untuk masuk dan tidak dapat diubah dari halaman ini.")}
                </span>
              </label>

              <label className="block space-y-1.5">
                <span className="flex items-center justify-between gap-2 text-xs font-bold text-foreground/80">
                  <span>{t("Bio")}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{bio.length}/280</span>
                </span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder={t("Ceritakan sedikit tentang selera baca Anda.")}
                  className="w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-relaxed outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground/80">
                  {t("Target baca mingguan")}
                </span>
                <div className="relative">
                  <Target className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={weeklyGoal}
                    onChange={(event) => setWeeklyGoal(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {t("Jumlah chapter yang ingin Anda baca setiap minggu.")}
                </span>
              </label>

              <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-secondary/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground/80">{t("Kategori favorit")}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {preferredGenres.length
                      ? preferredGenres.map(genreLabel).join(", ")
                      : t("Belum diatur.")}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link to="/onboarding">{t("Atur kategori")}</Link>
                </Button>
              </div>
            </div>

            {error ? (
              <p className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {busy ? t("Menyimpan…") : t("Simpan profil")}
              </Button>
            </div>
          </form>

          <ProfilePlaylists />
        </div>
      </div>
    </PageTransition>
  )
}
