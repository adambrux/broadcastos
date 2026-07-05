import Link from "next/link"
import {
  AudioLines,
  BookOpen,
  Circle,
  CircleQuestionMark,
  FileText,
  MessageCircleMore,
  Music2,
  Podcast,
  Quote,
  Volume2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ShowProfile } from "@/lib/mock-data"

type SundaySchool = NonNullable<ShowProfile["sundaySchool"]>

export function SundaySchoolModule({ module }: { module: SundaySchool }) {
  return (
    <Card className="overflow-hidden rounded-[24px] py-0 shadow-card ring-border/80">
      <div className="bg-ink px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="bg-white/10 text-white hover:bg-white/10">Flagship production module</Badge>
            <h2 className="mt-4 flex items-center gap-3 text-3xl font-semibold tracking-[-0.045em]">
              <BookOpen className="size-6 text-brand-magenta" />
              Sunday School
            </h2>
            <p className="mt-2 text-xs font-medium text-white/80">Episode · {module.podcastTitle}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">A complete three-part teaching package with scripts, audience prompts, sound direction and podcast metadata.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/65">
            <span className="rounded-full bg-white/10 px-3 py-1.5">3 parts</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">~14 min</span>
            <Button asChild size="sm" variant="outline" className="h-8 rounded-full border-white/15 bg-white/10 px-3 text-white hover:bg-white/15 hover:text-white">
              <Link href="/content/sunday-school">Open source episode</Link>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="space-y-5 p-5 sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[.9fr_1.4fr]">
          <div className="space-y-5">
            <section className="rounded-2xl bg-brand-soft p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-indigo"><AudioLines className="size-4" />Forward promo</div>
              <p className="mt-4 text-sm leading-6 text-foreground/80">{module.forwardPromo}</p>
            </section>

            <section className="rounded-2xl border border-brand-indigo/10 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Quote className="size-4 text-brand-magenta" />Golden text</div>
              <blockquote className="mt-4 text-lg font-medium leading-7 tracking-[-0.02em]">{module.goldenText}</blockquote>
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold"><FileText className="size-4 text-brand-indigo" />Packaged scripts</div>
              <Badge variant="outline">Production ready</Badge>
            </div>
            <Tabs defaultValue="part-1" className="flex-col">
              <TabsList className="grid h-9 w-full grid-cols-3">
                {module.parts.map((part, index) => (
                  <TabsTrigger key={part.title} value={`part-${index + 1}`} className="min-h-8">
                    Part {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              {module.parts.map((part, index) => (
                <TabsContent key={part.title} value={`part-${index + 1}`} className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold">{part.title}</h3>
                    <span className="font-mono text-[11px] text-muted-foreground">{part.duration}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{part.script}</p>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><CircleQuestionMark className="size-4 text-brand-indigo" />Audience questions</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Before the lesson</p>
                <p className="mt-2 text-sm leading-6">{module.audienceQuestionBefore}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">After the lesson</p>
                <p className="mt-2 text-sm leading-6">{module.audienceQuestionAfter}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Podcast className="size-4 text-brand-indigo" />Podcast package</div>
            <p className="mt-4 text-base font-semibold">{module.podcastTitle}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.podcastDescription}</p>
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <ProductionNotes icon={Volume2} title="Sound design" notes={module.soundDesignNotes} />
          <ProductionNotes icon={Music2} title="Music beds" notes={module.musicBeds} />
          <section className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><MessageCircleMore className="size-4 text-brand-magenta" />Character voices</div>
            <div className="mt-4 space-y-4">
              {module.characterVoiceNotes.map((note) => (
                <div key={note.character}>
                  <p className="text-xs font-semibold">{note.character}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{note.direction}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductionNotes({
  icon: Icon,
  title,
  notes,
}: {
  icon: typeof Volume2
  title: string
  notes: readonly string[]
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-brand-magenta" />{title}</div>
      <div className="mt-4 space-y-3">
        {notes.map((note) => (
          <div key={note} className="flex gap-2 text-xs leading-5 text-muted-foreground">
            <Circle className="mt-1.5 size-2 shrink-0 fill-brand-indigo text-brand-indigo" />
            <p>{note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
