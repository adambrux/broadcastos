export type ExecutivePriority = {
  id: string
  title: string
  detail: string
  status: "Ready" | "Action needed" | "Review" | "Future AI" | "Not connected"
  href: string
}

export const executiveBriefing = {
  currentFocus: "Afternoons with Adam",
  nextShow: "Afternoons with Adam",
  nextShowTime: "Today · 13:00–16:00",
  countdown: "02:18:42",
  readiness: 78,
  prepRemaining: "42 min",
  confidence: "86%",
  showState: "Strong shape · five decisions remain",
  suggestedAction: "Choose the Good News story",
  suggestedActionDetail: "This unlocks the Hour 1 tease, listener question and presenter wording.",
  summary: "I’ve processed this week’s Premier Gospel briefing. Afternoons with Adam is 78% ready. Three potential Good News stories are waiting, one listener birthday is ready to mention, and two station reminders still need placing.",
} as const

export const executiveReminders = [
  { category: "Missing items", count: 5, detail: "Good News, prayer, two notes and one liner", tone: "amber" },
  { category: "Station reminders", count: 2, detail: "Truth for Life and Marketplace placement", tone: "violet" },
  { category: "Listener reminders", count: 4, detail: "Birthday, sensitive prayer and two welcomes", tone: "green" },
  { category: "Content reminders", count: 3, detail: "Sunday School Part 3 and two asset checks", tone: "indigo" },
  { category: "Story reminders", count: 3, detail: "Good News shortlist needs a decision", tone: "pink" },
  { category: "Prayer reminders", count: 2, detail: "Prayer Pause and Andy Peck wording", tone: "violet" },
  { category: "Guest reminders", count: 1, detail: "Confirm Guvna B clip out-point", tone: "amber" },
] as const

export const executiveActions = [
  { label: "Prepare today’s show", href: "/producer", kind: "prepare", detail: "Complete five remaining decisions" },
  { label: "Choose good news story", href: "/newsroom", kind: "good-news", detail: "Three shortlisted stories" },
  { label: "Choose Christian news story", href: "/newsroom", kind: "christian-news", detail: "One story currently chosen" },
  { label: "Process listener messages", href: "/listeners", kind: "listeners", detail: "14 interactions waiting" },
  { label: "Add station liner", href: "/station", kind: "liner", detail: "Two campaigns need placement" },
  { label: "Open Producer Desk", href: "/producer", kind: "producer", detail: "Build and finalise links" },
  { label: "Open On Air", href: "/broadcast", kind: "on-air", detail: "Presenter focus mode" },
  { label: "Review last show", href: "/review", kind: "review", detail: "Sunday aircheck ready" },
] as const

export const executiveMissingItems: readonly ExecutivePriority[] = [
  { id: "missing-good-news", title: "Good News story not chosen", detail: "Three stories are scored in Newsroom; choose one before the 12:15 producer review.", status: "Action needed", href: "/newsroom" },
  { id: "missing-prayer", title: "Prayer Pause wording incomplete", detail: "The prayer intention is set, but Adam’s concise presenter wording is still missing.", status: "Action needed", href: "/producer" },
  { id: "missing-notes", title: "Two producer notes need finalising", detail: "Hour 1 interaction and Hour 3 final encouragement need clear exits.", status: "Review", href: "/producer" },
  { id: "missing-liner", title: "Truth for Life liner needs placement", detail: "Active this week and not yet attached to a show link.", status: "Action needed", href: "/station" },
  { id: "missing-listeners", title: "Listener message queue not reviewed", detail: "Fourteen messages include one birthday and two possible voice notes.", status: "Review", href: "/listeners" },
] as const

export const executiveShowReadiness = [
  { show: "Afternoons with Adam", time: "Today · 13:00–16:00", readiness: 78, state: "Five decisions remain", next: "Choose Good News story" },
  { show: "Saturday Breakfast", time: "Saturday · 07:00–10:00", readiness: 91, state: "Nearly ready", next: "Review Guvna B clip" },
  { show: "Sundays with Adam", time: "Sunday · 09:00–12:00", readiness: 64, state: "In production", next: "Finish Sunday School Part 3" },
] as const

