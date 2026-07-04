"use client"

import { useState } from "react"
import { AudioLines, ChevronRight, Clock3, Minus, Plus, Radio, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShowProfile } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function SaturdayProductionModule({
  links,
  presenterStyle,
}: {
  links: NonNullable<ShowProfile["productionLinks"]>
  presenterStyle: NonNullable<ShowProfile["presenterStyle"]>
}) {
  const [selected, setSelected] = useState(0)
  const link = links[selected]

  return (
    <Card className="overflow-hidden rounded-[24px] py-0 shadow-card ring-border/80">
      <CardHeader className="border-b border-border/70 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><AudioLines className="size-4 text-brand-indigo" />Saturday production notes</CardTitle>
            <p className="mt-1.5 text-xs text-muted-foreground">A sample hour of link cards, built for Jonathan’s natural delivery.</p>
          </div>
          <div className="flex max-w-xl flex-wrap justify-end gap-1.5">
            {presenterStyle.map((style) => <Badge key={style} variant="secondary" className="rounded-full">{style}</Badge>)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid p-0 xl:grid-cols-[300px_1fr]">
        <nav aria-label="Sample Saturday Breakfast links" className="border-b border-border/70 bg-muted/30 p-3 xl:border-b-0 xl:border-r">
          {links.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setSelected(index)}
              className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors", selected === index ? "bg-white shadow-sm ring-1 ring-border/70" : "hover:bg-white/70")}
            >
              <span className="font-mono text-[10px] text-muted-foreground">{item.time}</span>
              <span className="min-w-0 flex-1 text-xs font-medium">{item.title}</span>
              <ChevronRight className={cn("size-3.5", selected === index ? "text-brand-indigo" : "text-muted-foreground")} />
            </button>
          ))}
        </nav>
        <article className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-indigo">
                <Clock3 className="size-3.5" />{link.time} · {link.duration}
              </div>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{link.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">Out of: {link.outOf}</p>
            </div>
            <Badge variant="outline">{link.energy}</Badge>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <Detail label="Objective" value={link.objective} />
            <Detail label="Listener CTA" value={link.cta} />
          </div>

          <div className="mt-4 rounded-2xl bg-brand-soft/70 p-5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-indigo"><Sparkles className="size-3.5" />Suggested presenter wording</p>
            <blockquote className="mt-3 text-base font-medium leading-7 text-foreground">“{link.wording}”</blockquote>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Detail label="Key points" value={link.keyPoints.join(" · ")} />
            <Detail label="Transition line" value={link.transition} />
            <Detail label="Producer note" value={link.producerNote} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/80 p-4">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><Minus className="size-3.5" />If short</p>
              <p className="mt-2 text-xs leading-5">{link.dropIfShort}</p>
            </div>
            <div className="rounded-xl border border-border/80 p-4">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><Plus className="size-3.5" />If running light</p>
              <p className="mt-2 text-xs leading-5">{link.addIfLight}</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-neutral-950 p-4 text-white">
            <Radio className="mt-0.5 size-4 shrink-0 text-brand-magenta" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Audio / bed / jingle</p>
              <p className="mt-1.5 text-xs leading-5 text-white/80">{link.audio}</p>
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xs leading-5">{value}</p>
    </div>
  )
}
