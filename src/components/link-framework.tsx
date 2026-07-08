"use client"

import { Check, CircleAlert, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  linkFrameworkHelperText,
  linkFrameworkName,
  linkFrameworkSections,
  type LinkFrameworkValues,
  validateLinkFramework,
} from "@/lib/link-framework"
import { cn } from "@/lib/utils"

export function LinkFramework({
  values,
  showName,
  featureName,
  compact = false,
  className,
}: {
  values?: LinkFrameworkValues
  showName?: string
  featureName?: string
  compact?: boolean
  className?: string
}) {
  const validation = validateLinkFramework(values ?? {}, { showName, featureName })

  return (
    <Card className={cn("rounded-[24px] border-brand-indigo/10 bg-gradient-to-br from-white to-brand-soft/30 py-0 shadow-sm", className)}>
      <CardContent className={cn("p-5", !compact && "sm:p-6")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-ink text-white">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">{linkFrameworkName}</p>
              <h2 className={cn("mt-1 font-semibold tracking-[-0.04em]", compact ? "text-lg" : "text-2xl")}>Context → Recap → The Moment → Call To Action → Tease Ahead</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{linkFrameworkHelperText}</p>
            </div>
          </div>
          <Badge className={validation.complete ? "bg-success-soft text-success" : "bg-amber-50 text-amber-700"}>
            {validation.complete ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}
            {validation.score}/{validation.total} complete
          </Badge>
        </div>

        <div className={cn("mt-5 grid gap-2", compact ? "sm:grid-cols-5" : "md:grid-cols-5")}>
          {linkFrameworkSections.map((section, index) => {
            const check = validation.checks.find((item) => item.id === section.id)
            return (
              <div key={section.id} className={cn("rounded-2xl border bg-white/75 p-3", check?.ready ? "border-success/20" : "border-amber-200")}>
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold", check?.ready ? "bg-success text-white" : "bg-amber-100 text-amber-800")}>{index + 1}</span>
                  <p className="text-xs font-semibold">{section.title}</p>
                </div>
                {!compact && (
                  <>
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{section.prompt}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5">{values ? values[section.id] || "Missing" : section.purpose}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {validation.warnings.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <p className="font-semibold">Framework warnings</p>
            <ul className="mt-1 list-inside list-disc">
              {validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
