export type NewsroomConnection = "Manual for now" | "Future AI" | "RSS/API needed" | "Connected"
export type StoryStatus = "Suggested" | "Chosen" | "Assigned" | "Archived"
export type StoryCategory = "Good News" | "Christian News" | "Mainstream" | "Science/Discovery" | "Entertainment/Culture"

export type NewsSource = {
  id: string
  name: string
  category: StoryCategory
  sourceType: "Manual" | "RSS available" | "API needed" | "Future AI"
  status: string
  lastChecked: string
  connection: NewsroomConnection
}

export type NewsStory = {
  id: string
  headline: string
  source: string
  category: StoryCategory
  date: string
  summary: string
  status: StoryStatus
  radioPotential: number
  christianPerspective: number
  interaction: number
  prayerOpportunity: number
  hopeLevel: number
  sensitivity: "Low" | "Medium" | "High"
  suggestedShow: "Sundays with Adam" | "Afternoons with Adam" | "Saturday Breakfast"
  placement: string
  tags: readonly string[]
  prep: {
    whyRadio: string
    christianPerspective: string
    listenerQuestion: string
    prayerAngle: string
    safeWording: string
    toneWarning: string
    intro: string
    outro: string
    cta: string
    linkLength: string
  }
}

export const newsroomSources: readonly NewsSource[] = [
  { id: "good-news-network", name: "Good News Network", category: "Good News", sourceType: "RSS available", status: "Feed not connected", lastChecked: "Not checked automatically", connection: "RSS/API needed" },
  { id: "positive-news", name: "Positive News", category: "Good News", sourceType: "RSS available", status: "Manual review only", lastChecked: "4 July · manually", connection: "Manual for now" },
  { id: "reasons-cheerful", name: "Reasons to be Cheerful", category: "Good News", sourceType: "Manual", status: "Source bookmarked", lastChecked: "3 July · manually", connection: "Manual for now" },
  { id: "fix-news", name: "Fix The News", category: "Good News", sourceType: "Manual", status: "Newsletter source", lastChecked: "2 July · manually", connection: "Manual for now" },
  { id: "premier-news", name: "Premier Christian News", category: "Christian News", sourceType: "Manual", status: "Internal editorial source", lastChecked: "5 July · manually", connection: "Manual for now" },
  { id: "christian-today", name: "Christian Today", category: "Christian News", sourceType: "RSS available", status: "Feed not connected", lastChecked: "Not checked automatically", connection: "RSS/API needed" },
  { id: "ea", name: "Evangelical Alliance", category: "Christian News", sourceType: "Manual", status: "Source bookmarked", lastChecked: "1 July · manually", connection: "Manual for now" },
  { id: "bbc", name: "BBC News", category: "Mainstream", sourceType: "RSS available", status: "Feed not connected", lastChecked: "Not checked automatically", connection: "RSS/API needed" },
  { id: "sky", name: "Sky News", category: "Mainstream", sourceType: "API needed", status: "No integration", lastChecked: "Not checked automatically", connection: "RSS/API needed" },
  { id: "reuters", name: "Reuters", category: "Mainstream", sourceType: "API needed", status: "No integration", lastChecked: "Not checked automatically", connection: "RSS/API needed" },
  { id: "nasa", name: "NASA News", category: "Science/Discovery", sourceType: "RSS available", status: "Feed not connected", lastChecked: "Not checked automatically", connection: "RSS/API needed" },
  { id: "bbc-future", name: "BBC Future", category: "Science/Discovery", sourceType: "Future AI", status: "Research workflow planned", lastChecked: "Not available", connection: "Future AI" },
] as const

