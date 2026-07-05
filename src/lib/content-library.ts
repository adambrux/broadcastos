export type ContentSource =
  | "Manual"
  | "Imported from briefing"
  | "Imported from Notion"
  | "AI generated"
  | "Listener submitted"
  | "Station supplied"

export type ContentType =
  | "Roll Call"
  | "Sunday School"
  | "Station liner"
  | "Prayer"
  | "Feature script"
  | "Guest notes"
  | "Listener message"
  | "Weekly brief"

export type ContentItem = {
  id: string
  title: string
  type: ContentType
  source: ContentSource
  show: string
  updated: string
  status: "Ready" | "Draft" | "Needs review" | "Archived"
  excerpt: string
}

export type RollCallMember = {
  id: string
  name: string
  title?: string
  location: string
  locationNote?: string
  pronunciation?: string
  familyGroup?: string
  newAddition?: boolean
}

export type SundaySchoolEpisode = {
  id: string
  title: string
  date: string
  topic: string
  goldenText: string
  forwardPromo: string
  part1: string
  part2: string
  part3: string
  prayer: string
  productionNotes: readonly string[]
  soundDesignNotes: readonly string[]
  musicNotes: readonly string[]
  podcastTitle: string
  podcastDescription: string
  source: Extract<ContentSource, "Manual" | "Imported from Notion" | "AI generated">
  status: "Ready" | "Draft" | "Archived"
}

export const contentItems: readonly ContentItem[] = [
  {
    id: "roll-call-master",
    title: "Sunday Show Congregation · Master Roll Call",
    type: "Roll Call",
    source: "Manual",
    show: "Sundays with Adam",
    updated: "5 July · 10:22",
    status: "Ready",
    excerpt: "Good morning to the Sunday Show Congregation—our regular listeners, families and churches gathering across the country.",
  },
  {
    id: "school-faith-before-breakthrough",
    title: "Faith Before the Breakthrough",
    type: "Sunday School",
    source: "Manual",
    show: "Sundays with Adam",
    updated: "4 July · 18:40",
    status: "Ready",
    excerpt: "Faith is often formed while the answer still feels far away.",
  },
  {
    id: "school-courage-waiting",
    title: "Courage While You Wait",
    type: "Sunday School",
    source: "Imported from Notion",
    show: "Sundays with Adam",
    updated: "28 June · 12:15",
    status: "Archived",
    excerpt: "A previously exported Notion lesson preserved with its original source label.",
  },
  {
    id: "liner-guess-judas",
    title: "Guess The Judas · YouTube liner",
    type: "Station liner",
    source: "Station supplied",
    show: "Afternoons with Adam",
    updated: "3 July · 16:42",
    status: "Ready",
    excerpt: "Think you can spot the Judas? Watch now on the Premier Gospel YouTube channel.",
  },
  {
    id: "prayer-andy-peck",
    title: "Prayer for Andy Peck",
    type: "Prayer",
    source: "Imported from briefing",
    show: "Sundays with Adam",
    updated: "3 July · 16:48",
    status: "Needs review",
    excerpt: "Approved sensitive wording for strength, peace and God’s presence through treatment.",
  },
  {
    id: "feature-hope-report",
    title: "Hope Report · Friday reset",
    type: "Feature script",
    source: "AI generated",
    show: "Afternoons with Adam",
    updated: "3 July · 14:05",
    status: "Draft",
    excerpt: "One verified good-news story, one listener voice and one practical line of hope.",
  },
  {
    id: "guest-guvna-b",
    title: "Guvna B · interview prep",
    type: "Guest notes",
    source: "Manual",
    show: "Saturday Breakfast",
    updated: "2 July · 09:30",
    status: "Ready",
    excerpt: "New music, summer events and a concise faith-and-creativity question arc.",
  },
  {
    id: "listener-ruth",
    title: "Ruth · trusting while waiting",
    type: "Listener message",
    source: "Listener submitted",
    show: "Sundays with Adam",
    updated: "29 June · 09:46",
    status: "Ready",
    excerpt: "A short voice note about trusting God while an answer is delayed.",
  },
  {
    id: "brief-06-jul",
    title: "Premier Gospel Weekly Briefing · 6 July",
    type: "Weekly brief",
    source: "Imported from briefing",
    show: "All shows",
    updated: "3 July · 16:42",
    status: "Needs review",
    excerpt: "Campaigns, prayer points, station standards and staff reminders for the week.",
  },
] as const

