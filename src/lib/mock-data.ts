export const listenerData = [
  { day: "Mon", listeners: 62 },
  { day: "Tue", listeners: 88 },
  { day: "Wed", listeners: 76 },
  { day: "Thu", listeners: 96 },
  { day: "Fri", listeners: 116 },
  { day: "Sat", listeners: 118 },
  { day: "Sun", listeners: 142 },
] as const

export const schedule = [
  { time: "07:00–10:00", show: "The Morning Edit", producer: "Alex Parker", initials: "AP", status: "On air in 24 min" },
  { time: "10:00–12:00", show: "City Voice", producer: "Jamie West", initials: "JW", status: "Upcoming" },
  { time: "12:00–14:00", show: "The Midday Mix", producer: "Sam Carter", initials: "SC", status: "Upcoming" },
  { time: "14:00–16:00", show: "Drive Time", producer: "Kai Bennett", initials: "KB", status: "Upcoming" },
  { time: "16:00–18:00", show: "The Afternoon Flow", producer: "Leslie Park", initials: "LP", status: "Upcoming" },
] as const

export const reviewTasks = [
  { title: "Morning Edit · 4 July", meta: "Air check · 2h 58m", due: "Due today", kind: "audio" },
  { title: "Listener call: 555-0198", meta: "Voicemail · 1:42", due: "Due today", kind: "call" },
  { title: "Guest segment: Dr. Lena Ortiz", meta: "Interview · 18:36", due: "Tomorrow", kind: "audio" },
  { title: "Ad spot: Local Roots Market", meta: "Copy review", due: "8 July", kind: "copy" },
] as const

export const shows = [
  { slug: "sundays-with-adam", title: "Sundays with Adam", host: "Adam Brooks", time: "Sunday · 09:00–12:00", status: "Ready", audience: "24.8K" },
  { slug: "afternoons-with-adam", title: "Afternoons with Adam", host: "Adam Brooks", time: "Weekdays · 13:00–16:00", status: "Live", audience: "31.2K" },
  { slug: "saturday-breakfast", title: "Saturday Breakfast", host: "Jonathan Reid", time: "Saturday · 07:00–10:00", status: "Ready", audience: "27.6K" },
] as const

export type ShowProfile = {
  slug: string
  title: string
  time: string
  presenter: string
  producer: string
  summary: string
  mission?: string
  tone: readonly string[]
  features: readonly { name: string; description: string }[]
  runningOrder: readonly { time: string; title: string; note: string; hour?: string }[]
  listeners: {
    weekly: string
    peak: string
    voiceNotes: string
    completion: string
  }
  assets: readonly { name: string; type: string; status: "Ready" | "In progress" | "Needs review" }[]
  review: readonly { name: string; owner: string; status: "Approved" | "Pending" | "In review" }[]
  audienceSystem?: {
    name: string
    description: string
    total: number
    newThisMonth: number
    queue: readonly { name: string; location: string; joined: string }[]
  }
  sundaySchool?: {
    forwardPromo: string
    parts: readonly { title: string; duration: string; script: string }[]
    goldenText: string
    audienceQuestionBefore: string
    audienceQuestionAfter: string
    soundDesignNotes: readonly string[]
    musicBeds: readonly string[]
    characterVoiceNotes: readonly { character: string; direction: string }[]
    podcastTitle: string
    podcastDescription: string
  }
  producerOS?: readonly { label: string; value: string; note: string }[]
  broadcastLive?: {
    currentLink: string
    nextLink: string
    keyCTA: string
    messages: readonly string[]
    reminder: string
    timer: string
    checks: readonly string[]
  }
  presenterStyle?: readonly string[]
  productionLinks?: readonly {
    title: string
    time: string
    outOf: string
    objective: string
    duration: string
    energy: string
    keyPoints: readonly string[]
    wording: string
    cta: string
    transition: string
    producerNote: string
    dropIfShort: string
    addIfLight: string
    audio: string
  }[]
}

