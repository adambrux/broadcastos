"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  FileInput,
  LibraryBig,
  MessageSquareText,
  Radio,
  Search,
  UsersRound,
} from "lucide-react"

import { ContentSourceBadge } from "@/components/content-source-badge"
import { LinkFramework } from "@/components/link-framework"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { contentItems, rollCallMembers, sundaySchoolEpisodes } from "@/lib/content-library"

const destinations = [
  {
    href: "/content/roll-call",
    eyebrow: "Sundays with Adam",
    title: "Roll Call Library",
    description: "One permanent master script, structured congregation records and pronunciation guidance.",
    stat: `${rollCallMembers.length} sample records`,
    icon: UsersRound,
  },
  {
    href: "/content/sunday-school",
    eyebrow: "Episode archive",
    title: "Sunday School Library",
    description: "Complete three-part lessons, production direction and podcast copy in one reusable archive.",
    stat: `${sundaySchoolEpisodes.length} episodes`,
    icon: BookOpenText,
  },
  {
    href: "/content/import",
    eyebrow: "Ingest workspace",
    title: "Import Centre",
    description: "Bring documents, pasted scripts, listener interactions and briefing copy into BroadcastOS.",
    stat: "8 import routes",
    icon: FileInput,
  },
] as const

export function ContentLibraryPage() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("All content")

  const types = ["All content", ...new Set(contentItems.map((item) => item.type))]
  const filtered = useMemo(() => contentItems.filter((item) => {
    const matchesQuery = `${item.title} ${item.show} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (type === "All content" || item.type === type)
  }), [query, type])

  return (
    <div className="space-y-7">
      <header className="overflow-hidden rounded-[30px] bg-[#10111a] px-6 py-7 text-white shadow-card sm:px-9 sm:py-9">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="border-white/10 bg-white/10 text-white"><LibraryBig />BroadcastOS source of truth</Badge>
              <Badge variant="outline" className="border-white/15 bg-transparent text-white/70">Real content architecture</Badge>
            </div>
            <h1 className="text-[40px] font-semibold tracking-[-0.055em] sm:text-[54px]">Content Library</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
              Store, shape and reuse the scripts, voices and station material that make every BroadcastOS show recognisably yours.
            </p>
          </div>
          <Button asChild className="h-12 self-start rounded-xl bg-white px-5 text-[#11131d] hover:bg-white/90 xl:self-auto">
            <Link href="/content/import"><FileInput />Import content</Link>
          </Button>
        </div>
        <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            ["Library items", contentItems.length, "Across three shows"],
            ["Ready to air", contentItems.filter((item) => item.status === "Ready").length, "Approved material"],
            ["Needs attention", contentItems.filter((item) => item.status === "Draft" || item.status === "Needs review").length, "Draft or review"],
          ].map(([label, value, note]) => (
            <div key={label} className="bg-[#161722] px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</p>
              <div className="mt-2 flex items-baseline gap-2"><strong className="text-2xl">{value}</strong><span className="text-xs text-white/45">{note}</span></div>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {destinations.map(({ href, eyebrow, title, description, stat, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full rounded-[24px] border-border/70 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/20 hover:shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-indigo"><Icon className="size-5" /></span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">{eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">{title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{description}</p>
                <p className="mt-5 border-t pt-4 text-xs font-medium text-foreground/70">{stat}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <LinkFramework compact />

      <section className="rounded-[26px] border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Reusable content</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Library index</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every item keeps its source, show and editorial state.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content" className="h-10 rounded-xl pl-9 sm:w-64" />
            </label>
            <select aria-label="Filter content type" value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {types.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {filtered.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-2xl border border-border/70 p-4 transition-colors hover:bg-muted/25 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <ContentSourceBadge source={item.source} />
                  <span className="text-xs text-muted-foreground">{item.show}</span>
                </div>
                <h3 className="mt-3 font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
                {item.linkFramework && (
                  <div className="mt-3 rounded-2xl border border-brand-indigo/10 bg-brand-soft/25 p-3 text-xs text-brand-indigo">
                    Stored as BroadcastOS Link Framework: Context · Recap · The Moment · Call To Action · Tease Ahead
                  </div>
                )}
              </div>
              <div className="flex items-center gap-5 md:justify-end">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="size-3.5" />{item.updated}</span>
                <Badge className={item.status === "Ready" ? "bg-success-soft text-success" : "bg-amber-50 text-amber-700"}>{item.status}</Badge>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground"><MessageSquareText className="mx-auto mb-3 size-5" />No content matches this search.</div>}
        </div>
      </section>

      <footer className="flex items-center gap-2 px-1 text-xs text-muted-foreground"><Radio className="size-3.5" />ProducerOS and Station Layer now read their reusable content from this library structure.</footer>
    </div>
  )
}
