/**
 * The check-in Adam sends to someone who has gone quiet (v2.41). Built from
 * parts so the same person never gets the same message twice: the variant
 * id records which parts were used, and the generator skips any variant
 * already sent to that person.
 */

const openers = ["Hey {name}", "Hi {name}", "Hello {name}", "{name}, hey"]
const intros = ["it's Adam from {show}", "Adam here from {show}", "it's Adam, {show}"]
const gaps = [
  "just checking in, haven't heard from you for a while",
  "it's been a minute since I heard from you",
  "you've gone quiet on me",
  "haven't seen your name come up for a bit",
  "just checking in, it's been a while",
]
const hopes = ["hope you're okay", "hope you're doing alright", "hope all is well with you", "hope you and yours are good", "hope everything's okay your end"]
const offers = [
  "Let me know if there's a song I can play for you.",
  "If there's a song you want to hear, just say.",
  "Tell me what you want to hear and I'll play it for you.",
  "Is there a song I can play for you this week?",
  "Send me a song and I'll get it on for you.",
]
const signoffs = ["", "Adam", "Speak soon, Adam", "God bless, Adam"]

const parts = [openers, intros, gaps, hopes, offers, signoffs]

export const checkinVariantCount = parts.reduce((total, list) => total * list.length, 1)

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name.trim()
}

function render(indexes: number[], name: string, show: string) {
  const [o, i, g, h, f, s] = indexes
  const opener = openers[o].replace("{name}", firstName(name))
  const intro = intros[i].replace("{show}", show)
  const line = `${opener}, ${intro}, ${gaps[g]}, ${hopes[h]}. ${offers[f]}`
  return signoffs[s] ? `${line} ${signoffs[s]}` : line
}

/** A check-in this person has not had before. `used` holds the variant ids already sent to them. */
export function buildCheckin(name: string, show: string, used: Iterable<string>) {
  const taken = new Set(used)
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const indexes = parts.map((list) => Math.floor(Math.random() * list.length))
    const variant = indexes.join("-")
    if (taken.has(variant)) continue
    return { variant, text: render(indexes, name, show) }
  }
  // Every random draw collided (thousands of variants, so only after years of weekly nudges): walk the space in order.
  for (let o = 0; o < openers.length; o += 1)
    for (let i = 0; i < intros.length; i += 1)
      for (let g = 0; g < gaps.length; g += 1)
        for (let h = 0; h < hopes.length; h += 1)
          for (let f = 0; f < offers.length; f += 1)
            for (let s = 0; s < signoffs.length; s += 1) {
              const indexes = [o, i, g, h, f, s]
              const variant = indexes.join("-")
              if (!taken.has(variant)) return { variant, text: render(indexes, name, show) }
            }
  const indexes = parts.map(() => 0)
  return { variant: indexes.join("-"), text: render(indexes, name, show) }
}

/** Which show to sign the check-in from: the one they mostly message, or the station when it is mixed. */
export function showLabelFor(counts: { showId: string; messages: number }[]) {
  const total = counts.reduce((sum, row) => sum + row.messages, 0)
  if (!total) return "Premier Gospel"
  const top = [...counts].sort((a, b) => b.messages - a.messages)[0]
  if (top.messages / total < 0.6) return "Premier Gospel"
  if (top.showId === "afternoons") return "Afternoons with Adam"
  if (top.showId === "sundays") return "Sundays with Adam"
  return "Premier Gospel"
}
