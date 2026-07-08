"use client"

import { useSyncExternalStore } from "react"

export const scheduleServerClock = "1970-01-01T00:00:00.000Z"

let clockSnapshot = scheduleServerClock
let clockTimer: number | undefined
const clockListeners = new Set<() => void>()

function updateClock() {
  clockSnapshot = new Date().toISOString()
  clockListeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  if (clockSnapshot === scheduleServerClock) clockSnapshot = new Date().toISOString()
  clockListeners.add(listener)

  if (clockTimer === undefined) clockTimer = window.setInterval(updateClock, 30_000)

  return () => {
    clockListeners.delete(listener)
    if (clockListeners.size === 0 && clockTimer !== undefined) {
      window.clearInterval(clockTimer)
      clockTimer = undefined
    }
  }
}

export function useScheduleClock() {
  return useSyncExternalStore(subscribe, () => clockSnapshot, () => scheduleServerClock)
}