export const newsroomStories: readonly NewsStory[] = [
  {
    id: "choir-music-room",
    headline: "Community choir opens a free after-school music room",
    source: "Positive News",
    category: "Good News",
    date: "5 July 2026",
    summary: "A neighbourhood choir has converted unused community space into free weekday music sessions for young people.",
    status: "Suggested",
    radioPotential: 94,
    christianPerspective: 86,
    interaction: 92,
    prayerOpportunity: 64,
    hopeLevel: 96,
    sensitivity: "Low",
    suggestedShow: "Afternoons with Adam",
    placement: "Hour 3 · Good News Around The World",
    tags: ["community", "young people", "kindness"],
    prep: {
      whyRadio: "Warm characters, an easy visual picture and a clear emotional lift make this immediately understandable in under two minutes.",
      christianPerspective: "Frame generosity and shared gifts as practical service, without claiming the organisers are faith-led unless the source confirms it.",
      listenerQuestion: "What gift or skill could you share with your community this summer?",
      prayerAngle: "Pray for safe spaces, patient mentors and young people discovering confidence.",
      safeWording: "Say the project is community-led. Do not describe it as a church initiative without verification.",
      toneWarning: "Keep it joyful and specific; avoid turning the young people into a rescue narrative.",
      intro: "Here’s proof that a little generosity can change the sound of a whole neighbourhood.",
      outro: "One room, a few instruments and adults willing to make time—that is good news worth sharing.",
      cta: "WhatsApp us: what skill could you share where you live?",
      linkLength: "01:45",
    },
  },
  {
    id: "church-summer-support",
    headline: "Churches partner to support families through the summer",
    source: "Premier Christian News",
    category: "Christian News",
    date: "5 July 2026",
    summary: "Churches across one London borough are coordinating meals, activity sessions and practical support during the school holidays.",
    status: "Chosen",
    radioPotential: 90,
    christianPerspective: 98,
    interaction: 84,
    prayerOpportunity: 88,
    hopeLevel: 91,
    sensitivity: "Medium",
    suggestedShow: "Sundays with Adam",
    placement: "Hour 1 · listener conversation",
    tags: ["church", "UK Christian news", "community"],
    prep: {
      whyRadio: "A tangible example of faith in action with strong local voices and a natural listener invitation.",
      christianPerspective: "Connect service to loving our neighbour while keeping the focus on dignity and practical solidarity.",
      listenerQuestion: "Where have you seen a church quietly serving its community well?",
      prayerAngle: "Pray for families under pressure and volunteers serving consistently through summer.",
      safeWording: "Use ‘families facing additional pressure’ rather than language that labels or diminishes recipients.",
      toneWarning: "Protect dignity. Do not ask listeners to identify individual families on air.",
      intro: "This is what loving your neighbour can look like on an ordinary weekday.",
      outro: "Faith becomes visible when care becomes practical.",
      cta: "Tell us about a church making a quiet difference near you.",
      linkLength: "02:20",
    },
  },
  {
    id: "heatwave-support",
    headline: "Councils expand cool spaces during the heatwave",
    source: "BBC News",
    category: "Mainstream",
    date: "4 July 2026",
    summary: "Libraries and community centres are extending access to cool spaces, water and welfare information during high temperatures.",
    status: "Suggested",
    radioPotential: 79,
    christianPerspective: 70,
    interaction: 76,
    prayerOpportunity: 72,
    hopeLevel: 68,
    sensitivity: "Medium",
    suggestedShow: "Afternoons with Adam",
    placement: "Hour 2 · Faith In The Headlines",
    tags: ["health", "community"],
    prep: {
      whyRadio: "It is immediately useful, current and relevant to people travelling, caring for relatives or working in hot conditions.",
      christianPerspective: "Emphasise neighbourly care and checking on people who may be isolated.",
      listenerQuestion: "Who are you checking on during the hot weather?",
      prayerAngle: "Pray for older listeners, outdoor workers and people without easy access to cool spaces.",
      safeWording: "Use official health guidance only and avoid giving improvised medical advice.",
      toneWarning: "Useful and calm, never alarmist. Direct urgent health concerns to official services.",
      intro: "A practical story now, because looking out for one another matters in this heat.",
      outro: "Check the official guidance, drink water and make one thoughtful call today.",
      cta: "Message us with the practical way your community is helping.",
      linkLength: "02:00",
    },
  },
  {
    id: "treatment-breakthrough",
    headline: "New trial offers hope for faster recovery after stroke",
    source: "BBC Future",
    category: "Science/Discovery",
    date: "3 July 2026",
    summary: "An early-stage rehabilitation study reports promising results, with larger trials still required.",
    status: "Suggested",
    radioPotential: 85,
    christianPerspective: 74,
    interaction: 66,
    prayerOpportunity: 82,
    hopeLevel: 88,
    sensitivity: "High",
    suggestedShow: "Saturday Breakfast",
    placement: "Hour 2 · lifestyle conversation",
    tags: ["science breakthrough", "health", "recovery"],
    prep: {
      whyRadio: "It offers genuine hope and a clear human impact, provided the limitations are explained plainly.",
      christianPerspective: "Celebrate careful research and human skill without promising an outcome or framing illness as a failure of faith.",
      listenerQuestion: "What helped you stay hopeful during a long recovery?",
      prayerAngle: "Pray for patients, carers, clinicians and researchers.",
      safeWording: "Say ‘promising early-stage results’; never call this a cure or established treatment.",
      toneWarning: "High sensitivity. Avoid medical advice, guarantees and direct calls for personal diagnoses.",
      intro: "A careful note of hope from medical research—with an important word of caution.",
      outro: "Encouraging, early and worth watching, but not yet a treatment people can request.",
      cta: "If this raises health concerns, speak to a qualified healthcare professional.",
      linkLength: "02:30",
    },
  },
  {
    id: "gospel-showcase",
    headline: "Gospel artists announce collaborative summer showcase",
    source: "Premier Gospel",
    category: "Entertainment/Culture",
    date: "2 July 2026",
    summary: "UK gospel artists are bringing new collaborations and emerging voices to a one-night summer showcase.",
    status: "Assigned",
    radioPotential: 91,
    christianPerspective: 89,
    interaction: 90,
    prayerOpportunity: 42,
    hopeLevel: 84,
    sensitivity: "Low",
    suggestedShow: "Saturday Breakfast",
    placement: "Hour 3 · Events You Can Attend",
    tags: ["gospel music", "faith and culture"],
    prep: {
      whyRadio: "Recognisable artists, an event hook and a strong opportunity for music-led listener interaction.",
      christianPerspective: "Explore creativity, collaboration and how gospel music carries testimony.",
      listenerQuestion: "Which two gospel artists would make your dream collaboration?",
      prayerAngle: "A brief prayer for artists using their gifts with integrity.",
      safeWording: "Use only confirmed artists, dates and ticket information from the station-supplied copy.",
      toneWarning: "Keep editorial enthusiasm distinct from a paid endorsement.",
      intro: "A gospel collaboration is on the way—and the line-up gives us a question for you.",
      outro: "That is one date for the summer diary, with full details through Premier Gospel.",
      cta: "Send us your dream gospel collaboration.",
      linkLength: "01:40",
    },
  },
  {
    id: "recovery-garden",
    headline: "Recovery group transforms derelict plot into a shared garden",
    source: "Reasons to be Cheerful",
    category: "Good News",
    date: "1 July 2026",
    summary: "People in recovery have created a community garden that now supplies a local food project.",
    status: "Archived",
    radioPotential: 87,
    christianPerspective: 82,
    interaction: 80,
    prayerOpportunity: 78,
    hopeLevel: 94,
    sensitivity: "Medium",
    suggestedShow: "Afternoons with Adam",
    placement: "Hour 1 · Hope Report",
    tags: ["recovery", "community", "charity"],
    prep: {
      whyRadio: "A visible transformation story with authentic voices and a hopeful before-and-after arc.",
      christianPerspective: "Use restoration as a gentle theme without making assumptions about anyone’s faith.",
      listenerQuestion: "What place in your community deserves a new beginning?",
      prayerAngle: "Pray for courage, recovery communities and patient new beginnings.",
      safeWording: "Use person-first language and share recovery details only with explicit consent.",
      toneWarning: "Never sensationalise addiction histories or imply recovery is simple or complete.",
      intro: "A neglected patch of land has become a picture of patient recovery.",
      outro: "New growth in the soil—and in the people tending it.",
      cta: "Tell us where you have seen a genuine new beginning.",
      linkLength: "02:10",
    },
  },
] as const

