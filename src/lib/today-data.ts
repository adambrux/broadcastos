export const todayShowCards = [
  {
    slug: "sundays-with-adam",
    name: "Sundays with Adam",
    time: "Sunday · 09:00–12:00",
    presenter: "Adam Brooks",
    producer: "Adam Brooks",
    readiness: 64,
    nextAction: "Finish Sunday School Part 3",
    state: "In production",
  },
  {
    slug: "afternoons-with-adam",
    name: "Afternoons with Adam",
    time: "Today · 13:00–16:00",
    presenter: "Adam Brooks",
    producer: "Adam Brooks",
    readiness: 78,
    nextAction: "Choose the Good News story",
    state: "Today’s focus",
  },
  {
    slug: "saturday-breakfast",
    name: "Saturday Breakfast",
    time: "Saturday · 07:00–10:00",
    presenter: "Jonathan Reid",
    producer: "Adam Brooks",
    readiness: 91,
    nextAction: "Review Guvna B clip out-point",
    state: "Nearly ready",
  },
] as const

export const todayChecklist = [
  { id: "brief", label: "Weekly briefing processed", detail: "12 station items extracted", complete: true },
  { id: "good-news", label: "Good News story chosen", detail: "Three suggestions waiting", complete: false },
  { id: "christian-news", label: "Christian news story chosen", detail: "Premier Christian News shortlist", complete: true },
  { id: "prayer", label: "Prayer written", detail: "Afternoon Prayer Pause", complete: false },
  { id: "question", label: "Audience question ready", detail: "Where did you see God today?", complete: true },
  { id: "guest", label: "Guest research complete", detail: "No guest booked today", complete: true },
  { id: "track", label: "Track of the Week loaded", detail: "Station supplied audio", complete: true },
  { id: "notes", label: "Producer notes finalised", detail: "Two links need notes", complete: false },
  { id: "liner", label: "Station liner placed", detail: "Truth for Life liner", complete: false },
  { id: "listeners", label: "Listener messages reviewed", detail: "14 messages in queue", complete: false },
] as const

export const todayStories = [
  {
    category: "Good News",
    title: "Community choir opens a free after-school music room",
    source: "Manual shortlist",
    status: "Suggested",
    radioPotential: 92,
    christianPerspective: 84,
    question: "What gift could you share with your community?",
    connection: "RSS/API needed",
  },
  {
    category: "Christian News",
    title: "Churches partner to support families through summer",
    source: "Premier Christian News",
    status: "Chosen",
    radioPotential: 88,
    christianPerspective: 96,
    question: "Where have you seen the Church quietly serving well?",
    connection: "Manual for now",
  },
  {
    category: "Mainstream News",
    title: "Local councils expand heatwave support spaces",
    source: "Editorial placeholder",
    status: "Suggested",
    radioPotential: 76,
    christianPerspective: 71,
    question: "",
    connection: "RSS/API needed",
  },
  {
    category: "Science/Discovery",
    title: "No suitable story selected",
    source: "Story search",
    status: "Missing",
    radioPotential: 0,
    christianPerspective: 0,
    question: "",
    connection: "Future AI",
  },
  {
    category: "Entertainment/Culture",
    title: "Gospel artists announce a collaborative summer showcase",
    source: "Station supplied",
    status: "Suggested",
    radioPotential: 86,
    christianPerspective: 89,
    question: "Which gospel collaboration would you love to hear?",
    connection: "Manual for now",
  },
] as const

export const todayAudienceSignals = [
  { label: "Birthdays today", value: "1", detail: "Aunty Pauline · Nottingham", kind: "birthday" },
  { label: "Anniversaries", value: "2", detail: "One ready for an on-air mention", kind: "anniversary" },
  { label: "New listeners", value: "4", detail: "Three Sunday queue candidates", kind: "new" },
  { label: "Prayer requests", value: "6", detail: "Two marked sensitive", kind: "prayer" },
  { label: "Testimonies", value: "3", detail: "One voice note has consent", kind: "testimony" },
  { label: "Song requests", value: "9", detail: "Four for this afternoon", kind: "song" },
  { label: "Congregation updates", value: "3", detail: "New additions need checking", kind: "congregation" },
] as const

export const todayStationReminders = [
  { label: "Active liners", value: "5", detail: "Truth for Life needs placing", tone: "indigo" },
  { label: "Prayer points", value: "4", detail: "Andy Peck wording needs review", tone: "violet" },
  { label: "Production reminders", value: "9", detail: "Time/name check twice per hour", tone: "green" },
  { label: "Campaigns needing placement", value: "2", detail: "Guess The Judas · Marketplace", tone: "pink" },
  { label: "Technical reminders", value: "3", detail: "Watch levels, faders and dead air", tone: "amber" },
] as const

export const todayNotifications = [
  { id: "n1", title: "Good News story is still missing", detail: "Choose one before the 12:15 producer review.", level: "Action needed" },
  { id: "n2", title: "Pastor Yvonne prayer is overdue", detail: "Asset was expected yesterday at 18:00.", level: "Overdue" },
  { id: "n3", title: "Two station items need placement", detail: "Truth for Life and Premier Marketplace remain unassigned.", level: "Review" },
  { id: "n4", title: "Suggested improvement", detail: "Hour 2 has three speech links back-to-back; add a music reset.", level: "Suggestion" },
] as const
