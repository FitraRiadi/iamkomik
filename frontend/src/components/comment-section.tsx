import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Loader2, LogIn, MessageCircle, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/hooks/use-api-query"
import { api, getErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { formatRelative } from "@/lib/format"
import { useI18n } from "@/lib/i18n"
import type { CommentItem } from "@/lib/types"

interface CommentSectionProps {
  targetType: "comic" | "anime"
  targetId: string
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { user } = useAuth()
  const { t, language } = useI18n()
  const location = useLocation()
  const { data, loading, error, refetch } = useApiQuery<{ results: CommentItem[] }>(
    `/comments/?target_type=${encodeURIComponent(targetType)}&target_id=${encodeURIComponent(targetId)}`,
  )
  const [body, setBody] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  const comments = data?.results ?? []
  const next = encodeURIComponent(location.pathname + location.search)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const value = body.trim()
    if (value.length < 2) {
      setSubmitError(t("Komentar minimal 2 karakter."))
      return
    }
    setBusy(true)
    setSubmitError("")
    try {
      await api.post("/comments/", {
        target_type: targetType,
        target_id: targetId,
        body: value,
      })
      setBody("")
      toast.success(t("Komentar dikirim."))
      refetch()
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (commentId: number) => {
    if (!window.confirm(t("Hapus komentar ini?"))) return
    try {
      await api.delete(`/comments/${commentId}/`)
      refetch()
    } catch (requestError) {
      toast.error(getErrorMessage(requestError))
    }
  }

  return (
    <section className="rounded-[5px] border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <p className="eyebrow">{t("Diskusi")}</p>
          <h2 className="headline mt-1 text-xl">{t("Komentar pembaca")}</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          {comments.length}
        </span>
      </div>

      {user ? (
        <form onSubmit={submit} className="mt-4">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            placeholder={t("Tulis pendapat Anda tentang judul ini…")}
            className="min-h-[92px] w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-relaxed outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[10px] text-muted-foreground">{body.length}/1000</span>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {busy ? t("Mengirim…") : t("Kirim komentar")}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-border bg-secondary/30 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold">{t("Ingin ikut berdiskusi?")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("Masuk untuk menulis komentar dan melihat profil pembaca lain.")}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to={`/masuk?next=${next}`}>
              <LogIn className="h-3.5 w-3.5" />
              {t("Masuk")}
            </Link>
          </Button>
        </div>
      )}

      {submitError ? (
        <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs font-medium text-destructive">
          {submitError}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("Memuat komentar…")}
          </div>
        ) : error ? (
          <p className="py-4 text-xs text-destructive">{error}</p>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {t("Belum ada komentar. Jadilah yang pertama.")}
          </p>
        ) : (
          comments.map((comment) => {
            const initial = comment.author.name.trim().charAt(0).toUpperCase() || "P"
            const canDelete = Boolean(user && comment.author.id === user.id)
            return (
              <article
                key={comment.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3.5"
              >
                <Avatar className="h-9 w-9 border border-border/60">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">{initial}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {comment.author.id ? (
                      <Link
                        to={`/u/${comment.author.id}`}
                        className="text-xs font-bold hover:text-primary hover:underline"
                      >
                        {comment.author.name}
                      </Link>
                    ) : (
                      <span className="text-xs font-bold">{comment.author.name}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelative(comment.created_at, language)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                    {comment.body}
                  </p>
                </div>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("Hapus komentar")}
                    onClick={() => void remove(comment.id)}
                    className="shrink-0 text-muted-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
