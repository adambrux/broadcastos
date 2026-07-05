export type BrainShow = "Sundays with Adam" | "Afternoons with Adam" | "Saturday Breakfast"
export type FeatureSource = "Manual" | "Template" | "Future AI"
export type FeatureReadiness = "Ready" | "Needs review" | "Draft"

export type FeatureTemplate = {
  id: string
  name: string
  showsUsedOn: readonly BrainShow[]
  purpose: string
  mission: string
  idealLength: string
  energyLevel: string
  targetEmotion: string
  interactionType: string
  readiness: FeatureReadiness
  source: FeatureSource
  idealPlacement: string
  requiredAssets: readonly string[]
  presenterGuidance: string
  producerGuidance: string
  productionWorkflow: readonly string[]
  broadcastWorkflow: readonly string[]
  interactionIdeas: readonly string[]
  suggestedCtas: readonly string[]
  variations: readonly string[]
  successMetrics: readonly string[]
  history: readonly string[]
  notes: string
  prompts: readonly string[]
  analytics: {
    timesUsed: number
    averageDuration: string
    averageWhatsApps: number
    averageVoiceNotes: number
    engagement: string
    bestShow: BrainShow
    lastUsed: string
  }
}

type FeatureSeed = Pick<FeatureTemplate, "name" | "purpose" | "idealLength" | "energyLevel" | "targetEmotion" | "interactionType" | "readiness" | "source">

const sundaySeeds: readonly FeatureSeed[] = [
  { name: "Sunday Show Congregation Roll Call", purpose: "Make every regular listener feel permanently known and welcomed.", idealLength: "04:00–06:00", energyLevel: "Warm", targetEmotion: "Belonging", interactionType: "Names + locations", readiness: "Ready", source: "Manual" },
  { name: "Sunday School", purpose: "Teach one memorable faith lesson through three immersive packaged parts.", idealLength: "13:00–16:00", energyLevel: "Reflective", targetEmotion: "Understanding", interactionType: "Question + voice notes", readiness: "Ready", source: "Template" },
  { name: "Pastor Yvonne Reflection", purpose: "Offer a pastoral reflection that meets listeners gently where they are.", idealLength: "03:00–04:30", energyLevel: "Calm", targetEmotion: "Reassurance", interactionType: "Listener reflection", readiness: "Ready", source: "Manual" },
  { name: "Pastor Yvonne Prayer", purpose: "Close the show with a focused pastoral prayer for the week ahead.", idealLength: "02:00–03:00", energyLevel: "Prayerful", targetEmotion: "Peace", interactionType: "Prayer requests", readiness: "Needs review", source: "Manual" },
  { name: "Track of the Week", purpose: "Give one station-selected track deeper context and repeated attention.", idealLength: "02:00–03:30", energyLevel: "Uplifting", targetEmotion: "Discovery", interactionType: "Listener reaction", readiness: "Ready", source: "Template" },
  { name: "Faith and Finance", purpose: "Introduce practical stewardship wisdom through a concise podcast feature.", idealLength: "05:00–08:00", energyLevel: "Grounded", targetEmotion: "Confidence", interactionType: "Practical question", readiness: "Ready", source: "Template" },
  { name: "Song Requests", purpose: "Let listeners shape the music while sharing dedications and Sunday moments.", idealLength: "05:00–10:00", energyLevel: "Joyful", targetEmotion: "Connection", interactionType: "WhatsApp + text", readiness: "Ready", source: "Manual" },
  { name: "Sunday Hotline", purpose: "Bring one listener voice directly into the Sunday School conversation.", idealLength: "01:30–03:00", energyLevel: "Conversational", targetEmotion: "Recognition", interactionType: "Voice note", readiness: "Draft", source: "Template" },
  { name: "Goodbye / Handover", purpose: "Land the programme warmly and hand listeners confidently to the next show.", idealLength: "01:30–02:30", energyLevel: "Warm", targetEmotion: "Continuity", interactionType: "Final mention", readiness: "Ready", source: "Template" },
] as const

