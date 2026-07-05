export type StationShow = "Sundays with Adam" | "Afternoons with Adam" | "Saturday Breakfast"

export const stationMetrics = [
  { label: "Weekly brief", value: "New", note: "Week of 6 July", kind: "brief" },
  { label: "Active campaigns", value: "4", note: "2 high priority", kind: "campaigns" },
  { label: "Active liners", value: "5", note: "18 uses this week", kind: "liners" },
  { label: "Prayer points", value: "4", note: "1 sensitive", kind: "prayer" },
  { label: "Production reminders", value: "9", note: "Live-ready", kind: "production" },
  { label: "Compliance reminders", value: "3", note: "Required on air", kind: "compliance" },
  { label: "Assigned to shows", value: "21", note: "Across three shows", kind: "assigned" },
  { label: "Unassigned items", value: "6", note: "Needs placement", kind: "unassigned" },
] as const

export const weeklyBriefs = [
  { id: "brief-06-jul", title: "Premier Gospel Weekly Briefing", week: "6–12 July 2026", received: "3 July · 16:42", source: "Word document", status: "New" },
  { id: "brief-29-jun", title: "Premier Gospel Weekly Briefing", week: "29 June–5 July 2026", received: "27 June · 15:18", source: "Email text", status: "Processed" },
  { id: "brief-22-jun", title: "Premier Gospel Weekly Briefing", week: "22–28 June 2026", received: "20 June · 17:04", source: "PDF", status: "Needs review" },
  { id: "brief-15-jun", title: "Premier Gospel Weekly Briefing", week: "15–21 June 2026", received: "13 June · 16:25", source: "Word document", status: "Archived" },
] as const

export const extractedBriefItems = [
  { id: "prayer-andy", category: "Prayer point", title: "Prayer for Andy Peck", body: "Pray for Andy following his cancer diagnosis, with sensitivity and without sharing details beyond the approved wording.", priority: "High", assigned: "Sundays with Adam" },
  { id: "campaign-judas", category: "Station campaign", title: "Guess The Judas", body: "Invite listeners to watch and take part through the Premier Gospel YouTube channel.", priority: "High", assigned: "Afternoons with Adam" },
  { id: "liner-ebook", category: "Liner", title: "Free e-book from Truth for Life", body: "Promote the free e-book clearly, using the approved title and destination from the station brief.", priority: "Medium", assigned: "Unassigned" },
  { id: "presenter-listener", category: "Presenter reminder", title: "Speak to one listener", body: "Use direct, conversational language. Avoid radio speak and imagine one person listening.", priority: "High", assigned: "All shows" },
  { id: "producer-experience", category: "Producer reminder", title: "Improve the listening experience", body: "Review pacing, clarity, content balance and joins so the programme feels intentional from start to finish.", priority: "Medium", assigned: "All shows" },
  { id: "technical-burli", category: "Technical reminder", title: "Clear Burli folders", body: "Remove unnecessary files from Burli folders and keep shared production areas organised.", priority: "Medium", assigned: "Unassigned" },
  { id: "event-uzoma", category: "Upcoming event", title: "Uzoma farewell", body: "Acknowledge Uzoma leaving after more than 16 years of service using the approved internal wording.", priority: "Medium", assigned: "Unassigned" },
  { id: "appeal-thanks", category: "Appeal", title: "Premier Gospel appeal thanks", body: "Thank listeners warmly for supporting the Premier Gospel appeal. Do not introduce a new ask.", priority: "High", assigned: "Sundays with Adam" },
  { id: "competition-judas", category: "Competition", title: "Guess The Judas response", body: "Use the YouTube liner and approved participation mechanics. Do not improvise entry details.", priority: "High", assigned: "Afternoons with Adam" },
  { id: "marketplace-read", category: "Marketplace read", title: "Premier Christian Marketplace", body: "Use the current summer reading P2 copy and the supplied Marketplace bed.", priority: "Medium", assigned: "Saturday Breakfast" },
  { id: "guest-lead", category: "Guest lead", title: "Radio staff working hours", body: "Follow up the staff working-hours email as a possible workplace conversation for a future programme.", priority: "Low", assigned: "Unassigned" },
  { id: "compliance-checks", category: "Compliance note", title: "Time, station and name checks", body: "Give the time, station name and presenter name at least twice per hour; tease ahead naturally.", priority: "High", assigned: "All shows" },
] as const

export const stationLiners = [
  {
    id: "guess-judas",
    title: "Guess The Judas · YouTube",
    campaign: "Guess The Judas",
    script: "Think you can spot the Judas? Watch Guess The Judas now on the Premier Gospel YouTube channel and join the conversation.",
    activeDates: "6–19 July",
    priority: "High",
    assignedShows: ["Afternoons with Adam"],
    usageCount: 7,
    status: "Active",
  },
  {
    id: "truth-life",
    title: "Truth for Life · Free e-book",
    campaign: "Truth for Life Free E-book",
    script: "Grow deeper in the Word with a free e-book from Truth for Life. Find the link through Premier Gospel today.",
    activeDates: "6–31 July",
    priority: "Medium",
    assignedShows: ["Sundays with Adam", "Saturday Breakfast"],
    usageCount: 4,
    status: "Active",
  },
  {
    id: "appeal-thanks",
    title: "Premier Gospel Appeal · Thank you",
    campaign: "Premier Gospel Appeal",
    script: "Thank you for standing with Premier Gospel. Your generosity helps keep faith-filled radio available every day.",
    activeDates: "6–12 July",
    priority: "High",
    assignedShows: ["Sundays with Adam"],
    usageCount: 3,
    status: "Active",
  },
  {
    id: "marketplace",
    title: "Marketplace · Summer reading",
    campaign: "Premier Christian Marketplace",
    script: "Find thoughtful summer reading and faith-filled resources at Premier Christian Marketplace.",
    activeDates: "1 July–31 August",
    priority: "Medium",
    assignedShows: ["Saturday Breakfast"],
    usageCount: 4,
    status: "Draft",
  },
  {
    id: "conference-expired",
    title: "Premier Conference · Last chance",
    campaign: "Premier Conference",
    script: "Final places are available for this year’s Premier Conference.",
    activeDates: "1–30 June",
    priority: "Low",
    assignedShows: [],
    usageCount: 12,
    status: "Expired",
  },
] as const

