"use client"

import { useMemo, useSyncExternalStore } from "react"

import { type StudioShowId } from "@/lib/studio-workspace"

export type LaunchLocation = "live-london" | "live-birmingham" | "pre-recorded"

export type LaunchSequenceStepId =
  | "open-broadcastos"
  | "macro-live-mode"
  | "live-assist-on"
  | "log-walked"
  | "whatsapp-ready"
  | "whatsapp-status-promo"

export type LaunchSequenceStep = {
  id: LaunchSequenceStepId
  title: string
  instruction: string
  why: string
}

export type LaunchSequenceState = {
  showId: StudioShowId
  date: string
  location: LaunchLocation
  completedAtByStep: Partial<Record<LaunchSequenceStepId, string>>
  updatedAt: string
}

const eventName = "broadcastos-launch-sequence-change"
const keyPrefix = "broadcastos-launch-sequence-v1"

export const launchLocationLabels: Record<LaunchLocation, string> = {
  "live-london": "Live in London",
  "live-birmingham": "Live in Birmingham",
  "pre-recorded": "Pre-recorded",
}

export const launchSequenceSteps: LaunchSequenceStep[] = [
  {
    id: "open-broadcastos",
    title: "BroadcastOS open and today’s show loaded",
    instruction: "Open BroadcastOS on the studio computer, or the iPad as fallback. Confirm today’s show is loaded before anything else.",
    why: "The plan has to be visible before the studio state starts changing.",
  },
  {
    id: "macro-live-mode",
    title: "Macro set to Live mode",
    instruction: "Verify on the studio TV: “LIVE FROM ZETTA” means not live yet. Correct is “LIVE FROM STUDIO” with the red light on.",
    why: "This catches the dangerous state where the room looks ready but the studio is not actually live.",
  },
  {
    id: "live-assist-on",
    title: "Live Assist ON in Zetta",
    instruction: "Live Assist must be ON at the top of the Zetta screen before the show starts.",
    why: "Live Assist makes the log play and stop at presenter stops for Adam’s shows and Jonathan’s shows alike.",
  },
  {
    id: "log-walked",
    title: "Zetta log walked",
    instruction: "Walk the log: songs in and correct, gaps and talking space confirmed, stops set everywhere the presenter speaks.",
    why: "Never trust an inherited log. Five minutes here protects three hours of live radio.",
  },
  {
    id: "whatsapp-ready",
    title: "WhatsApp in the right station",
    instruction: "Load WhatsApp in advance — web or phone — signed into the correct station and ready for listener messages.",
    why: "A brilliant CTA is wasted if messages are going to the wrong station.",
  },
  {
    id: "whatsapp-status-promo",
    title: "Pre-show WhatsApp status posted",
    instruction: "Post the pre-show promo to WhatsApp status around 30 minutes before air.",
    why: "This turns the audience on before the show starts, not after the first link.",
  },
]

export const duringShowSafetyReminder =
  "Standing reminder after every link: bring down the mic volume slider AND channel 3 on the mixer, where beds and cues live."

function storageKey(showId: StudioShowId, date: string) {
  return `${keyPrefix}:${showId}:${date || "undated"}`
}

function defaultLocation(): LaunchLocation {
  return "live-london"
}

function fallbackState(showId: StudioShowId, date: string): LaunchSequenceState {
  return {
    showId,
    date,
    location: defaultLocation(),
    completedAtByStep: {},
    updatedAt: "",
  }
}

function getSnapshot(showId: StudioShowId, date: string) {
  if (typeof window === "undefined") return JSON.stringify(fallbackState(showId, date))
  return window.localStorage.getItem(storageKey(showId, date)) ?? JSON.stringify(fallbackState(showId, date))
}

function subscribe(listener: () => void) {
  const notify = () => listener()
  window.addEventListener(eventName, notify)
  window.addEventListener("storage", notify)
  return () => {
    window.removeEventListener(eventName, notify)
    window.removeEventListener("storage", notify)
  }
}

export function saveLaunchSequenceState(state: LaunchSequenceState) {
  const next = { ...state, updatedAt: new Date().toISOString() }
  window.localStorage.setItem(storageKey(next.showId, next.date), JSON.stringify(next))
  window.dispatchEvent(new Event(eventName))
}

export function useLaunchSequence(showId: StudioShowId, date: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getSnapshot(showId, date),
    () => JSON.stringify(fallbackState(showId, date))
  )

  const state = useMemo(() => {
    const parsed = JSON.parse(snapshot) as LaunchSequenceState
    return {
      ...fallbackState(showId, date),
      ...parsed,
      showId,
      date,
      completedAtByStep: parsed.completedAtByStep ?? {},
    }
  }, [date, showId, snapshot])

  const launchRequired = state.location === "live-london"
  const preRecorded = state.location === "pre-recorded"
  const completedCount = launchSequenceSteps.filter((step) => state.completedAtByStep[step.id]).length
  const totalCount = launchSequenceSteps.length
  const complete = preRecorded || (launchRequired && completedCount === totalCount)

  function setLocation(location: LaunchLocation) {
    if (location === "live-birmingham") return
    saveLaunchSequenceState({ ...state, location })
  }

  function toggleStep(stepId: LaunchSequenceStepId) {
    if (!launchRequired) return
    const completedAtByStep = { ...state.completedAtByStep }
    if (completedAtByStep[stepId]) {
      delete completedAtByStep[stepId]
    } else {
      completedAtByStep[stepId] = new Date().toISOString()
    }
    saveLaunchSequenceState({ ...state, completedAtByStep })
  }

  function reset() {
    saveLaunchSequenceState(fallbackState(showId, date))
  }

  return {
    state,
    completedCount,
    totalCount,
    launchRequired,
    preRecorded,
    complete,
    setLocation,
    toggleStep,
    reset,
  }
}