const afternoonSeeds: readonly FeatureSeed[] = [
  { name: "Hope Report", purpose: "Turn one verified hopeful story into a bright, useful afternoon lift.", idealLength: "03:00–05:00", energyLevel: "Bright", targetEmotion: "Hope", interactionType: "Listener question", readiness: "Ready", source: "Template" },
  { name: "Good News Around The World", purpose: "Share a concise global story that proves good things are still happening.", idealLength: "02:30–04:00", energyLevel: "Upbeat", targetEmotion: "Optimism", interactionType: "WhatsApp reaction", readiness: "Ready", source: "Template" },
  { name: "Faith in the Headlines", purpose: "Explore a current story through a thoughtful Christian perspective.", idealLength: "05:00–08:00", energyLevel: "Focused", targetEmotion: "Clarity", interactionType: "Opinion + voice notes", readiness: "Ready", source: "Manual" },
  { name: "Where Did You See God Today?", purpose: "Help listeners notice everyday grace and share it with the audience.", idealLength: "04:00–07:00", energyLevel: "Warm", targetEmotion: "Gratitude", interactionType: "WhatsApp stories", readiness: "Ready", source: "Template" },
  { name: "Kingdom Connections", purpose: "Connect listeners through shared faith, place, work and community.", idealLength: "04:00–06:00", energyLevel: "Lively", targetEmotion: "Belonging", interactionType: "Listener matching", readiness: "Draft", source: "Template" },
  { name: "Voice Note Verdict", purpose: "Let listener voices react directly to the day’s conversation.", idealLength: "03:00–06:00", energyLevel: "Energetic", targetEmotion: "Participation", interactionType: "Voice notes", readiness: "Ready", source: "Manual" },
  { name: "Afternoon Encouragement", purpose: "Deliver one spiritually grounded thought listeners can carry into the day.", idealLength: "02:00–03:30", energyLevel: "Motivational", targetEmotion: "Courage", interactionType: "Reflection", readiness: "Ready", source: "Template" },
  { name: "Prayer Pause", purpose: "Create a short, focused moment of prayer within a busy afternoon.", idealLength: "01:30–03:00", energyLevel: "Still", targetEmotion: "Peace", interactionType: "Prayer request", readiness: "Ready", source: "Template" },
  { name: "Guest Interview", purpose: "Reveal a guest’s story, expertise and faith through a clear question arc.", idealLength: "08:00–14:00", energyLevel: "Conversational", targetEmotion: "Curiosity", interactionType: "Audience question", readiness: "Needs review", source: "Manual" },
  { name: "Listener Takeover", purpose: "Give listeners visible ownership of a section of the programme.", idealLength: "06:00–10:00", energyLevel: "High", targetEmotion: "Delight", interactionType: "Requests + messages", readiness: "Draft", source: "Future AI" },
] as const

const saturdaySeeds: readonly FeatureSeed[] = [
  { name: "Weekend Welcome", purpose: "Open Saturday as a warm, relaxed companion for the weekend ahead.", idealLength: "02:00–03:30", energyLevel: "Relaxed", targetEmotion: "Ease", interactionType: "Weekend check-in", readiness: "Ready", source: "Template" },
  { name: "Pray Off The Week", purpose: "Release the weight of the working week through an opening prayer.", idealLength: "02:00–03:00", energyLevel: "Prayerful", targetEmotion: "Release", interactionType: "AMEN CTA", readiness: "Ready", source: "Template" },
  { name: "Spirit Charge", purpose: "Give listeners a bold, compact faith thought for Saturday.", idealLength: "03:00–05:00", energyLevel: "Bold", targetEmotion: "Courage", interactionType: "Reflection", readiness: "Ready", source: "Manual" },
  { name: "Wake Up & Worship", purpose: "Use a focused worship sequence to lift the energy of the first hour.", idealLength: "08:00–12:00", energyLevel: "Worshipful", targetEmotion: "Joy", interactionType: "Song reaction", readiness: "Ready", source: "Template" },
  { name: "Saturday Social Club", purpose: "Create an easy weekend conversation listeners want to join.", idealLength: "06:00–10:00", energyLevel: "Playful", targetEmotion: "Connection", interactionType: "WhatsApp + text", readiness: "Ready", source: "Template" },
  { name: "Weekend Question", purpose: "Open one relatable, family-friendly conversation for the morning.", idealLength: "04:00–08:00", energyLevel: "Conversational", targetEmotion: "Curiosity", interactionType: "Question + answers", readiness: "Ready", source: "Template" },
  { name: "Events You Can Attend", purpose: "Make gospel events feel useful, current and easy to act on.", idealLength: "04:00–06:00", energyLevel: "Informative", targetEmotion: "Anticipation", interactionType: "Event recommendation", readiness: "Needs review", source: "Manual" },
  { name: "Guest Spotlight", purpose: "Use a concise clip and presenter setup to introduce one compelling guest.", idealLength: "05:00–09:00", energyLevel: "Curious", targetEmotion: "Discovery", interactionType: "Guest question", readiness: "Ready", source: "Template" },
  { name: "Final Weekend Prayer", purpose: "Send listeners into the weekend covered, encouraged and ready.", idealLength: "02:00–03:30", energyLevel: "Calm", targetEmotion: "Peace", interactionType: "Prayer requests", readiness: "Ready", source: "Template" },
] as const

const sundaySchoolPrompts = [
  "Generate Forward Promo",
  "Generate Part One",
  "Generate Part Two",
  "Generate Part Three",
  "Generate Golden Text",
  "Generate Prayer",
  "Generate Audience Question Before",
  "Generate Audience Question After",
  "Generate Podcast Title",
  "Generate Podcast Description",
  "Generate Sound Design Notes",
  "Generate Social Clip Ideas",
] as const

