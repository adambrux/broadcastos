import { scheduleDays, type ScheduleDay } from "@/lib/schedule-data"

export type AdamShowCountdownDefinition = {
  id: string
  title: string
  days: ScheduleDay[]
  startTime: string
  endTime: string
  role: "Presenter" | "Producer"
  presenter: string
  producer: string
}

export type AdamShowCountdownState = {
  status: "live" | "upcoming"
  show: AdamShowCountdownDefinition
  seconds: number
  startLabel: string
  endLabel: string
  dayLabel: string
}

const secondsInDay = 24 * 60 * 60
const secondsInWeek = 7 * secondsInDay

export const adamShowCountdownSchedule: AdamShowCountdownDefinition[] = [
  {
    id: "afternoons-with-adam",
    title: "Afternoons with Adam",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "13:00",
    endTime: "16:00",
    role: "Presenter",
    presenter: "Adam Brooks",
    producer: "Adam Brooks",
  },
  {
    id: "saturday-breakfast",
    title: "Saturday Breakfast",
    days: ["saturday"],
    startTime: "07:00",
    endTime: "10:00",
    role: "Producer",
    presenter: "Jonathan Reid",
    producer: "Adam Brooks",
  },
  {
    id: "sundays-with-adam",
    title: "Sundays with Adam",
    days: ["sunday"],
    startTime: "09:00",
    endTime: "12:00",
    role: "Presenter",
    presenter: "Adam Brooks",
    producer: "Adam Brooks",
  },
]

function timeToSeconds(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return (hours * 60 + minutes) * 60
}

function getUkParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  const day = value("weekday").toLowerCase() as ScheduleDay
  const seconds = Number(value("hour")) * 60 * 60 + Number(value("minute")) * 60 + Number(value("second"))

  return { day, seconds }
}

function showInstances() {
  return adamShowCountdownSchedule
    .flatMap((show) => show.days.map((day) => {
      const dayIndex = scheduleDays.indexOf(day)
      const start = dayIndex * secondsInDay + timeToSeconds(show.startTime)
      let end = dayIndex * secondsInDay + timeToSeconds(show.endTime)
      if (end <= start) end += secondsInDay

      return { show, day, start, end }
    }))
    .sort((a, b) => a.start - b.start)
}

export function formatCountdownSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(safe / secondsInDay)
  const hours = Math.floor((safe % secondsInDay) / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  const hh = String(hours).padStart(2, "0")
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")

  return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`
}

export function formatShowDay(day: ScheduleDay) {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

export function getAdamShowCountdownState(date = new Date()): AdamShowCountdownState {
  const { day, seconds } = getUkParts(date)
  const now = scheduleDays.indexOf(day) * secondsInDay + seconds
  const instances = showInstances()
  const first = instances.at(0)
  if (!first) {
    throw new Error("Adam show countdown schedule is empty")
  }

  const live = instances.find((instance) => now >= instance.start && now < instance.end)
  if (live) {
    return {
      status: "live",
      show: live.show,
      seconds: live.end - now,
      startLabel: live.show.startTime,
      endLabel: live.show.endTime,
      dayLabel: formatShowDay(live.day),
    }
  }

  const next = instances.find((instance) => instance.start > now) ?? {
    ...first,
    start: first.start + secondsInWeek,
    end: first.end + secondsInWeek,
  }

  return {
    status: "upcoming",
    show: next.show,
    seconds: next.start - now,
    startLabel: next.show.startTime,
    endLabel: next.show.endTime,
    dayLabel: formatShowDay(next.day),
  }
}