export const executiveStationPriorities: readonly ExecutivePriority[] = [
  { id: "station-liner", title: "Place Truth for Life liner", detail: "Suggested in Hour 2 after a clean station reset.", status: "Action needed", href: "/station" },
  { id: "station-prayer", title: "Review Andy Peck prayer wording", detail: "Sensitive approved wording is available in Station HQ.", status: "Review", href: "/station" },
  { id: "station-standards", title: "Carry production standards into On Air", detail: "Time/name checks, clean faders, smooth joins and tease ahead.", status: "Ready", href: "/station" },
] as const

export const executiveListenerPriorities: readonly ExecutivePriority[] = [
  { id: "listener-birthday", title: "Aunty Pauline’s birthday", detail: "Nottingham · suitable for a warm on-air mention.", status: "Ready", href: "/listeners" },
  { id: "listener-prayer", title: "Sensitive prayer request", detail: "Keep private; pastoral follow-up only.", status: "Review", href: "/listeners" },
  { id: "listener-new", title: "Welcome two new regular listeners", detail: "Check names and pronunciation before reading.", status: "Action needed", href: "/listeners" },
] as const

export const executiveStoryPriorities: readonly ExecutivePriority[] = [
  { id: "story-good", title: "Choose today’s Good News lead", detail: "Community choir currently scores highest for radio and interaction.", status: "Action needed", href: "/newsroom" },
  { id: "story-christian", title: "Christian News story selected", detail: "Church summer support story is chosen and ready for final prep.", status: "Ready", href: "/newsroom" },
  { id: "story-fetch", title: "Live story fetching unavailable", detail: "Newsroom sources remain manual until RSS/API connections are added.", status: "Not connected", href: "/newsroom" },
] as const

export const executiveContentPriorities: readonly ExecutivePriority[] = [
  { id: "content-school", title: "Finish Sunday School Part 3", detail: "Faith Before the Breakthrough needs the practical final movement.", status: "Action needed", href: "/content/sunday-school" },
  { id: "content-roll", title: "Review Master Roll Call", detail: "Three new additions are ready for pronunciation checks.", status: "Review", href: "/content/roll-call" },
  { id: "content-brain", title: "Feature templates available", detail: "Producer Desk can reference Broadcast Brain DNA for future shows.", status: "Ready", href: "/brain" },
  { id: "content-ai", title: "AI generation unavailable", detail: "Prompt templates are stored but all generation actions remain Future AI.", status: "Future AI", href: "/brain" },
] as const

export const executiveRisks = [
  { title: "Speech-heavy Hour 2", detail: "Three spoken links sit back-to-back.", mitigation: "Add a music reset after Faith In The Headlines.", severity: "Medium" },
  { title: "Late asset dependency", detail: "Pastor Yvonne final prayer is still outstanding.", mitigation: "Prepare a respectful fallback prayer by Friday.", severity: "High" },
  { title: "Listener consent check", detail: "One strong voice note has no confirmed on-air consent.", mitigation: "Keep it out of the running order until consent is recorded.", severity: "High" },
  { title: "Manual source verification", detail: "News stories are not fetched or refreshed automatically.", mitigation: "Recheck headline, date and wording against the original source.", severity: "Medium" },
] as const

export const executiveTomorrowPrep = [
  { title: "Shape Saturday Social Club question", detail: "Choose one weekend lifestyle question and a low-message fallback.", href: "/producer" },
  { title: "Review weekend events", detail: "Confirm dates, locations and station-approved wording.", href: "/newsroom" },
  { title: "Prepare Sunday School assets", detail: "Lock sound design, music beds and podcast description.", href: "/content/sunday-school" },
  { title: "Check the New Listener Queue", detail: "Move verified regular listeners into the Congregation.", href: "/listeners" },
] as const
