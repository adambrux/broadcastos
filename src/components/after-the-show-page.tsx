"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, HeartHandshake, Inbox, MessageCircle, Radio } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PastoralCarePanel } from "@/components/pastoral-care-panel"
import { StudioAmbient } from "@/components/studio-motion"
import { useListenerMessages } from "@/lib/listener-messages"
import { useParkedNotes } from "@/lib/parked-notes"
import { usePastoralCare } from "@/lib/listener-log"

/**
 * AFTER THE SHOW (v2.46). The page Adam lands on when the show is done: the
 * family who have gone quiet, each with a check-in written and ready to copy,
 * plus today's numbers. Prompted from the final link and the end-of-show
 * screen, so it is part of leaving the studio.
 */
export function AfterTheShowPage() {
  const care = usePastoralCare()
  const bank = useListenerMessages()
  const pocket = useParkedNotes()
  const [today, setToday] = useState("")
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)) }, [])

  const bankedToday = bank.messages.filter((message) => message.createdAt.slice(0, 10) === today)
  const readToday = bankedToday.filter((message) => message.usedAt)
  const anotherDay = pocket.open.filter((note) => note.when === "another-day")
  const floorLabel = care.floor ? new Date(`${care.floor}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : ""

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-card sm:p-8">
        <StudioAmbient />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge className="border-white/10 bg-white/10 text-white"><HeartHandshake />After the show</Badge>
            <h1 className="mt-5 text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">
              {care.loading ? "Checking who's gone quiet…" : care.mia.length ? `${care.mia.length} ${care.mia.length === 1 ? "person" : "people"} to message before you go.` : "Nobody's missing today."}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Everyone who has ever messaged in is on the watch list. A week of silence puts them here with a check-in written for you. Copy it, send it from your phone, mark it sent.
              {floorLabel && ` The list has been counting since ${floorLabel}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-11 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/today">Today</Link>
            </Button>
            <Button asChild className="h-11 rounded-xl bg-white px-5 text-ink hover:bg-white/90">
              <Link href="/broadcast"><Radio />On Air</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[22px] py-0 shadow-card">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Messages today</p>
            <p className="mt-2 text-3xl font-semibold">{bankedToday.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{readToday.length} read on air</p>
          </CardContent>
        </Card>
        <Card className="rounded-[22px] py-0 shadow-card">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pocket, for another day</p>
            <p className="mt-2 text-3xl font-semibold">{anotherDay.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">The producer reads these for the next plan</p>
          </CardContent>
        </Card>
        <Card className="rounded-[22px] py-0 shadow-card">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Family on the watch list</p>
            <p className="mt-2 text-3xl font-semibold">{care.totals.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Everyone who has ever messaged in</p>
          </CardContent>
        </Card>
      </div>

      <PastoralCarePanel />

      {anotherDay.length > 0 && (
        <Card className="rounded-[22px] py-0 shadow-card">
          <CardContent className="p-5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Inbox className="size-3.5" />Parked for another day</p>
            <ul className="mt-3 space-y-2">
              {anotherDay.map((note) => (
                <li key={note.id} className="rounded-xl bg-muted/30 p-3 text-sm leading-6">
                  {note.sender && <span className="font-semibold">{note.sender}: </span>}{note.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" />Need to bank a late one? <Link href="/producer" className="inline-flex items-center gap-1 font-semibold text-brand-indigo hover:underline">Messages on the Desk <ArrowRight className="size-3" /></Link>
      </p>
    </div>
  )
}
