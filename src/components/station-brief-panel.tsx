"use client"

import { useState } from "react"
import { Check, ChevronDown, GripVertical, Megaphone, Plus, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const briefItems = [
  { id: "liner", type: "Station liner", title: "Hope is here this summer", detail: "Approved weekly briefing liner · 00:20", suggested: "11:19 · Station liner" },
  { id: "prayer", type: "Prayer point", title: "Families waiting for difficult news", detail: "Use without names unless consent is confirmed", suggested: "09:24 · opening prayer" },
  { id: "campaign", type: "Campaign", title: "Premier Marketplace summer reading", detail: "P2 live read · supplied 30-second copy", suggested: "10:52 · Listener answers" },
  { id: "reminder", type: "Reminder", title: "Mention Premier Plus catch-up", detail: "One natural mention, away from another CTA", suggested: "11:42 · Song requests" },
] as const

const showLinks = [
  "09:24 · Opening prayer",
  "10:52 · Listener answers",
  "11:19 · Station liner",
  "11:42 · Song requests",
]

export function StationBriefPanel() {
  const [assignments, setAssignments] = useState<Record<string, string>>(
    Object.fromEntries(briefItems.map((item) => [item.id, item.suggested]))
  )
  const [notice, setNotice] = useState("")

  return (
    <Card className="rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80">
      <CardHeader className="flex flex-row items-start justify-between px-5 pb-3 pt-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm"><Megaphone className="size-4 text-brand-indigo" />Station brief</CardTitle>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Drag an item or assign it to a specific show link.</p>
        </div>
        <Badge variant="outline">{briefItems.length} items</Badge>
      </CardHeader>
      <CardContent className="space-y-2 px-5 pb-5">
        {briefItems.map((item) => (
          <article key={item.id} draggable className="rounded-2xl border bg-white p-3.5">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground/55" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-indigo">{item.type}</p>
                  <Sparkles className="size-3 text-brand-magenta" />
                </div>
                <p className="mt-1 text-xs font-semibold">{item.title}</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{item.detail}</p>
              </div>
            </div>
            <div className="relative mt-3">
              <select
                aria-label={`Assign ${item.title}`}
                value={assignments[item.id]}
                onChange={(event) => {
                  setAssignments((current) => ({ ...current, [item.id]: event.target.value }))
                  setNotice(`${item.title} assigned to ${event.target.value}.`)
                }}
                className="h-9 w-full appearance-none rounded-xl border bg-muted/35 pl-3 pr-8 text-[10px] font-medium outline-none focus:ring-2 focus:ring-ring/30"
              >
                {showLinks.map((link) => <option key={link}>{link}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-3.5 text-muted-foreground" />
            </div>
          </article>
        ))}
        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setNotice("A blank station brief item is ready to edit.")}>
          <Plus />
          Add brief item
        </Button>
        {notice && <div role="status" className="flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-[10px] leading-4 text-success"><Check className="mt-0.5 size-3 shrink-0" />{notice}</div>}
      </CardContent>
    </Card>
  )
}