export const stationCampaigns = [
  {
    id: "campaign-judas",
    title: "Guess The Judas",
    objective: "Drive discovery and conversation around the Premier Gospel YouTube series.",
    dates: "6–19 July",
    shows: ["Afternoons with Adam", "Saturday Breakfast"],
    placement: "One natural tease per show; strongest fit beside audience interaction.",
    used: 7,
    status: "Active",
    notes: "Use the supplied title exactly. Keep the mechanic concise and point to YouTube.",
  },
  {
    id: "campaign-ebook",
    title: "Truth for Life Free E-book",
    objective: "Help listeners access a useful free discipleship resource.",
    dates: "6–31 July",
    shows: ["Sundays with Adam", "Saturday Breakfast"],
    placement: "After teaching, encouragement or a reflective music sequence.",
    used: 4,
    status: "Active",
    notes: "Confirm the current e-book title before air. Avoid implying a paid offer.",
  },
  {
    id: "campaign-appeal",
    title: "Premier Gospel Appeal",
    objective: "Thank supporters and reinforce the impact of listener generosity.",
    dates: "6–12 July",
    shows: ["Sundays with Adam", "Afternoons with Adam"],
    placement: "Warm gratitude moment; no new ask in the thank-you copy.",
    used: 3,
    status: "Active",
    notes: "Keep it heartfelt, short and distinct from fundraising language.",
  },
  {
    id: "campaign-marketplace",
    title: "Premier Christian Marketplace",
    objective: "Introduce relevant faith resources through the summer reading P2.",
    dates: "1 July–31 August",
    shows: ["Saturday Breakfast"],
    placement: "Lifestyle or events sequence with the approved Marketplace bed.",
    used: 4,
    status: "Scheduled",
    notes: "Use current P2 copy only. Avoid ad-libbed prices or availability.",
  },
] as const

export const stationPrayerPoints = [
  { id: "andy-peck", subject: "Andy Peck", sensitivity: "Sensitive", visibility: "Public with care", wording: "We are praying for Andy Peck today—for strength, peace and God’s presence through treatment.", assigned: "Sundays with Adam" },
  { id: "premier-team", subject: "Premier team", sensitivity: "Internal", visibility: "Private", wording: "Pray for wisdom, unity and renewed strength across the Premier team this week.", assigned: "Unassigned" },
  { id: "listeners", subject: "Premier Gospel listeners", sensitivity: "General", visibility: "Public", wording: "Pray for every listener carrying an unspoken need, and for hope to meet them where they are.", assigned: "All shows" },
  { id: "upcoming-shows", subject: "Upcoming shows", sensitivity: "General", visibility: "Public", wording: "Pray for every conversation, song and production decision to serve listeners well.", assigned: "Saturday Breakfast" },
] as const

export const productionStandards = [
  { id: "levels", title: "Audio levels", detail: "Watch for spikes and dips; keep music, speech and packages consistent.", liveReminder: "Levels steady?" },
  { id: "transitions", title: "Smooth transitions", detail: "Join music and speech cleanly; protect vocal starts and natural endings.", liveReminder: "Smooth join" },
  { id: "noise", title: "Studio noise", detail: "Avoid keyboard clicks, desk tapping and distracting room noise.", liveReminder: "Quiet desk" },
  { id: "faders", title: "Fader discipline", detail: "Fully open and close faders; never leave speech sitting half-open.", liveReminder: "Fader clean" },
  { id: "dead-air", title: "No dead air", detail: "Know the next source and keep an emergency filler ready.", liveReminder: "Next source ready" },
  { id: "time-checks", title: "Time checks", detail: "Give an accurate time check at least twice per hour.", liveReminder: "Time check due" },
  { id: "station-checks", title: "Station & name checks", detail: "Say Premier Gospel and the presenter name at least twice per hour.", liveReminder: "Station/name check" },
  { id: "conversation", title: "Conversational language", detail: "Speak directly to one listener and avoid radio speak.", liveReminder: "One listener" },
  { id: "tease", title: "Tease ahead", detail: "Give listeners a clear reason to stay without overpromising.", liveReminder: "Tease next" },
] as const

export const initialAssignments = [
  { id: "a1", item: "Andy Peck prayer", type: "Prayer", show: "Sundays with Adam", link: "09:24 · Opening prayer", status: "Assigned" },
  { id: "a2", item: "Appeal thank you", type: "Campaign", show: "Sundays with Adam", link: "11:19 · Station liner", status: "Needs placement" },
  { id: "a3", item: "Guess The Judas", type: "Liner", show: "Afternoons with Adam", link: "Hour 2 · Listener interaction", status: "Used" },
  { id: "a4", item: "Conversational language", type: "Standard", show: "Afternoons with Adam", link: "Live reminder", status: "Assigned" },
  { id: "a5", item: "Marketplace summer read", type: "Read", show: "Saturday Breakfast", link: "08:56 · P2 read", status: "Assigned" },
  { id: "a6", item: "Truth for Life e-book", type: "Liner", show: "Saturday Breakfast", link: "Hour 3 · Guest outro", status: "Skipped" },
] as const