export const rollCallMembers: readonly RollCallMember[] = [
  { id: "michelle-grant", name: "Michelle Grant", location: "Croydon", pronunciation: "mih-SHELL", familyGroup: "Grant family" },
  { id: "okafor-family", name: "The Okafor family", location: "Birmingham", pronunciation: "oh-KAH-for", familyGroup: "Family of five", newAddition: true },
  { id: "sister-angela", name: "Angela Morris", title: "Sister", location: "Luton", locationNote: "Listening with Mum", pronunciation: "AN-juh-lah", newAddition: true },
  { id: "daniel-k", name: "Daniel Kwarteng", location: "Leeds", pronunciation: "DAN-yul KWAH-teng", newAddition: true },
  { id: "pastor-samuel-grace", name: "Samuel and Grace Adebayo", title: "Pastor", location: "Peckham", familyGroup: "Adebayo family", pronunciation: "ah-deh-BYE-oh" },
  { id: "ruth-mensah", name: "Ruth Mensah", location: "Enfield", pronunciation: "MEN-sah" },
  { id: "aunty-pauline", name: "Pauline Grant", title: "Aunty", location: "Nottingham", locationNote: "Birthday this week", familyGroup: "Grant family" },
]

export const rollCallQueue: readonly RollCallMember[] = [
  { id: "marcia-williams", name: "Marcia Williams", location: "Croydon", pronunciation: "MAR-see-ah" },
  { id: "ajayi-family", name: "The Ajayi family", location: "Wolverhampton", pronunciation: "ah-JAH-yee", familyGroup: "Parents and three children" },
  { id: "daniel-k-duplicate", name: "Daniel Kwarteng", location: "Leeds", pronunciation: "DAN-yul KWAH-teng" },
]

export const masterRollCallScript = `Good morning to the Sunday Show Congregation.

We are saying a warm Sunday welcome to Michelle Grant and the Grant family in Croydon; the Okafor family in Birmingham; Sister Angela listening with Mum in Luton; Daniel Kwarteng in Leeds; Pastor Samuel, Grace and the Adebayo family in Peckham; Ruth Mensah in Enfield; and Aunty Pauline with the Grant family in Nottingham.

And joining the Congregation this week, a special welcome to the Okafor family, Sister Angela and Daniel Kwarteng. You are part of the family.

Wherever you are listening—from home, work, the car, hospital or on your way to church—you are part of the Sunday Show Congregation this morning.`