export const showProfiles: Record<string, ShowProfile> = {
  "sundays-with-adam": {
    slug: "sundays-with-adam",
    title: "Sundays with Adam",
    time: "Sunday · 09:00–12:00",
    presenter: "Adam Brooks",
    producer: "Adam Brooks",
    summary: "A warm Sunday gathering built around worship, practical faith, family, prayer and the permanent Sunday Show Congregation.",
    tone: ["Pastoral", "Inspirational", "Motivational", "Warm", "Worshipful", "Conversational", "Family-focused", "Highly interactive"],
    features: [
      { name: "Congregation Roll Call", description: "Churches and listeners check in from across the country." },
      { name: "Pastor Yvonne Reflection", description: "A grounded Sunday reflection with a practical takeaway." },
      { name: "Listener Voice Notes", description: "Testimonies, encouragement and messages from the community." },
      { name: "Sunday School", description: "An accessible Bible lesson for every generation." },
      { name: "Track of the Week", description: "A featured gospel release with artist context." },
      { name: "Faith and Finance", description: "A podcast segment connecting stewardship and everyday life." },
      { name: "Song Requests", description: "Dedications and worship choices from listeners." },
      { name: "Final Prayer", description: "A closing prayer before the handover to Ibe Giantkiller." },
    ],
    runningOrder: [
      { hour: "Hour 1 · Welcome & Congregation", time: "09:00", title: "Welcome", note: "Warm open, Sunday theme and invitation to join the programme." },
      { time: "09:04", title: "Opening song", note: "Worshipful first track with a short back-announce." },
      { time: "09:10", title: "Sunday Show Congregation Roll Call", note: "Permanent cumulative roll call: established regulars first, then this week’s new additions." },
      { time: "09:24", title: "Prayer", note: "Opening prayer for listeners, families, churches and the morning ahead." },
      { time: "09:31", title: "Pastor Yvonne reflection", note: "Packaged reflection followed by Adam’s pastoral response." },
      { time: "09:43", title: "Listener interactions & voice notes", note: "Congregation messages, testimonies and reactions to the reflection." },
      { time: "09:55", title: "Forward promo: Sunday School", note: "Tease the lesson, golden text and audience question coming after 10am." },
      { hour: "Hour 2 · Sunday School", time: "10:00", title: "Reintroduction: time & date", note: "Reset the show, state the time and date, and welcome new listeners." },
      { time: "10:04", title: "Sunday School · Part 1", note: "Set the scene, introduce the lesson and ask the opening audience question." },
      { time: "10:16", title: "Sunday School · Part 2", note: "Develop the story and land the golden text." },
      { time: "10:29", title: "Sunday Hotline voice note", note: "A listener voice note that connects lived experience to the lesson." },
      { time: "10:36", title: "Sunday School · Part 3", note: "Resolve the lesson and make the practical application." },
      { time: "10:49", title: "Listener question", note: "Return to the audience question and share selected responses." },
      { time: "10:56", title: "Preview the final hour", note: "Trail Track of the Week, Faith and Finance, requests and Pastor Yvonne’s prayer." },
      { hour: "Hour 3 · Music, Life & Prayer", time: "11:00", title: "Reintroduction: time & date", note: "Reset the final hour and welcome the Sunday Show Congregation." },
      { time: "11:04", title: "Track of the Week", note: "Play the featured track, then share artist and release context." },
      { time: "11:19", title: "Station liner", note: "Use the approved liner from the weekly station briefing." },
      { time: "11:23", title: "Faith and Finance podcast", note: "Play the selected podcast segment and add Adam’s takeaway." },
      { time: "11:42", title: "Song requests", note: "Congregation dedications, requests and final listener messages." },
      { time: "11:51", title: "Pastor Yvonne prayer", note: "Closing prayer for the congregation and the week ahead." },
      { time: "11:58", title: "Goodbye & handover", note: "Thank the congregation and hand over cleanly to Ibe Giantkiller." },
    ],
    listeners: { weekly: "24.8K", peak: "9.4K", voiceNotes: "186", completion: "72%" },
    assets: [
      { name: "Sunday opener v4", type: "Audio · 00:18", status: "Ready" },
      { name: "Pastor Yvonne reflection", type: "Audio · 08:42", status: "Ready" },
      { name: "Faith and Finance episode 12", type: "Podcast · 12:10", status: "Needs review" },
      { name: "Ibe Giantkiller handover bed", type: "Audio · 00:30", status: "Ready" },
    ],
    review: [
      { name: "Music log", owner: "Adam Brooks", status: "Approved" },
      { name: "Voice note consent", owner: "Production", status: "In review" },
      { name: "Faith and Finance edit", owner: "Adam Brooks", status: "Pending" },
    ],
    audienceSystem: {
      name: "Sunday Show Congregation",
      description: "A permanent, cumulative community. Everyone remains in the roll call every week, and new regular listeners are added over time.",
      total: 1284,
      newThisMonth: 36,
      queue: [
        { name: "Marcia W.", location: "Croydon", joined: "Voice note · today" },
        { name: "The Okafor family", location: "Birmingham", joined: "Message · today" },
        { name: "Daniel K.", location: "Leeds", joined: "Call · last Sunday" },
        { name: "Sister Angela", location: "Luton", joined: "Voice note · last Sunday" },
      ],
    },
    sundaySchool: {
      forwardPromo: "Coming up after 10, Sunday School opens the lesson with one question: what does faithful courage look like before the breakthrough arrives? Keep listening, because your voice notes will become part of the class.",
      parts: [
        {
          title: "Part 1 · Before the breakthrough",
          duration: "04:30",
          script: "Adam sets the scene: faith is often formed while the answer still feels far away. Introduce the central story, name the tension clearly, then invite the congregation to listen for the choice that changes everything.",
        },
        {
          title: "Part 2 · The golden text",
          duration: "05:00",
          script: "Return with a short recap, reveal the golden text and unpack its meaning in everyday language. Move from scripture to home, work and family life without losing the warmth of a shared Sunday conversation.",
        },
        {
          title: "Part 3 · Put it into practice",
          duration: "04:45",
          script: "Resolve the story with a practical invitation for the week. Give listeners one action, one sentence to remember and a clear route back into the audience question before the final music bed.",
        },
      ],
      goldenText: "Let us hold unswervingly to the hope we profess, for he who promised is faithful. — Hebrews 10:23",
      audienceQuestionBefore: "Where in your life are you being asked to trust before you can see the outcome?",
      audienceQuestionAfter: "What one faithful action will you take this week, even if the answer has not arrived yet?",
      soundDesignNotes: [
        "Open with a soft page-turn and distant Sunday room tone; avoid theatrical church bells.",
        "Use one restrained transition motif between parts so the package feels continuous.",
        "Leave a clean two-second breath after the golden text before Adam returns.",
      ],
      musicBeds: [
        "Warm piano and soft pad, 72–76 BPM, no lead vocal.",
        "Light gospel organ texture for the golden text reveal.",
        "Hopeful acoustic bed for the practical application and audience question.",
      ],
      characterVoiceNotes: [
        { character: "Narrator", direction: "Warm, grounded and conversational; never read like a formal lesson." },
        { character: "Young listener", direction: "Curious and natural, with a genuine question rather than a scripted performance." },
        { character: "Elder voice", direction: "Gentle authority, lived experience and a short reflective pace." },
      ],
      podcastTitle: "Sunday School: Faith Before the Breakthrough",
      podcastDescription: "Adam Brooks explores how faithful courage grows before circumstances change, with the golden text, listener questions and one practical action for the week ahead.",
    },
  },
  "afternoons-with-adam": {
    slug: "afternoons-with-adam",
    title: "Afternoons with Adam",
    time: "Weekdays · 13:00–16:00",
    presenter: "Adam Brooks",
    producer: "Adam Brooks",
    summary: "A lively weekday mix of good news, current stories, games, prayer, interviews and hopeful conversation for the Premier Gospel audience.",
    mission: "Make the afternoon feel brighter, more hopeful and more connected while leading people towards Christ through encouragement, conversation, music, prayer and listener interaction.",
    tone: ["Lively", "Energetic", "Modern", "Inspirational", "Motivational", "Hopeful", "Conversational", "Funny when appropriate", "Spiritually grounded", "Highly interactive"],
    features: [
      { name: "The Hope Report", description: "A bright snapshot of hope listeners can carry into the rest of the day." },
      { name: "Where Did You See God Today?", description: "WhatsApp, text and voice-note stories of God in ordinary moments." },
      { name: "Kingdom Connections", description: "People, ministries and ideas making a positive difference." },
      { name: "Voice Note Verdict", description: "The audience gives its quick, honest take on the day’s question." },
      { name: "Faith In The Headlines", description: "A current story explored through a grounded Christian perspective." },
      { name: "Afternoon Encouragement", description: "The daily word of encouragement: practical, hopeful and Christ-centred." },
      { name: "Good News Around The World", description: "One verified uplifting story from beyond the usual news cycle." },
      { name: "Listener Takeover", description: "Shout-outs, song choices and dedications put listeners in control." },
      { name: "Prayer Pause", description: "A focused moment for prayer, perspective and listener needs." },
      { name: "Guest Conversation", description: "At least one warm, purposeful guest interview each week." },
      { name: "Track of the Week", description: "The station-supplied featured track, when available." },
    ],
    runningOrder: [
      { hour: "Hour 1 · Energy & encouragement", time: "13:00", title: "High-energy welcome", note: "Open with the time and date, warmth, pace and a clear promise for the afternoon." },
      { time: "13:06", title: "Main interaction question", note: "Set the daily question and invite WhatsApp, text and voice notes." },
      { time: "13:18", title: "Afternoon Encouragement", note: "A spiritually grounded thought with one practical takeaway." },
      { time: "13:31", title: "Listener responses", note: "Reward the first messages and make the audience feel present." },
      { time: "13:44", title: "Game setup", note: "Explain the mechanic simply, give the first clue and open entries." },
      { time: "13:55", title: "Good News tease", note: "Trail the uplifting global story coming in the final hour." },
      { hour: "Hour 2 · Conversation & perspective", time: "14:00", title: "Reintroduction", note: "Time and date reset, interaction question and a concise hour preview." },
      { time: "14:09", title: "Faith In The Headlines", note: "Current story, Christian perspective and a fair audience question." },
      { time: "14:25", title: "Listener interaction", note: "Texts, WhatsApps and voice notes responding to the conversation." },
      { time: "14:39", title: "Guest Conversation", note: "Live or recorded guest section where available." },
      { time: "14:50", title: "Game development", note: "A second clue, listener guesses and a forward tease." },
      { time: "14:56", title: "Prayer Pause", note: "Brief prayer for the needs emerging from the hour." },
      { hour: "Hour 3 · Good news & listener takeover", time: "15:00", title: "Reintroduction", note: "Time and date reset with a clear promise for the final hour." },
      { time: "15:08", title: "Good News Around The World", note: "Tell one verified uplifting story and land why it matters." },
      { time: "15:22", title: "Game reveal", note: "Reveal the answer, celebrate correct entries and close the loop." },
      { time: "15:32", title: "Listener voice notes", note: "Play selected responses with concise presenter reactions." },
      { time: "15:42", title: "Listener Takeover", note: "Song requests, shout-outs or a dedication moment." },
      { time: "15:52", title: "Final encouragement", note: "One memorable, Christ-centred thought for the journey home." },
      { time: "15:58", title: "Handover", note: "Thank listeners, tease tomorrow and hand over cleanly." },
    ],
    listeners: { weekly: "31.2K", peak: "8.8K", voiceNotes: "243", completion: "64%" },
    assets: [
      { name: "Afternoons opener", type: "Audio · 00:15", status: "Ready" },
      { name: "Good News sting pack", type: "Audio · 6 items", status: "Ready" },
      { name: "Audience game rules", type: "Document · 2 pages", status: "Ready" },
      { name: "Friday guest interview", type: "Audio · 18:26", status: "In progress" },
    ],
    review: [
      { name: "Current stories brief", owner: "Adam Brooks", status: "Approved" },
      { name: "Competition terms", owner: "Compliance", status: "In review" },
      { name: "Friday interview edit", owner: "Adam Brooks", status: "Pending" },
    ],
    producerOS: [
      { label: "Current story", value: "Local volunteers turn an empty high-street shop into a free community pantry.", note: "Confirm location and latest figures before air." },
      { label: "Christian perspective", value: "Neighbour-love is practical: compassion becomes credible when it costs us time.", note: "Keep invitational, not preachy." },
      { label: "Good news source", value: "Positive News · community desk", note: "Source checked 11:40 today." },
      { label: "Audience question", value: "Where did you see God in an ordinary moment today?", note: "Ask for one specific detail." },
      { label: "Game setup", value: "Three-song connection: identify the shared word from today’s clues.", note: "Reveal after 15:20." },
      { label: "Guest prep", value: "Guvna B · resilience, creativity and keeping faith visible.", note: "Three questions, seven-minute clean edit." },
      { label: "Prayer prompt", value: "People carrying pressure at work or waiting on difficult news.", note: "Names only with clear consent." },
      { label: "CTA", value: "WhatsApp your answer or a 20-second voice note now.", note: "Repeat number slowly once." },
      { label: "Station liner placement", value: "14:47 after game clue two.", note: "Approved weekly briefing liner." },
      { label: "Interaction goal", value: "18 usable messages and 6 voice notes by 15:15.", note: "Prioritise new names and varied locations." },
      { label: "Fallback content", value: "Hope Report: three small wins listeners can try before Friday.", note: "Use if messages are low; 3:30 maximum." },
    ],
    broadcastLive: {
      currentLink: "Faith In The Headlines · community pantry",
      nextLink: "Listener responses, then Guvna B clip",
      keyCTA: "Where did you see God today? WhatsApp or send a 20-second voice note.",
      messages: ["Tanya, Lewisham — “A stranger paid for my coffee.”", "Michael, Coventry — “My team prayed before a difficult meeting.”", "Ruth, Enfield — voice note · 00:18"],
      reminder: "Land the Christian perspective in one sentence, then get back to listeners.",
      timer: "02:30",
      checks: ["WhatsApp", "Text number", "Voice note", "Time check", "Station ID", "Prayer", "Tease ahead", "Liner used"],
    },
  },
  "saturday-breakfast": {
    slug: "saturday-breakfast",
    title: "Saturday Breakfast",
    time: "Saturday · 07:00–10:00",
    presenter: "Jonathan Reid",
    producer: "Adam Brooks",
    summary: "A bold but relaxed start to the weekend with worship, conversation, community events and faith-filled encouragement for the whole family.",
    mission: "Help listeners ease into the weekend with joy, worship, prayer, practical faith, community, lifestyle conversation and gospel music.",
    tone: ["Bold but relaxed", "Warm", "Weekend-focused", "Family-friendly", "Conversational", "Lightly humorous", "Faith-filled", "Easy to listen to"],
    features: [
      { name: "Weekend Welcome", description: "A warm reset from the working week into Saturday." },
      { name: "Pray Off The Week", description: "Release the week’s stresses and make room for rest." },
      { name: "Spirit Charge", description: "A concise, energising faith reflection with practical application." },
      { name: "Wake Up & Worship", description: "An uplifting early set that eases listeners into Saturday." },
      { name: "Saturday Social Club", description: "Listener plans, family moments and weekend check-ins." },
      { name: "Weekend Question", description: "An easy, inviting question that carries through the programme." },
      { name: "Events You Can Attend", description: "Useful gospel, church, community and family events." },
      { name: "Guest Spotlight", description: "A focused artist or guest interview clip and music follow-up." },
      { name: "Seasonal Lifestyle Chat", description: "Timely, playful conversation such as heatwave foods and weekend habits." },
      { name: "Final Weekend Prayer", description: "A calm prayer and confident handover into the rest of Saturday." },
    ],
    runningOrder: [
      { hour: "Hour 1 · Release the week", time: "07:02", title: "Top-of-hour welcome", note: "Weekend welcome, time and date, warm orientation." },
      { time: "07:07", title: "Pray Off The Week", note: "Prayer to release the stresses of the week; WhatsApp CTA: send AMEN." },
      { time: "07:14", title: "Preview the morning", note: "Trail worship, Spirit Charge, Social Club and the weekend question." },
      { time: "07:24", title: "Spirit Charge", note: "Scripture, natural reflection and one useful thought for Saturday." },
      { time: "07:38", title: "Wake Up & Worship", note: "Uplifting worship sequence with light, companionable links." },
      { time: "07:52", title: "Listener response", note: "Read AMEN messages, locations and early weekend plans." },
      { time: "07:57", title: "Tease Hour 2", note: "Trail Track of the Week, Social Club and the lifestyle debate." },
      { hour: "Hour 2 · Saturday Social Club", time: "08:01", title: "Reintroduction", note: "Time and date reset, easy welcome for new listeners." },
      { time: "08:08", title: "Track of the Week", note: "Station-supplied track and concise artist context." },
      { time: "08:22", title: "Saturday Social Club", note: "Listener plans, family moments and weekend shout-outs." },
      { time: "08:34", title: "Weekend question", note: "Heatwave foods: what are you eating when it is too hot to cook?" },
      { time: "08:44", title: "Listener responses", note: "Mix texts, WhatsApps and one voice note." },
      { time: "08:51", title: "Lifestyle story", note: "A light, inclusive debate with room for Jonathan’s humour." },
      { time: "08:56", title: "Station liner", note: "Premier Marketplace summer reading P2 read, where scheduled." },
      { time: "08:59", title: "Tease Hour 3", note: "July gospel events, Guvna B and final prayer." },
      { hour: "Hour 3 · What’s on & send-off", time: "09:05", title: "Reintroduction", note: "Time and date reset with a clear final-hour preview." },
      { time: "09:12", title: "Events You Can Attend", note: "Curated July gospel events with essential dates and locations." },
      { time: "09:26", title: "Guest Spotlight", note: "Guvna B interview clip with one natural setup and takeaway." },
      { time: "09:36", title: "Featured artist song", note: "Play Guvna B and back-announce the track cleanly." },
      { time: "09:51", title: "Final Weekend Prayer", note: "Prayer for rest, relationships, plans and the week ahead." },
      { time: "09:58", title: "Sign off & handover", note: "Warm goodbye and clean handover." },
    ],
    listeners: { weekly: "27.6K", peak: "10.1K", voiceNotes: "154", completion: "69%" },
    assets: [
      { name: "Saturday Breakfast opener", type: "Audio · 00:20", status: "Ready" },
      { name: "Spirit Charge bed", type: "Audio · 02:30", status: "Ready" },
      { name: "Weekend events sheet", type: "Document · 14 events", status: "In progress" },
      { name: "Guest clip: Naomi Raine", type: "Audio · 07:14", status: "Needs review" },
    ],
    review: [
      { name: "Weekend events verification", owner: "Production", status: "In review" },
      { name: "Guest clip edit", owner: "Adam Brooks", status: "Pending" },
      { name: "Music log", owner: "Jonathan Reid", status: "Approved" },
    ],
    presenterStyle: ["Bold but relaxed", "Warm and natural", "Not overly scripted", "A weekend companion", "Clear but not preachy"],
    productionLinks: [
      {
        title: "Pray Off The Week",
        time: "07:07",
        outOf: "Weekend Welcome bed",
        objective: "Help listeners release the pressure of the week and enter Saturday with peace.",
        duration: "02:30",
        energy: "Calm · warm",
        keyPoints: ["Name the pace of the week", "Invite a breath", "Pray for rest and renewal"],
        wording: "If this week has felt heavy, you do not have to carry all of it into Saturday. Let’s take a breath and pray together.",
        cta: "Send AMEN on WhatsApp and tell us where you’re listening.",
        transition: "Now we’ve made some room, let’s fill it with worship.",
        producerNote: "Keep the prayer spacious; fade bed fully by final line.",
        dropIfShort: "Location read-outs.",
        addIfLight: "One short listener prayer request with consent.",
        audio: "Soft piano bed · no sting out.",
      },
      {
        title: "Wake Up & Worship",
        time: "07:38",
        outOf: "Spirit Charge",
        objective: "Lift the room musically without turning the link into a sermon.",
        duration: "00:45",
        energy: "Building · joyful",
        keyPoints: ["Reset the title", "Name the first artist", "Invite listeners into the set"],
        wording: "Wherever Saturday has found you, this is your moment to turn the volume up a little. Let’s wake up and worship together.",
        cta: "Send the worship song that always changes your morning.",
        transition: "Premier Gospel — this is Wake Up & Worship.",
        producerNote: "Jonathan should sound like a companion joining in, not introducing a performance.",
        dropIfShort: "Listener CTA.",
        addIfLight: "One sentence on why the first song was chosen.",
        audio: "Wake Up & Worship sting into three-track set.",
      },
      {
        title: "Heatwave foods question",
        time: "08:34",
        outOf: "Saturday Social Club",
        objective: "Create an easy, funny and family-friendly shared conversation.",
        duration: "01:45",
        energy: "Playful · conversational",
        keyPoints: ["Too hot to cook", "Cold dinners count", "Invite one controversial choice"],
        wording: "Be honest: when the kitchen feels like a greenhouse, what is the meal? Salad, cereal, ice cream — and yes, apparently some of you are still turning the oven on.",
        cta: "WhatsApp your heatwave food and defend your choice.",
        transition: "Your answers after this — and I’m already questioning some of them.",
        producerNote: "Give Jonathan room to react; choose messages with vivid specifics.",
        dropIfShort: "Second presenter example.",
        addIfLight: "Quick ‘acceptable or unacceptable?’ food poll.",
        audio: "Light summer bed under setup; clean song intro.",
      },
      {
        title: "Premier Marketplace · summer reading P2",
        time: "08:56",
        outOf: "Lifestyle story",
        objective: "Deliver the scheduled read clearly while keeping the weekend tone.",
        duration: "00:40",
        energy: "Bright · useful",
        keyPoints: ["Summer reading", "Premier Marketplace", "Clear route to find out more"],
        wording: "If your weekend needs a slower moment and a good book, Premier Marketplace has your summer reading sorted — thoughtful picks for faith, family and a little breathing space.",
        cta: "Visit Premier Marketplace and explore the summer reading collection.",
        transition: "Still to come: July events and Guvna B.",
        producerNote: "P2 approved copy; do not paraphrase offer details.",
        dropIfShort: "Opening lifestyle sentence.",
        addIfLight: "One approved title from the briefing.",
        audio: "Marketplace bed at -18 LUFS; button with station ID.",
      },
      {
        title: "July gospel events",
        time: "09:12",
        outOf: "Reintroduction",
        objective: "Give listeners genuinely useful event options for the month.",
        duration: "03:30",
        energy: "Useful · upbeat",
        keyPoints: ["Event name", "Date and location", "Where to verify details"],
        wording: "Let’s get something good in the diary. Here are three gospel events you can actually attend this July.",
        cta: "Send us the gospel or community event we should add next week.",
        transition: "From what’s happening around us to an artist shaping the conversation — Guvna B is next.",
        producerNote: "All mock listings must be replaced with verified station briefing details before air.",
        dropIfShort: "Third event.",
        addIfLight: "One listener-submitted event marked as unverified.",
        audio: "Low rhythmic bed; dip fully for dates and locations.",
      },
      {
        title: "Guvna B interview clip",
        time: "09:26",
        outOf: "Events bed",
        objective: "Introduce the clip naturally and leave listeners with one memorable idea.",
        duration: "07:00",
        energy: "Curious · grounded",
        keyPoints: ["Resilience", "Faith in public life", "Set up the featured song"],
        wording: "Guvna B has always made room for honesty alongside hope. In this conversation, he talks about what keeps faith real when life gets complicated.",
        cta: "Tell us which line stayed with you.",
        transition: "You’ve heard the heart behind it — now here’s the music.",
        producerNote: "Clip begins clean at 00:14; Jonathan reacts for no more than 25 seconds.",
        dropIfShort: "Final interview answer; use 04:40 edit.",
        addIfLight: "One contextual question before the clip.",
        audio: "Guest Spotlight sting; clip; clean launch into Guvna B track.",
      },
      {
        title: "Final Weekend Prayer",
        time: "09:51",
        outOf: "Featured artist song",
        objective: "Close with warmth, practical faith and a settled handover.",
        duration: "03:00",
        energy: "Reflective · hopeful",
        keyPoints: ["Rest", "Relationships and plans", "Grace for the week ahead"],
        wording: "Before we head into the rest of Saturday, let’s place the weekend — the plans we have and the things we cannot control — into God’s hands.",
        cta: "No CTA; let the prayer land.",
        transition: "Have a joyful, peaceful weekend. Stay with Premier Gospel.",
        producerNote: "No extra message reads after prayer; protect the final beat.",
        dropIfShort: "Middle prayer section on plans.",
        addIfLight: "Ten seconds of silence before the closing line.",
        audio: "Warm prayer bed; handover sting on final station name.",
      },
    ],
  },
}

export const stationHealth = [
  { label: "Stream", detail: "Main studio", value: "Live" },
  { label: "Automation", detail: "Program playback", value: "OK" },
  { label: "Storage", detail: "1.2 TB of 2 TB", value: "62%" },
  { label: "Listeners now", detail: "Peak this hour 3,105", value: "2,342" },
] as const
