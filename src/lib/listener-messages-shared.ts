/**
 * THE MESSAGE BANK (v2.41, 23 November 2026). Adam pastes a WhatsApp when it is
 * worth something; the app writes the on-air read version in third person
 * ("Sam says…", her own words kept where the line is good), banks it against
 * the person, and the read version can go into a link now or into the Pocket
 * for later.
 */

export const messageSources = ["whatsapp", "text", "instagram", "email"] as const
export type MessageSource = (typeof messageSources)[number]

export const messageSourceLabels: Record<MessageSource, string> = {
  whatsapp: "WhatsApp",
  text: "Text",
  instagram: "Instagram",
  email: "Email",
}

export type ReadStatus = "pending" | "ready"

/** How the read refers to the person. Empty means the app decides from the message. */
export const pronounOptions = ["", "she", "he", "they"] as const
export type Pronoun = (typeof pronounOptions)[number]
export const pronounLabels: Record<Pronoun, string> = { "": "App decides", she: "She", he: "He", they: "They" }

export function isPronoun(value: unknown): value is Pronoun {
  return typeof value === "string" && (pronounOptions as readonly string[]).includes(value)
}

export type ListenerMessage = {
  id: string
  nameKey: string
  name: string
  source: MessageSource
  raw: string
  /** The third-person read, or null while it is still to be written. */
  readVersion: string | null
  readStatus: ReadStatus
  showId: string
  showDate: string
  pronoun: Pronoun
  createdAt: string
  usedAt: string | null
}

export function isMessageSource(value: unknown): value is MessageSource {
  return typeof value === "string" && (messageSources as readonly string[]).includes(value)
}