export const sundaySchoolEpisodes: readonly SundaySchoolEpisode[] = [
  {
    id: "faith-before-breakthrough",
    title: "Faith Before the Breakthrough",
    date: "5 July 2026",
    topic: "Trusting God before circumstances change",
    goldenText: "Let us hold unswervingly to the hope we profess, for he who promised is faithful. — Hebrews 10:23",
    forwardPromo: "Coming up after 10, Sunday School opens one question: what does faithful courage look like before the breakthrough arrives? Your voice notes will become part of the class.",
    part1: "Faith is often formed while the answer still feels far away. Adam opens the story, names the tension and invites the Congregation to notice the faithful choice at its centre.",
    part2: "Return with a short recap, reveal Hebrews 10:23 and unpack the golden text in everyday language for home, work, family and church life.",
    part3: "Resolve the lesson with one practical invitation: take the next honest, faithful step even when the whole answer is not visible.",
    prayer: "Father, help us trust your character while we wait for clarity. Give us courage for the next faithful step and peace for everything we cannot yet see. Amen.",
    productionNotes: ["Keep each part self-contained but emotionally continuous.", "Protect a clean two-second pause after the golden text.", "Return from Part 3 directly into selected audience answers."],
    soundDesignNotes: ["Soft page-turn and distant Sunday room tone.", "One restrained transition motif across all three parts.", "Avoid theatrical church bells or dramatic impacts."],
    musicNotes: ["Warm piano and soft pad, 72–76 BPM.", "Light gospel organ under the golden text only.", "Hopeful acoustic bed beneath the practical action."],
    podcastTitle: "Sunday School: Faith Before the Breakthrough",
    podcastDescription: "Adam Brooks explores how faithful courage grows before circumstances change, with Hebrews 10:23, listener questions and one practical action for the week ahead.",
    source: "Manual",
    status: "Ready",
  },
  {
    id: "courage-while-waiting",
    title: "Courage While You Wait",
    date: "28 June 2026",
    topic: "Patience, prayer and faithful action",
    goldenText: "Wait for the Lord; be strong and take heart and wait for the Lord. — Psalm 27:14",
    forwardPromo: "After ten, Sunday School asks how we stay active in faith while we wait.",
    part1: "Introduce the difference between passive delay and faithful waiting.",
    part2: "Open Psalm 27:14 and connect courage to daily habits of trust.",
    part3: "Give one waiting practice for the week: pray, prepare and take the next available step.",
    prayer: "Lord, strengthen every listener in a season of waiting.",
    productionNotes: ["Original lesson imported from a manual Notion export.", "Archive audio remains linked separately."],
    soundDesignNotes: ["Minimal room tone.", "No dramatic transitions."],
    musicNotes: ["Gentle piano bed."],
    podcastTitle: "Sunday School: Courage While You Wait",
    podcastDescription: "A practical lesson on waiting with courage, rooted in Psalm 27:14.",
    source: "Imported from Notion",
    status: "Archived",
  },
  {
    id: "peace-in-pressure",
    title: "Peace in the Pressure",
    date: "12 July 2026",
    topic: "Protecting peace in a demanding week",
    goldenText: "And the peace of God... will guard your hearts and your minds in Christ Jesus. — Philippians 4:7",
    forwardPromo: "Next Sunday, Sunday School explores peace that does more than change the atmosphere—it guards the heart.",
    part1: "Draft opening on pressure and overstimulation.",
    part2: "Draft golden-text explanation.",
    part3: "Draft practical invitation.",
    prayer: "Draft prayer.",
    productionNotes: ["Requires editorial review before production."],
    soundDesignNotes: ["To be confirmed."],
    musicNotes: ["To be confirmed."],
    podcastTitle: "Sunday School: Peace in the Pressure",
    podcastDescription: "Draft description.",
    source: "AI generated",
    status: "Draft",
  },
] as const

export const sundaySchoolProductionKit = {
  forwardPromo: sundaySchoolEpisodes[0].forwardPromo,
  parts: [
    { title: "Part 1 · Before the breakthrough", duration: "04:30", script: sundaySchoolEpisodes[0].part1 },
    { title: "Part 2 · The golden text", duration: "05:00", script: sundaySchoolEpisodes[0].part2 },
    { title: "Part 3 · Put it into practice", duration: "04:45", script: sundaySchoolEpisodes[0].part3 },
  ],
  goldenText: sundaySchoolEpisodes[0].goldenText,
  audienceQuestionBefore: "Where in your life are you being asked to trust before you can see the outcome?",
  audienceQuestionAfter: "What one faithful action will you take this week, even if the answer has not arrived yet?",
  soundDesignNotes: sundaySchoolEpisodes[0].soundDesignNotes,
  musicBeds: sundaySchoolEpisodes[0].musicNotes,
  characterVoiceNotes: [
    { character: "Narrator", direction: "Warm, grounded and conversational; never read like a formal lesson." },
    { character: "Young listener", direction: "Curious and natural, with a genuine question rather than a scripted performance." },
    { character: "Elder voice", direction: "Gentle authority, lived experience and a short reflective pace." },
  ],
  podcastTitle: sundaySchoolEpisodes[0].podcastTitle,
  podcastDescription: sundaySchoolEpisodes[0].podcastDescription,
} as const

export const contentWeeklyBriefs = [
  { id: "brief-06-jul", title: "Premier Gospel Weekly Briefing", week: "6–12 July 2026", received: "3 July · 16:42", source: "Word document", status: "New" },
  { id: "brief-29-jun", title: "Premier Gospel Weekly Briefing", week: "29 June–5 July 2026", received: "27 June · 15:18", source: "Email text", status: "Processed" },
  { id: "brief-22-jun", title: "Premier Gospel Weekly Briefing", week: "22–28 June 2026", received: "20 June · 17:04", source: "PDF", status: "Needs review" },
  { id: "brief-15-jun", title: "Premier Gospel Weekly Briefing", week: "15–21 June 2026", received: "13 June · 16:25", source: "Word document", status: "Archived" },
] as const

export const weeklyBriefExtractionItems = [
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