const goodNewsPrompts = [
  "Summarise story for radio",
  "Create Christian perspective",
  "Create listener question",
  "Create prayer angle",
  "Write 60 second presenter intro",
] as const

const defaultPrompts = [
  "Create presenter setup",
  "Create listener interaction question",
  "Create producer checklist",
  "Create concise CTA",
] as const

function toId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function createFeature(seed: FeatureSeed, show: BrainShow, index: number): FeatureTemplate {
  const isSundaySchool = seed.name === "Sunday School"
  const isGoodNews = seed.name === "Hope Report" || seed.name === "Good News Around The World"
  return {
    ...seed,
    id: toId(seed.name),
    showsUsedOn: [show],
    mission: `Make ${seed.name} a recognisable, repeatable part of ${show} while protecting the feature’s emotional purpose.`,
    idealPlacement: show === "Sundays with Adam" ? "Within the Sunday three-hour arc" : show === "Afternoons with Adam" ? "After a clean time and station reset" : "Within the relaxed weekend pace",
    requiredAssets: isSundaySchool
      ? ["Three-part script", "Golden text", "Music beds", "Sound design", "Podcast metadata"]
      : ["Approved presenter copy", "Audio bed or sting", "Listener CTA", "Producer timing note"],
    presenterGuidance: `Sound natural and present. Protect the ${seed.targetEmotion.toLowerCase()} at the centre of the feature; use the structure as support, not as a script to perform at the listener.`,
    producerGuidance: `Confirm the objective, assets, timing and exit before air. Keep ${seed.name} distinct from the links around it and preserve a clean next-item handover.`,
    productionWorkflow: ["Confirm this edition’s objective", "Collect and verify required assets", "Write or shape presenter guidance", "Set timing, CTA and exit", "Mark ready for broadcast"],
    broadcastWorkflow: ["Reset time and station where needed", "Set the listener promise", "Deliver the core feature", "Invite the selected interaction", "Tease or transition cleanly"],
    interactionIdeas: [`Ask for one specific response connected to ${seed.name}`, "Use one voice note or named listener example", "Carry the best response into a later link"],
    suggestedCtas: ["WhatsApp Premier Gospel with your answer", "Send a short voice note", "Tell us where you are listening from"],
    variations: ["Short version for a tight clock", "Extended listener-led version", "Podcast or social follow-up"],
    successMetrics: ["Feature landed within target duration", "Listener response matched the question", "Presenter wording felt natural", "Exit into the next item was clean"],
    history: index % 3 === 0 ? ["v1.2 · Timing refined", "v1.1 · CTA clarified", "v1.0 · Template created"] : ["v1.0 · Template created"],
    notes: "Future edits update future shows only. Historical show instances retain the version used on air.",
    prompts: isSundaySchool ? sundaySchoolPrompts : isGoodNews ? goodNewsPrompts : defaultPrompts,
    analytics: {
      timesUsed: 4 + ((index * 7) % 22),
      averageDuration: seed.idealLength.split("–")[0],
      averageWhatsApps: 6 + ((index * 5) % 31),
      averageVoiceNotes: 1 + (index % 7),
      engagement: `${68 + ((index * 3) % 29)}%`,
      bestShow: show,
      lastUsed: index % 4 === 0 ? "This week" : index % 4 === 1 ? "Last week" : "2 weeks ago",
    },
  }
}

export const featureTemplates: readonly FeatureTemplate[] = [
  ...sundaySeeds.map((seed, index) => createFeature(seed, "Sundays with Adam", index)),
  ...afternoonSeeds.map((seed, index) => createFeature(seed, "Afternoons with Adam", index + sundaySeeds.length)),
  ...saturdaySeeds.map((seed, index) => createFeature(seed, "Saturday Breakfast", index + sundaySeeds.length + afternoonSeeds.length)),
]

export const featureHistory = [
  { feature: "Sunday School", edition: "Solomon and Ecclesiastes 2:11", date: "29 June 2026", version: "v1.3", result: "24 WhatsApps · 5 voice notes" },
  { feature: "Sunday School", edition: "Deborah", date: "22 June 2026", version: "v1.2", result: "19 WhatsApps · 4 voice notes" },
  { feature: "Hope Report", edition: "Kindness story", date: "3 July 2026", version: "v1.1", result: "31 WhatsApps · 8 voice notes" },
  { feature: "Wake Up & Worship", edition: "July summer worship set", date: "4 July 2026", version: "v1.0", result: "82% average engagement" },
] as const

export const featureRelationships = [
  { feature: "Sunday School", uses: ["Scripture", "Storytelling", "Prayer", "Voice Notes", "Podcast Output", "Sound Design", "Social Clips"] },
  { feature: "Sunday Show Congregation Roll Call", uses: ["Audience", "New Listener Queue", "Pronunciation Notes", "Family Groups", "Master Script"] },
  { feature: "Hope Report", uses: ["Newsroom", "Good News Sources", "Listener Question", "Prayer Angle"] },
] as const
