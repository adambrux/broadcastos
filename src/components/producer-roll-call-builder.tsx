"use client"

import Link from "next/link"
import { useState } from "react"
import {
  AlertTriangle,
  Check,
  Church,
  MapPin,
  Mic2,
  UserPlus,
  UsersRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { rollCallMembers, rollCallQueue } from "@/lib/content-library"

type CongregationMember = {
  name: string
  location: string
  pronunciation?: string
  family?: string
  newThisWeek?: boolean
}

const permanentMembers: CongregationMember[] = rollCallMembers.map((member) => ({
  name: `${member.title ? `${member.title} ` : ""}${member.name}`,
  location: member.location,
  pronunciation: member.pronunciation,
  family: member.familyGroup ?? member.locationNote,
  newThisWeek: member.newAddition,
}))

const initialQueue: CongregationMember[] = rollCallQueue.map((member) => ({
  name: `${member.title ? `${member.title} ` : ""}${member.name}`,
  location: member.location,
  pronunciation: member.pronunciation,
  family: member.familyGroup ?? member.locationNote,
}))

export function ProducerRollCallBuilder() {
  const [members, setMembers] = useState(permanentMembers)
  const [queue, setQueue] = useState(initialQueue)
  const [selected, setSelected] = useState(permanentMembers.slice(0, 4).map((member) => member.name))
  const [notice, setNotice] = useState("")

  function addToRollCall(member: CongregationMember) {
    const duplicate = members.some((item) => item.name.toLowerCase() === member.name.toLowerCase())
    if (duplicate) {
      setNotice(`${member.name} already exists in the permanent Congregation.`)
      return
    }

    const newMember = { ...member, newThisWeek: true }
    setMembers((current) => [...current, newMember])
    setQueue((current) => current.filter((item) => item.name !== member.name))
    setSelected((current) => [...current, member.name])
    setNotice(`${member.name} added permanently and selected for this week’s Roll Call.`)
  }

  function toggleSelection(name: string) {
    setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  return (
    <Card className="overflow-hidden rounded-[24px] border-0 py-0 shadow-card ring-1 ring-border/80">
      <div className="grid xl:grid-cols-[1.05fr_.95fr]">
        <section className="soft-gradient border-b border-border/70 p-5 sm:p-7 xl:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Church className="size-4" /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-indigo">Permanent · cumulative</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">Sunday Show Congregation</h2>
                </div>
              </div>
              <p className="mt-3 max-w-xl text-xs leading-5 text-muted-foreground">Members remain in the Congregation every week. Tick the names Adam should read in this Sunday’s on-air Roll Call.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white">{selected.length} selected</Badge>
              <Button asChild size="sm" variant="outline" className="bg-white">
                <Link href="/content/roll-call">Open master library</Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {members.map((member) => {
              const checked = selected.includes(member.name)
              return (
                <button
                  key={member.name}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleSelection(member.name)}
                  className="flex w-full items-center gap-3 rounded-2xl border bg-white/85 p-3 text-left transition-colors hover:border-brand-indigo/25"
                >
                  <span className={checked ? "grid size-5 shrink-0 place-items-center rounded-md border border-success bg-success text-white" : "grid size-5 shrink-0 place-items-center rounded-md border bg-white"}>
                    {checked && <Check className="size-3" />}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-indigo"><UsersRound className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold">{member.name}</span>
                      {member.newThisWeek && <Badge className="bg-pink-50 text-brand-magenta">New this week</Badge>}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{member.location}</span>
                      {member.pronunciation && <span className="inline-flex items-center gap-1"><Mic2 className="size-3" />{member.pronunciation}</span>}
                      {member.family && <span>{member.family}</span>}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <CardHeader className="flex flex-row items-start justify-between px-5 pb-3 pt-6 sm:px-7">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="size-4 text-brand-magenta" />New Listener Queue</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Check identity, pronunciation and duplicates before permanent membership.</p>
            </div>
            <Badge variant="secondary">{queue.length} waiting</Badge>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-7">
            <div className="space-y-2">
              {queue.map((member) => {
                const duplicate = members.some((item) => item.name.toLowerCase() === member.name.toLowerCase())
                return (
                  <article key={member.name} className="rounded-2xl border p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><UsersRound className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold">{member.name}</p>
                          {duplicate && <Badge className="bg-amber-50 text-amber-700"><AlertTriangle />Duplicate warning</Badge>}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">{member.location} · {member.pronunciation || "Pronunciation needed"}{member.family ? ` · ${member.family}` : ""}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={duplicate ? "secondary" : "outline"}
                      className="mt-3 w-full"
                      onClick={() => addToRollCall(member)}
                    >
                      <UserPlus />
                      {duplicate ? "Review duplicate" : "Add to Roll Call"}
                    </Button>
                  </article>
                )
              })}
            </div>
            {queue.length === 0 && (
              <div className="grid min-h-52 place-items-center text-center">
                <div>
                  <span className="mx-auto grid size-10 place-items-center rounded-full bg-success-soft text-success"><Check className="size-4" /></span>
                  <p className="mt-3 text-sm font-medium">Queue cleared</p>
                  <p className="mt-1 text-xs text-muted-foreground">Every listener has been reviewed.</p>
                </div>
              </div>
            )}
            {notice && (
              <div role="status" className="mt-4 rounded-xl border border-brand-indigo/10 bg-brand-soft px-4 py-3 text-xs text-brand-indigo">{notice}</div>
            )}
          </CardContent>
        </section>
      </div>
    </Card>
  )
}
