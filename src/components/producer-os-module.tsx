import { ClipboardList, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShowProfile } from "@/lib/mock-data"

export function ProducerOSModule({ cards }: { cards: NonNullable<ShowProfile["producerOS"]> }) {
  return (
    <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
      <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-5">
        <div>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="size-4 text-brand-indigo" />ProducerOS</CardTitle>
          <p className="mt-1.5 text-xs text-muted-foreground">Today’s editorial prep, ready for air.</p>
        </div>
        <Badge variant="outline">{cards.length} cards</Badge>
      </CardHeader>
      <CardContent className="grid gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-border/80 bg-muted/30 p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-indigo">
              <Target className="size-3.5" />
              {card.label}
            </div>
            <p className="mt-3 text-sm font-medium leading-5">{card.value}</p>
            <p className="mt-3 border-t border-border/70 pt-3 text-[11px] leading-5 text-muted-foreground">{card.note}</p>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}
