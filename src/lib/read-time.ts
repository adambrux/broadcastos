/**
 * Reading time (v2.46). Adam reads at roughly 150 words a minute on air; the
 * pace is one number, saved on the device when he tunes it. Targets come from
 * the link's "Target duration" field in whatever shape it was typed.
 */

export const DEFAULT_WORDS_PER_MINUTE = 150
const paceKey = "broadcastos-read-wpm"

export function readingPace() {
  try {
    const stored = Number(window.localStorage.getItem(paceKey))
    if (stored >= 90 && stored <= 240) return stored
  } catch { /* default pace */ }
  return DEFAULT_WORDS_PER_MINUTE
}

export function saveReadingPace(wpm: number) {
  try { window.localStorage.setItem(paceKey, String(wpm)) } catch { /* ignore */ }
}

/** Words a presenter would say: bracketed directions and pills are not read out. */
export function spokenWords(text: string) {
  return text.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((word) => /[a-z0-9]/i.test(word)).length
}

export function estimateSeconds(text: string, wpm = DEFAULT_WORDS_PER_MINUTE) {
  const words = spokenWords(text)
  return words ? Math.round((words / wpm) * 60) : 0
}

/** "02:00", "2:30", "4 min", "3m", "90s", "4" (minutes) and "1m30" all come back in seconds; anything else is null. */
export function parseTargetSeconds(value: string | undefined) {
  const text = (value ?? "").trim().toLowerCase()
  if (!text) return null
  const clock = text.match(/^(\d{1,2}):(\d{2})$/)
  if (clock) return Number(clock[1]) * 60 + Number(clock[2])
  const minSec = text.match(/^(\d{1,2})\s*m(?:in(?:s|utes?)?)?\s*(\d{1,2})?\s*s?(?:ec(?:s|onds?)?)?$/)
  if (minSec) return Number(minSec[1]) * 60 + Number(minSec[2] ?? 0)
  const secs = text.match(/^(\d{1,3})\s*s(?:ec(?:s|onds?)?)?$/)
  if (secs) return Number(secs[1])
  const bare = text.match(/^(\d{1,2}(?:\.\d+)?)$/)
  if (bare) return Math.round(Number(bare[1]) * 60)
  return null
}

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, "0")}`
}

/** "about 20 seconds" / "about 1 min 05" for speech-like labels. */
export function formatSpoken(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `about ${s} seconds`
  const m = Math.floor(s / 60)
  const rest = s % 60
  return rest ? `about ${m} min ${String(rest).padStart(2, "0")}` : `about ${m} min`
}
