import * as React from "react"
import { Camera, Loader2, Mail, Save, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { PageTransition } from "@/components/page-transition"
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
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const fileInput = React.useRef<HTMLInputElement>(null)

  const initial = (name || user?.email || "I").trim().charAt(0).toUpperCase()

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

    setBusy(true)
    try {
      await updateProfile({ name: name.trim(), avatar })
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
          <p className="eyebrow">{t("Akun")}</p>
          <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
            {t("Profil Anda")}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t("Atur nama dan foto profil yang tampil di akun IamKomik.")}
          </p>

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
        </div>
      </div>
    </PageTransition>
  )
}
