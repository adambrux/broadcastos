/**
 * THE POCKET (v2.40, 23 November 2026). Mid-show, a WhatsApp lands that Adam
 * wants later, not now: later in this show, or another day. He parks it here
 * without touching the script. The same note is read by the producer's build
 * (GET /api/inbox/parked) so a parked message can be written into tomorrow's plan.
 */

export const parkedSources = ["whatsapp", "text", "instagram", "email", "idea"] as const
export type ParkedSource = (typeof parkedSources)[number]

export const parkedSourceLabels: Record<ParkedSource, string> = {
  whatsapp: "WhatsApp",
  text: "Text",
  instagram: "Instagram",
  email: "Email",
  idea: "Idea",
}

export type ParkedWhen = "later-today" | "another-day"

export type ParkedNote = {
  id: string
  text: string
  source: ParkedSource
  /** Who sent it, if Adam typed a name. */
  sender: string
  when: ParkedWhen
  /** The show it was parked in. */
  showId: string
  showDate: string
  createdAt: string
  usedAt: string | null
}

export function isParkedSource(value: unknown): value is ParkedSource {
  return typeof value === "string" && (parkedSources as readonly string[]).includes(value)
}

export function isParkedWhen(value: unknown): value is ParkedWhen {
  return value === "later-today" || value === "another-day"
}
