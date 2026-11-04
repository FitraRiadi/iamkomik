import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  AreaChart,
  BadgeDelta,
  BarChart,
  Card as TremorCard,
  DonutChart,
  Metric,
  ProgressBar,
  Text,
  Title,
} from "@tremor/react"
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Clock3,
  Flame,
  History,
  Library,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { useLibrary } from "@/hooks/use-library"
import { formatMinutes, formatRelative, greeting } from "@/lib/format"
import type { StatsPayload } from "@/lib/types"
import { cn } from "@/lib/utils"

const chartColors = ["rose", "zinc", "amber", "sky", "violet", "emerald"]

export function DashboardPage() {
  const { data, loading, error, refetch } = useApiQuery<StatsPayload>("/stats/")
  const { history } = useLibrary()

  const totals = data?.totals
  const hasData = Boolean(
    totals && (totals.chapters_read > 0 || totals.comics_read > 0 || totals.favorites > 0),
  )

  const lastChapter = history[0]
  const weekly = (data?.series ?? []).slice(-7).reduce((sum, item) => sum + item.Dibaca, 0)
  const dailyAverage = weekly ? (weekly / 7).toFixed(1) : "0"
  const goal = 10

  return (
    <PageTransition>
      <div className="container pt-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Reading insights</p>
            <h1 className="headline mt-2 text-4xl text-balance sm:text-5xl">
              {greeting()}, Fit.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Ini ringkasan kebiasaan baca lo. Semua dihitung dari aktivitas nyata di perangkat
              ini — bukan data karangan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lastChapter ? (
              <Button asChild size="sm">
                <Link to={`/baca/${encodeURIComponent(lastChapter.comic_slug)}/${encodeURIComponent(lastChapter.chapter_slug)}`}>
                  <BookOpen className="h-3.5 w-3.5" />
                  Lanjut baca
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/jelajah">
                  <Search className="h-3.5 w-3.5" />
                  Cari komik
                </Link>
              </Button>
            )}
          </div>
        </section>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="mt-8">
            <EmptyState
              icon={History}
              title="Statistik belum bisa dimuat"
              description={error}
              actionLabel="Coba lagi"
              actionHref="/dashboard"
            >
              <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
                Muat ulang
              </Button>
            </EmptyState>
          </div>
        ) : !hasData ? (
          <div className="mt-8">
            <EmptyState
              icon={Sparkles}
              title="Belum ada jejak bacaan"
              description="Buka satu chapter komik dulu, statistik, streak, dan genre favorit lo bakal otomatis muncul di sini."
              actionLabel="Mulai jelajah"
              actionHref="/jelajah"
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                index={0}
                icon={BookOpen}
                label="Chapter dibaca"
                value={totals?.chapters_read ?? 0}
                hint={`${weekly} chapter minggu ini`}
                delta={data?.delta_chapters ?? 0}
              />
              <KpiCard
                index={1}
                icon={Library}
                label="Komik dijelajahi"
                value={totals?.comics_read ?? 0}
                hint="judul punya riwayat baca"
              />
              <KpiCard
                index={2}
                icon={Bookmark}
                label="Komik favorit"
                value={totals?.favorites ?? 0}
                hint="disimpan di koleksi"
              />
              <KpiCard
                index={3}
                icon={Flame}
                label="Streak baca"
                value={totals?.streak_days ?? 0}
                hint="hari beruntun"
                suffix="hari"
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <TremorCard className="rounded-[5px] !border-border/70 !ring-border/70 bg-card p-5 lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Title className="font-display text-lg font-bold">Aktivitas 14 hari</Title>
                    <Text className="text-xs text-muted-foreground">
                      Chapter yang dibaca vs komik yang dibuka.
                    </Text>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Dibaca
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-zinc-400" />
                      Dilihat
                    </span>
                  </div>
                </div>
                <AreaChart
                  className="mt-5 h-64 [&_text]:!fill-muted-foreground"
                  data={data?.series ?? []}
                  index="date"
                  categories={["Dibaca", "Dilihat"]}
                  colors={["rose", "zinc"]}
                  valueFormatter={(value: number) => `${value}`}
                  showLegend={false}
                  showGridLines={false}
                  curveType="natural"
                  padding={{ left: 0, right: 14 }}
                  showAnimation
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    Rata-rata {dailyAverage} chapter/hari
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    Estimasi {formatMinutes(totals?.reading_minutes ?? 0)} membaca
                  </span>
                </div>
              </TremorCard>

              <TremorCard className="rounded-[5px] !border-border/70 !ring-border/70 bg-card p-5">
                <Title className="font-display text-lg font-bold">Tipe komik</Title>
                <Text className="text-xs text-muted-foreground">Dari favorit + riwayat baca.</Text>
                {data?.types?.length ? (
                  <DonutChart
                    className="mt-4 h-52"
                    data={data.types}
                    category="value"
                    index="name"
                    colors={chartColors}
                    valueFormatter={(value: number) => `${value} komik`}
                    showLabel={false}
                    showAnimation
                  />
                ) : (
                  <div className="mt-8 flex h-40 flex-col items-center justify-center gap-2 text-center">
                    <Library className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">Tipe komik belum terdeteksi.</p>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                  {(data?.types ?? []).map((item, index) => (
                    <span key={item.name} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          ["bg-rose-500", "bg-zinc-400", "bg-amber-400", "bg-sky-400", "bg-violet-400", "bg-emerald-400"][index % 6],
                        )}
                      />
                      {item.name}
                    </span>
                  ))}
                </div>
              </TremorCard>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <TremorCard className="rounded-[5px] !border-border/70 !ring-border/70 bg-card p-5">
                <Title className="font-display text-lg font-bold">Genre teratas</Title>
                <Text className="text-xs text-muted-foreground">
                  Genre yang paling sering lo buka.
                </Text>
                {data?.genres?.length ? (
                  <BarChart
                    className="mt-4 h-64 [&_text]:!fill-muted-foreground"
                    data={data.genres}
                    index="name"
                    categories={["value"]}
                    colors={["rose"]}
                    layout="vertical"
                    valueFormatter={(value: number) => `${value} komik`}
                    showLegend={false}
                    showGridLines={false}
                    yAxisWidth={104}
                    showAnimation
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
                    Genre belum tersedia.
                  </div>
                )}
              </TremorCard>

              <TremorCard className="rounded-[5px] !border-border/70 !ring-border/70 bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Title className="font-display text-lg font-bold">Paling sering dibaca</Title>
                    <Text className="text-xs text-muted-foreground">Top 5 judul.</Text>
                  </div>
                  <Target className="h-5 w-5 text-primary" />
                </div>
                {(data?.top_comics ?? []).length ? (
                  <div className="mt-5 space-y-4">
                    {(data?.top_comics ?? []).map((comic, index) => {
                      const max = data?.top_comics?.[0]?.reads || 1
                      return (
                        <div key={comic.slug}>
                          <div className="flex items-center justify-between gap-3">
                            <Link
                              to={`/komik/${encodeURIComponent(comic.slug)}`}
                              className="line-clamp-1 text-xs font-semibold transition hover:text-primary"
                            >
                              {index + 1}. {comic.title}
                            </Link>
                            <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
                              {comic.reads}x
                            </span>
                          </div>
                          <ProgressBar
                            value={(comic.reads / max) * 100}
                            color="rose"
                            className="mt-1.5 h-1.5"
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
                    Belum ada chapter yang dibaca.
                  </div>
                )}

                <div className="mt-6 rounded-[5px] bg-secondary/60 p-4">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>Target mingguan</span>
                    <span className="text-primary">
                      {weekly}/{goal} chapter
                    </span>
                  </div>
                  <ProgressBar
                    value={Math.min(100, (weekly / goal) * 100)}
                    color={weekly >= goal ? "emerald" : "rose"}
                    className="mt-2 h-2"
                  />
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {weekly >= goal
                      ? "Target tercapai. Gila, konsisten banget."
                      : `Kurang ${goal - weekly} chapter lagi buat capai target.`}
                  </p>
                </div>
              </TremorCard>

              <TremorCard className="rounded-[5px] !border-border/70 !ring-border/70 bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Title className="font-display text-lg font-bold">Aktivitas terakhir</Title>
                    <Text className="text-xs text-muted-foreground">10 kejadian terbaru.</Text>
                  </div>
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-4 space-y-1">
                  {(data?.recent ?? []).slice(0, 8).map((event, index) => (
                    <div
                      key={`${event.created_at}-${index}`}
                      className="flex items-start gap-2.5 rounded-xl px-1 py-2 transition hover:bg-secondary/50"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                          event.event_type === "chapter_read"
                            ? "bg-rose-500/10 text-rose-500"
                            : event.event_type === "favorite"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {event.event_type === "chapter_read" ? (
                          <BookOpen className="h-3 w-3" />
                        ) : event.event_type === "favorite" ? (
                          <Bookmark className="h-3 w-3" />
                        ) : (
                          <Clock3 className="h-3 w-3" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[11px] font-semibold">
                          {event.label}
                          {event.title ? <span className="font-normal text-muted-foreground"> · {event.title}</span> : null}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatRelative(event.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TremorCard>
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[5px] border border-border/60 bg-gradient-to-br from-card to-accent/40 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">Koleksi lo tersimpan otomatis</p>
                  <p className="text-xs text-muted-foreground">
                    Riwayat baca dan komik favorit tetap rapi di satu tempat.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/koleksi">
                  Buka koleksi
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  suffix,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  hint: string
  delta?: number
  suffix?: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <TremorCard className="group relative overflow-hidden rounded-[5px] !border-border/70 !ring-border/70 bg-card p-5 transition hover:border-primary/25 hover:shadow-pin">
        <div className="flex items-start justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-accent-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          {typeof delta === "number" ? (
            <BadgeDelta
              deltaType={delta > 0 ? "increase" : delta < 0 ? "decrease" : "unchanged"}
              className="text-[10px]"
            >
              {delta > 0 ? "+" : ""}
              {delta}%
            </BadgeDelta>
          ) : null}
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          <Metric className="font-display text-4xl font-bold tracking-tight">{value}</Metric>
          {suffix ? <span className="text-xs font-semibold text-muted-foreground">{suffix}</span> : null}
        </div>
        <Text className="mt-0.5 text-xs font-semibold text-foreground/80">{label}</Text>
        <Text className="mt-0.5 text-[10.5px] text-muted-foreground">{hint}</Text>
      </TremorCard>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-[5px]" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[360px] rounded-[5px] lg:col-span-2" />
        <Skeleton className="h-[360px] rounded-[5px]" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[340px] rounded-[5px]" />
        <Skeleton className="h-[340px] rounded-[5px]" />
        <Skeleton className="h-[340px] rounded-[5px]" />
      </div>
    </>
  )
}