export const goodNewsFeatures = ["Hope Report", "Good News Around The World", "Proof There’s Still Good In The World"] as const
export const goodNewsFilters = ["kindness", "science breakthrough", "community", "young people", "health", "charity", "recovery", "innovation"] as const
export const christianNewsFilters = ["church", "gospel music", "persecution", "testimony", "faith and culture", "UK Christian news", "global Christian news"] as const

export const showAssignmentOptions = {
  "Sundays with Adam": {
    hours: ["Hour 1", "Hour 2", "Hour 3"],
    links: ["09:18 · Current conversation", "09:43 · Listener interaction", "10:42 · Sunday Hotline", "11:19 · Faith and Finance"],
    features: ["Pastor Yvonne Reflection", "Sunday School", "Listener Interaction", "Prayer"],
  },
  "Afternoons with Adam": {
    hours: ["Hour 1", "Hour 2", "Hour 3"],
    links: ["13:12 · Main interaction", "14:08 · Faith In The Headlines", "15:12 · Good News", "15:38 · Listener voice notes"],
    features: ["Hope Report", "Good News Around The World", "Faith In The Headlines", "Voice Note Verdict"],
  },
  "Saturday Breakfast": {
    hours: ["Hour 1", "Hour 2", "Hour 3"],
    links: ["07:32 · Wake Up & Worship", "08:28 · Saturday Social Club", "09:05 · Events", "09:24 · Guest Spotlight"],
    features: ["Weekend Question", "Saturday Social Club", "Events You Can Attend", "Guest Spotlight"],
  },
} as const
