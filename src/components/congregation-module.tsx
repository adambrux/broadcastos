"use client"

import { useState } from "react"
import { Check, Church, MapPin, ShieldCheck, UserPlus, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShowProfile } from "@/lib/mock-data"

type AudienceSystem = NonNullable<ShowProfile["audienceSystem"]>

export function CongregationModule({ audience }: { audience: AudienceSystem }) {
  const [queue, setQueue] = useState([...audience.queue])
  const [addedNames, setAddedNames] = useState<string[]>([])

  function addToCongregation(name: string) {
    const person = queue.find((item) => item.name === name)
    if (!person) return

    setAddedNames((current) => [...current, name])
    setQueue((current) => current.filter((item) => item.name !== name))
  }

  return (
    <Card className="overflow-hidden rounded-[24px] py-0 shadow-card ring-border/80">
      <div className="grid xl:grid-cols-[.92fr_1.08fr]">
        <div className="soft-gradient border-b border-border/70 p-6 sm:p-8 xl:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-brand-indigo text-white hover:bg-brand-indigo">Permanent</Badge>
            <Badge variant="outline" className="bg-white/70">Cumulative every week</Badge>
          </div>
          <div className="mt-12 flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-indigo">
              <Church className="size-6" />
            </span>
            <div>
              <p className="text-xs font-medium text-brand-indigo">Audience community</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{audience.name}</h2>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">{audience.description}</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/80 p-4 ring-1 ring-border/70">
              <p className="text-[10px] text-muted-foreground">Regular listeners</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{(audience.total + addedNames.length).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 ring-1 ring-border/70">
              <p className="text-[10px] text-muted-foreground">Added this month</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{audience.newThisMonth + addedNames.length}</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 ring-1 ring-border/70">
              <p className="text-[10px] text-muted-foreground">Waiting</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{queue.length}</p>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-success-soft p-4 text-success">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p className="text-xs leading-5">The Roll Call never resets. Existing members stay in the Congregation, and approved listeners are added to every future Sunday roll call.</p>
          </div>
        </div>

        <div>
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-6 sm:px-8">
            <div>
              <CardTitle className="flex items-center gap-2"><UserPlus className="size-4 text-brand-magenta" />New Listener Queue</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Confirm regular listeners before adding them permanently.</p>
            </div>
            <Badge variant="secondary">{queue.length} waiting</Badge>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8">
            {queue.length > 0 ? (
              <div className="divide-y divide-border/70">
                {queue.map((listener) => (
                  <div key={listener.name} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-indigo">
                      <UsersRound className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{listener.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{listener.location}</span>
                        <span>·</span>
                        <span>{listener.joined}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addToCongregation(listener.name)}>
                      <UserPlus />
                      Add to Congregation
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center text-center">
                <div>
                  <span className="mx-auto grid size-11 place-items-center rounded-full bg-success-soft text-success"><Check className="size-5" /></span>
                  <p className="mt-4 text-sm font-medium">Queue cleared</p>
                  <p className="mt-1 text-xs text-muted-foreground">Every listener has joined the Sunday Show Congregation.</p>
                </div>
              </div>
            )}
            {addedNames.length > 0 && (
              <div className="mt-3 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-xs text-success">
                {addedNames.at(-1)} is now a permanent member of the Sunday Show Congregation.
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
