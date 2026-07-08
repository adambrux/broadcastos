export const scheduleDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type ScheduleDay = (typeof scheduleDays)[number]

export type ScheduleItem = {
  id: string
  day: ScheduleDay
  startTime: string
  endTime: string
  showTitle: string
  presenter?: string
  description: string
  sourceUrl: string
}

export const scheduleSourceLabel = "Manual schedule from Premier Plus, refresh needed"
export const scheduleConnectionLabel = "Website sync/API not connected yet"

const sourceUrl = (day: ScheduleDay) =>
  `https://www.premier.plus/stations/premier-gospel/schedule/${day}`

const item = (
  day: ScheduleDay,
  startTime: string,
  endTime: string,
  showTitle: string,
  description: string,
  presenter?: string
): ScheduleItem => ({
  id: `${day}-${startTime.replace(":", "")}-${showTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  day,
  startTime,
  endTime,
  showTitle,
  presenter,
  description,
  sourceUrl: sourceUrl(day),
})

const weekdayDaytime = (day: ScheduleDay, eveningFeature: string, eveningDescription: string) => [
  item(day, "01:00", "07:00", "Overnights", "Praise and worship music through the night."),
  item(day, "07:00", "10:00", "Gospel Breakfast", "An uplifting, interactive start to the day with gospel music.", "Belinda Brooks"),
  item(day, "10:00", "13:00", "Daytimes on Gospel", "Music, encouragement, news updates and stories of faith from across the UK."),
  item(day, "13:00", "16:00", "Afternoons", "Conversation, listener interaction, encouragement and the biggest gospel tracks."),
  item(day, "16:00", "19:00", "Gospel Drive", "Music, games and conversation to carry listeners through the journey home.", "Cassandra Maria"),
  item(day, "19:00", "20:00", "DJ Guest Mix", "A guest Christian DJ takes over with an energetic themed mix."),
  item(day, "20:00", "22:00", eveningFeature, eveningDescription),
  item(day, "22:00", "23:00", "Wind Down and Worship", "A reflective hour of worship to close the evening."),
  item(day, "23:00", "01:00", "Gospel Tonight", "Gospel classics and calm company through to a new day."),
]

export const premierGospelSchedule: Record<ScheduleDay, ScheduleItem[]> = {
  monday: weekdayDaytime(
    "monday",
    "Sanctified Selection",
    "Classic, upfront and exclusive gospel and inspirational house music."
  ),
  tuesday: weekdayDaytime(
    "tuesday",
    "Reggae Vibes",
    "Gospel reggae, roots and uplifting conversation for the evening."
  ),
  wednesday: weekdayDaytime(
    "wednesday",
    "Fire and Flows",
    "Gospel rap, spoken word and music built around faith and culture."
  ),
  thursday: weekdayDaytime(
    "thursday",
    "Habari Africa",
    "Afrobeats, African gospel and stories connecting the global church."
  ),
  friday: [
    item("friday", "01:00", "07:00", "Overnights", "Praise and worship music through the night."),
    item("friday", "07:00", "10:00", "Gospel Breakfast", "Queen B brings the music and energy to start Friday well.", "Belinda Brooks"),
    item("friday", "10:00", "13:00", "Daytimes on Gospel", "News, stories of faith, inspiration and gospel music."),
    item("friday", "13:00", "16:00", "Afternoons With Ibe Giantkiller", "Daily dilemmas, Bible readings, laughter and listener conversation.", "Ibe Giantkiller"),
    item("friday", "16:00", "19:00", "Gospel Drive", "Music, games and conversation for the drive home.", "Cassandra Maria"),
    item("friday", "19:00", "20:00", "DJ Guest Mix", "A guest Christian DJ takes over the Premier Gospel airwaves."),
    item("friday", "20:00", "22:00", "The Latin Selection", "Latin gospel, joyful rhythms and stories from the music.", "Paula Melissa"),
    item("friday", "22:00", "23:00", "Wind Down and Worship", "A reflective hour of worship to close the week."),
    item("friday", "23:00", "01:00", "Gospel Tonight", "Gospel classics and calm company through to a new day."),
  ],
  saturday: [
    item("saturday", "01:00", "07:00", "Overnights", "Praise and worship music through the night."),
    item("saturday", "07:00", "11:00", "Gospel Breakfast", "An uplifting weekend breakfast with gospel music and listener conversation.", "Belinda Brooks"),
    item("saturday", "11:00", "15:00", "Lunchtimes", "Laughter, prayer, Jesus and powerful biblical insight.", "Kwesi"),
    item("saturday", "15:00", "19:00", "Saturdays With Sandeep Louise", "Gospel music, scripture revelation and worship.", "Sandeep Louise"),
    item("saturday", "19:00", "23:00", "The Theo Manderson Show", "Music, wisdom and encouragement to set up the weekend.", "Theo Manderson"),
    item("saturday", "23:00", "01:00", "Saturday Nights With Candice McKenzie", "The latest gospel hits from around the world.", "Candice McKenzie"),
  ],
  sunday: [
    item("sunday", "01:00", "07:00", "Weekend Overnights", "Praise and worship music through the night.", "Luke Williams"),
    item("sunday", "07:00", "09:00", "Arise and Shine", "Classic and contemporary gospel, thoughts and prayer.", "Madeleine Kerzner"),
    item("sunday", "09:00", "12:00", "Sundays With Adam", "Church, gospel music, prayer and the Sunday Show Congregation.", "Adam Brooks"),
    item("sunday", "12:00", "15:00", "The Sunday Brunch Reset", "Good music, laughter and truth for Sunday afternoon.", "Ibe Giantkiller"),
    item("sunday", "15:00", "17:00", "Sing Out", "Urban praise and worship leaders from across the world."),
    item("sunday", "17:00", "19:00", "Jazz Alive", "The latest and best in gospel jazz from the UK and beyond."),
    item("sunday", "19:00", "20:00", "The UK Gospel Show", "The very best gospel music from across the country."),
    item("sunday", "20:00", "01:00", "Non-Stop Gospel!", "Gospel hits to dance, worship and praise into the night."),
  ],
}

const minutesInDay = 24 * 60
const minutesInWeek = 7 * minutesInDay

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getUkParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""
  const day = value("weekday").toLowerCase() as ScheduleDay
  const minutes = Number(value("hour")) * 60 + Number(value("minute"))

  return { day, minutes }
}

function intervalFor(scheduleItem: ScheduleItem) {
  const dayIndex = scheduleDays.indexOf(scheduleItem.day)
  const start = dayIndex * minutesInDay + timeToMinutes(scheduleItem.startTime)
  let end = dayIndex * minutesInDay + timeToMinutes(scheduleItem.endTime)
  if (end <= start) end += minutesInDay
  return { scheduleItem, start, end }
}

export function getScheduleState(date = new Date()) {
  const { day, minutes } = getUkParts(date)
  const weekMinute = scheduleDays.indexOf(day) * minutesInDay + minutes
  const intervals = Object.values(premierGospelSchedule)
    .flat()
    .map(intervalFor)
    .sort((a, b) => a.start - b.start)

  const currentInterval = intervals.find(({ start, end }) =>
    (weekMinute >= start && weekMinute < end) ||
    (weekMinute + minutesInWeek >= start && weekMinute + minutesInWeek < end)
  ) ?? intervals.find(({ start, end }) =>
    weekMinute >= start - minutesInWeek && weekMinute < end - minutesInWeek
  )

  const current = currentInterval?.scheduleItem ?? null
  const currentIndex = current
    ? intervals.findIndex(({ scheduleItem }) => scheduleItem.id === current.id)
    : -1
  const next = currentIndex >= 0
    ? intervals[(currentIndex + 1) % intervals.length].scheduleItem
    : intervals.find(({ start }) => start > weekMinute)?.scheduleItem ?? intervals[0].scheduleItem

  return { current, next, ukDay: day, ukMinutes: minutes }
}

export function formatScheduleDay(day: ScheduleDay) {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

export function getUkTimeLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)
}
