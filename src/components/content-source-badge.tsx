import { Badge } from "@/components/ui/badge"
import type { ContentSource } from "@/lib/content-library"
import { cn } from "@/lib/utils"

const sourceStyles: Record<ContentSource, string> = {
  Manual: "border-slate-200 bg-slate-50 text-slate-700",
  "Imported from briefing": "border-violet-200 bg-violet-50 text-violet-700",
  "Imported from Notion": "border-zinc-300 bg-white text-zinc-700",
  "AI generated": "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  "Listener submitted": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Station supplied": "border-indigo-200 bg-indigo-50 text-indigo-700",
}

export function ContentSourceBadge({
  source,
  className,
}: {
  source: ContentSource
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", sourceStyles[source], className)}>
      {source}
    </Badge>
  )
}
