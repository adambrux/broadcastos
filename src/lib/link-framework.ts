export type LinkFrameworkSectionId = "context" | "recap" | "moment" | "cta" | "tease"

export type LinkFrameworkSection = {
  id: LinkFrameworkSectionId
  title: string
  purpose: string
  prompt: string
  required: boolean
  examples: readonly string[]
}

export type LinkFrameworkValues = {
  context?: string
  recap?: string
  moment?: string
  cta?: string
  tease?: string
}

export type LinkFrameworkValidationOptions = {
  showName?: string
  featureName?: string
}

export const linkFrameworkName = "BroadcastOS Link Framework"

export const linkFrameworkHelperText = "Every listener joins mid-story. Context first, always."

export const linkFrameworkSections: readonly LinkFrameworkSection[] = [
  {
    id: "context",
    title: "Context",
    purpose: "Orient the listener immediately.",
    prompt: "Where am I?",
    required: true,
    examples: [
      "You’re listening to Afternoons with Adam on Premier Gospel.",
      "Welcome back to Adam’s Afternoon Arcade.",
      "It’s just after three, and we’re in Afternoon Uplift.",
    ],
  },
  {
    id: "recap",
    title: "Recap",
    purpose: "Help anyone joining mid-show understand what is happening.",
    prompt: "What are we doing?",
    required: true,
    examples: [
      "If you’ve only just joined us…",
      "Today’s game is…",
      "This afternoon we’ve been talking about…",
    ],
  },
  {
    id: "moment",
    title: "The Moment",
    purpose: "Deliver the main substance of the link.",
    prompt: "Why is this worth listening to?",
    required: true,
    examples: [
      "One story, listener message, clue, reveal or reflection.",
      "One scripture, prayer, transition or station liner.",
      "One clear idea only.",
    ],
  },
  {
    id: "cta",
    title: "Call To Action",
    purpose: "Give the listener one clear action.",
    prompt: "What should I do?",
    required: true,
    examples: [
      "WhatsApp 0303 040 1111.",
      "Text 66777 starting with GOSPEL.",
      "Send your guess / send your story / pray with me.",
    ],
  },
  {
    id: "tease",
    title: "Tease Ahead",
    purpose: "Create momentum into the next item.",
    prompt: "Why should I stay?",
    required: true,
    examples: [
      "I’ll read your messages after this.",
      "Another clue is coming up.",
      "Prayer is coming before we finish.",
    ],
  },
] as const

export function getLinkFrameworkValue(values: LinkFrameworkValues, sectionId: LinkFrameworkSectionId) {
  return values[sectionId]?.trim() ?? ""
}

export function validateLinkFramework(values: LinkFrameworkValues, options: LinkFrameworkValidationOptions = {}) {
  const checks = linkFrameworkSections.map((section) => ({
    id: section.id,
    label: section.title,
    ready: Boolean(getLinkFrameworkValue(values, section.id)),
    hint: section.purpose,
  }))

  const warnings: string[] = []
  const context = getLinkFrameworkValue(values, "context").toLowerCase()
  const recap = getLinkFrameworkValue(values, "recap")
  const cta = getLinkFrameworkValue(values, "cta").toLowerCase()
  const tease = getLinkFrameworkValue(values, "tease")
  const showName = options.showName?.toLowerCase()
  const featureName = options.featureName?.toLowerCase()

  const mentionsShow = Boolean(showName && context.includes(showName))
  const mentionsFeature = Boolean(featureName && context.includes(featureName))
  if (context && !mentionsShow && !mentionsFeature) {
    warnings.push("Context should mention the show or feature.")
  }

  if (!recap) warnings.push("Recap is missing.")
  if (!tease) warnings.push("Tease Ahead is missing.")

  const actionPatterns = [
    /\bwhatsapp\b/,
    /\btext\b/,
    /\bsend\b/,
    /\bcall\b/,
    /\bemail\b/,
    /\bstay\b/,
    /\bpray\b/,
    /\bvisit\b/,
    /\bdownload\b/,
    /\bguess\b/,
  ]
  const actionCount = actionPatterns.filter((pattern) => pattern.test(cta)).length
  if (actionCount > 1 || /\sor\s/.test(cta)) {
    warnings.push("CTA may contain more than one competing listener action.")
  }

  const score = checks.filter((check) => check.ready).length
  return {
    checks,
    warnings,
    ready: checks.every((check) => check.ready) && warnings.length === 0,
    complete: checks.every((check) => check.ready),
    score,
    total: checks.length,
  }
}
