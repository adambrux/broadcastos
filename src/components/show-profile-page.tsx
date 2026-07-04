"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileAudio,
  FileText,
  FolderOpen,
  HeartHandshake,
  Mic2,
  Radio,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CongregationModule } from "@/components/congregation-module"
import { BroadcastLiveModule } from "@/components/broadcast-live-module"
import { ProducerOSModule } from "@/components/producer-os-module"
import { SaturdayProductionModule } from "@/components/saturday-production-module"
import { SundaySchoolModule } from "@/components/sunday-school-module"
import type { ShowProfile } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const assetStatus = {
  Ready: "bg-success-soft text-success",
  "In progress": "bg-brand-soft text-brand-indigo",
  "Needs review": "bg-amber-50 text-amber-700",
} as const

const reviewStatus = {
  Approved: "bg-success-soft text-success",
  Pending: "bg-muted text-muted-foreground",
  "In review": "bg-brand-soft text-brand-indigo",
} as const

export function ShowProfilePage({ show }: { show: ShowProfile }) {
  const [rundownOpen, setRundownOpen] = useState(false)
  const [completedReviews, setCompletedReviews] = useState<string[]>([])

  function toggleReview(name: string) {
    setCompletedReviews((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    )
  }

  return (
    <div className="space-y-5">
      <Link href="/shows" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        All shows
      </Link>

      <section className="soft-gradient overflow-hidden rounded-[26px] border border-brand-indigo/10 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-soft text-brand-indigo hover:bg-brand-soft">Premier Gospel</Badge>
              <Badge variant="outline" className="bg-white/70">{show.audienceSystem ? "Flagship template" : "Show profile"}</Badge>
            </div>
            <h1 className="text-balance text-[38px] font-semibold tracking-[-0.05em] sm:text-[54px]">{show.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{show.summary}</p>
            {show.mission && (
              <div className="mt-5 max-w-2xl rounded-2xl border border-white/70 bg-white/55 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-indigo">Mission</p>
                <p className="mt-2 text-sm font-medium leading-6">{show.mission}</p>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-brand-indigo" />{show.time}</span>
              <span className="inline-flex items-center gap-2"><Mic2 className="size-4 text-brand-indigo" />{show.presenter}</span>
              <span className="inline-flex items-center gap-2"><Radio className="size-4 text-brand-indigo" />Produced by {show.producer}</span>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => setRundownOpen((current) => !current)}
            className="primary-action h-12 shrink-0 rounded-xl px-5 text-white"
          >
            {rundownOpen ? <Check /> : <AudioLines />}
            {rundownOpen ? "Rundown ready" : "Open rundown"}
          </Button>
        </div>
      </section>

      {show.audienceSystem && <CongregationModule audience={show.audienceSystem} />}

      <div className="grid gap-5 xl:grid-cols-[.75fr_1.35fr]">
        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-brand-magenta" />Show DNA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Presenter</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium"><UserRound className="size-4 text-brand-indigo" />{show.presenter}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Producer</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium"><HeadphonesIcon />{show.producer}</p>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Tone</p>
              <div className="flex flex-wrap gap-2">
                {show.tone.map((tone) => <Badge key={tone} variant="secondary" className="rounded-full px-3 py-1">{tone}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
            <CardTitle className="flex items-center gap-2"><Clock3 className="size-4 text-brand-indigo" />Running order</CardTitle>
            <span className="text-xs text-muted-foreground">{show.time}</span>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="divide-y divide-border/70">
              {show.runningOrder.map((item, index) => (
                <Fragment key={`${item.time}-${item.title}`}>
                  {item.hour && (
                    <div className="flex items-center justify-between bg-muted/50 px-3 py-2.5">
                      <span className="text-xs font-semibold text-brand-indigo">{item.hour}</span>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Live clock</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[54px_28px_1fr] gap-3 py-3.5">
                    <span className="pt-0.5 font-mono text-[11px] text-muted-foreground">{item.time}</span>
                    <span className={cn("grid size-7 place-items-center rounded-full text-[10px] font-semibold", index === 0 ? "bg-brand-indigo text-white" : "bg-brand-soft text-brand-indigo")}>{index + 1}</span>
                    <span>
                      <span className="block text-sm font-medium">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.note}</span>
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {show.sundaySchool && <SundaySchoolModule module={show.sundaySchool} />}
      {show.producerOS && <ProducerOSModule cards={show.producerOS} />}
      {show.broadcastLive && <BroadcastLiveModule live={show.broadcastLive} />}
      {show.productionLinks && show.presenterStyle && (
        <SaturdayProductionModule links={show.productionLinks} presenterStyle={show.presenterStyle} />
      )}

      <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
        <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-5">
          <CardTitle className="flex items-center gap-2"><HeartHandshake className="size-4 text-brand-magenta" />Core features</CardTitle>
          <Badge variant="outline">{show.features.length} formats</Badge>
        </CardHeader>
        <CardContent className="grid gap-px overflow-hidden rounded-xl bg-border p-px sm:grid-cols-2 lg:grid-cols-4">
          {show.features.map((feature, index) => (
            <div key={feature.name} className="min-h-36 bg-card p-5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-xs font-semibold text-brand-indigo">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-sm font-semibold">{feature.name}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="px-6 pb-3 pt-5"><CardTitle className="flex items-center gap-2"><Users className="size-4 text-brand-indigo" />Listeners</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 px-6 pb-6">
            {[
              ["Weekly reach", show.listeners.weekly],
              ["Peak live", show.listeners.peak],
              ["Voice notes", show.listeners.voiceNotes],
              ["Completion", show.listeners.completion],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted/60 p-4">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
            <CardTitle className="flex items-center gap-2"><FolderOpen className="size-4 text-brand-indigo" />Assets</CardTitle>
            <button className="text-xs font-medium text-brand-indigo">View folder</button>
          </CardHeader>
          <CardContent className="divide-y divide-border/70 px-6 pb-5">
            {show.assets.map((asset) => (
              <button key={asset.name} className="flex w-full items-center gap-3 py-3 text-left">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand-indigo">
                  {asset.type.startsWith("Audio") || asset.type.startsWith("Podcast") ? <FileAudio className="size-4" /> : <FileText className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{asset.name}</span>
                  <span className="text-[10px] text-muted-foreground">{asset.type}</span>
                </span>
                <Badge className={cn("text-[9px]", assetStatus[asset.status])}>{asset.status}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-indigo" />Review</CardTitle>
            <Badge className="bg-brand-soft text-brand-indigo">{show.review.length}</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border/70 px-6 pb-5">
            {show.review.map((item) => {
              const completed = completedReviews.includes(item.name)
              return (
                <button key={item.name} onClick={() => toggleReview(item.name)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className={cn("grid size-8 place-items-center rounded-full border transition-colors", completed ? "border-success bg-success text-white" : "border-border bg-white text-muted-foreground")}>
                    <Check className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-xs font-medium", completed && "text-muted-foreground line-through")}>{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.owner}</span>
                  </span>
                  <Badge className={cn("text-[9px]", completed ? "bg-success-soft text-success" : reviewStatus[item.status])}>{completed ? "Done" : item.status}</Badge>
                </button>
              )
            })}
            <Button variant="outline" className="mt-4 w-full">Open review queue <ArrowRight /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HeadphonesIcon() {
  return <AudioLines className="size-4 text-brand-indigo" />
}
