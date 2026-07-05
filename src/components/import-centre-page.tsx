"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  Check,
  ClipboardPaste,
  FileImage,
  FileText,
  Mail,
  MessageSquareText,
  PencilLine,
  ScrollText,
  Upload,
  UsersRound,
} from "lucide-react"

import { ContentSourceBadge } from "@/components/content-source-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ContentSource } from "@/lib/content-library"

type ImportOption = {
  title: string
  description: string
  mode: "paste" | "upload"
  source: ContentSource
  accept?: string
  icon: typeof FileText
}

type ImportedCard = {
  id: string
  title: string
  body: string
  kind: string
  source: ContentSource
  created: string
}

const importOptions: readonly ImportOption[] = [
  { title: "Paste text", description: "General scripts, notes or reusable copy", mode: "paste", source: "Manual", icon: ClipboardPaste },
  { title: "Upload Word document", description: ".doc or .docx source document", mode: "upload", source: "Manual", accept: ".doc,.docx", icon: FileText },
  { title: "Upload PDF", description: "Bring a PDF into the review queue", mode: "upload", source: "Manual", accept: ".pdf", icon: Upload },
  { title: "Paste weekly briefing email", description: "Create editable station brief content", mode: "paste", source: "Imported from briefing", icon: Mail },
  { title: "Paste Sunday School script", description: "Start a complete episode record", mode: "paste", source: "Manual", icon: ScrollText },
  { title: "Paste listener interactions", description: "Prepare messages for Listener Hub", mode: "paste", source: "Listener submitted", icon: MessageSquareText },
  { title: "Paste roll call script", description: "Update the master Congregation script", mode: "paste", source: "Manual", icon: UsersRound },
  { title: "Upload Zetta screenshot", description: "Image placeholder for future log extraction", mode: "upload", source: "Station supplied", accept: "image/*", icon: FileImage },
] as const

const initialCards: ImportedCard[] = [
  {
    id: "brief-import",
    title: "Premier Gospel Weekly Briefing · 6 July",
    body: "Prayer for Andy Peck, active station campaigns, operational reminders and on-air production standards.",
    kind: "Paste weekly briefing email",
    source: "Imported from briefing",
    created: "3 July · 16:42",
  },
  {
    id: "listener-import",
    title: "Sunday listener interactions · latest batch",
    body: "Three WhatsApps, one voice note consent check and two new regular-listener records ready for review.",
    kind: "Paste listener interactions",
    source: "Listener submitted",
    created: "29 June · 12:08",
  },
]

export function ImportCentrePage() {
  const [selected, setSelected] = useState<ImportOption | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [filename, setFilename] = useState("")
  const [cards, setCards] = useState<ImportedCard[]>(initialCards)
  const [notice, setNotice] = useState("")

  function closeImport() {
    setSelected(null)
    setTitle("")
    setBody("")
    setFilename("")
  }

  function createCard() {
    if (!selected || !title.trim() || (selected.mode === "paste" && !body.trim()) || (selected.mode === "upload" && !filename)) return
    setCards((current) => [{
      id: `import-${Date.now()}`,
      title: title.trim(),
      body: body.trim() || `${filename} uploaded and waiting for extraction review.`,
      kind: selected.title,
      source: selected.source,
      created: "Just now",
    }, ...current])
    setNotice(`${title.trim()} added to the editable import workspace.`)
    closeImport()
  }

  function updateCard(id: string, key: "title" | "body", value: string) {
    setCards((current) => current.map((card) => card.id === id ? { ...card, [key]: value } : card))
  }

  return (
    <div className="space-y-6">
      <header className="soft-gradient rounded-[28px] border border-brand-indigo/10 p-6 shadow-card sm:p-8">
        <Link href="/content" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Content Library</Link>
        <div className="mt-6 max-w-3xl">
          <Badge className="bg-brand-soft text-brand-indigo"><Upload />Content ingestion</Badge>
          <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Import Centre</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Bring source material into BroadcastOS, label its origin honestly, and shape it into editable broadcast content.</p>
        </div>
      </header>

      {notice && <div role="status" className="flex items-center gap-3 rounded-2xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success"><Check className="size-4" /><span className="flex-1">{notice}</span><button type="button" className="font-semibold" onClick={() => setNotice("")}>Dismiss</button></div>}

      <section>
        <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Choose a source</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Import routes</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {importOptions.map(({ icon: Icon, ...option }) => (
            <button key={option.title} type="button" onClick={() => setSelected({ ...option, icon: Icon })} className="text-left">
              <Card className="h-full rounded-[22px] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/20 hover:shadow-card">
                <CardContent className="p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-[18px]" /></span>
                  <h3 className="mt-5 font-semibold tracking-[-0.02em]">{option.title}</h3>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{option.description}</p>
                  <div className="mt-4"><ContentSourceBadge source={option.source} /></div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Review before publishing</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Editable import workspace</h2><p className="mt-1 text-sm text-muted-foreground">Nothing goes straight to air. Every import becomes an editable content card first.</p></div>
          <Badge variant="outline">{cards.length} cards</Badge>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {cards.map((card) => (
            <article key={card.id} className="rounded-2xl border border-border/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><ContentSourceBadge source={card.source} /><span className="text-xs text-muted-foreground">{card.created}</span></div>
              <label className="mt-5 block"><span className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><PencilLine className="size-3" />Editable title</span><Input value={card.title} onChange={(event) => updateCard(card.id, "title", event.target.value)} className="rounded-xl font-semibold" /></label>
              <label className="mt-4 block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Extracted content</span><textarea value={card.body} onChange={(event) => updateCard(card.id, "body", event.target.value)} className="min-h-28 w-full resize-y rounded-xl border bg-muted/15 p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></label>
              <p className="mt-3 text-xs text-muted-foreground">{card.kind}</p>
            </article>
          ))}
        </div>
      </section>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && closeImport()}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl">
          {selected && <>
            <SheetHeader className="text-left"><div className="mb-2"><ContentSourceBadge source={selected.source} /></div><SheetTitle className="text-2xl">{selected.title}</SheetTitle><SheetDescription>{selected.description}. This creates an editable card; it does not automatically publish content.</SheetDescription></SheetHeader>
            <div className="mt-7 space-y-5">
              <label className="block"><span className="mb-2 block text-xs font-semibold">Content title</span><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name this import" className="rounded-xl" /></label>
              {selected.mode === "paste" ? (
                <label className="block"><span className="mb-2 block text-xs font-semibold">Paste source content</span><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Paste the original material here…" className="min-h-80 w-full rounded-2xl border bg-muted/15 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold">Choose source file</span>
                  <span className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/15 p-6 text-center">
                    <Upload className="size-6 text-brand-indigo" />
                    <span className="mt-3 text-sm font-semibold">{filename || "Choose a file"}</span>
                    <span className="mt-1 text-xs text-muted-foreground">{selected.title === "Upload Zetta screenshot" ? "Placeholder only — image extraction is not connected yet." : "The file will enter the review workspace."}</span>
                    <input type="file" accept={selected.accept} className="sr-only" onChange={(event) => setFilename(event.target.files?.[0]?.name ?? "")} />
                  </span>
                </label>
              )}
              <Button className="primary-action w-full rounded-xl text-white" disabled={!title.trim() || (selected.mode === "paste" ? !body.trim() : !filename)} onClick={createCard}><Upload />Create editable content card</Button>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </div>
  )
}
