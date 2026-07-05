export type ListenerProfile = {
  id: string
  name: string
  location: string
  gender: string
  birthday: string
  specialOccasion: string
  favouriteSongs: readonly string[]
  favouriteArtists: readonly string[]
  prayerRequests: readonly string[]
  testimonies: readonly string[]
  songRequests: readonly string[]
  firstInteraction: string
  lastInteraction: string
  history: readonly { date: string; channel: string; note: string }[]
  inCongregation: boolean
  newListener: boolean
  pronunciation: string
  familyGroup?: string
  dateAdded?: string
  shows?: readonly string[]
  notes?: string
  sensitive?: boolean
  consentVoiceNote?: boolean
  doNotMention?: boolean
  includeInRollCall?: boolean
  newThisWeek?: boolean
  duplicateWarning?: string
}

export const listenerProfiles: readonly ListenerProfile[] = [
  {
    id: "marcia-w",
    name: "Marcia Williams",
    location: "Croydon",
    gender: "Woman",
    birthday: "18 September",
    specialOccasion: "25th wedding anniversary · 14 August",
    favouriteSongs: ["Jireh", "Promises"],
    favouriteArtists: ["Maverick City Music", "CeCe Winans"],
    prayerRequests: ["Wisdom for a new role at work", "Continued strength for her mother"],
    testimonies: ["Shared that the Sunday School lesson helped restore a family conversation."],
    songRequests: ["Goodness of God · CeCe Winans"],
    firstInteraction: "12 January 2025",
    lastInteraction: "6 July 2026",
    history: [
      { date: "6 Jul", channel: "Voice note", note: "Sunday School response · 00:22" },
      { date: "29 Jun", channel: "WhatsApp", note: "Roll Call check-in from Croydon" },
      { date: "15 Jun", channel: "Song request", note: "Goodness of God for her mother" },
    ],
    inCongregation: true,
    newListener: false,
    pronunciation: "MAR-sha WILL-yums",
    familyGroup: "Williams family",
    dateAdded: "21 June 2026",
    shows: ["Sundays with Adam", "Afternoons with Adam"],
    notes: "Always acknowledge the wider Williams family when they check in together.",
    consentVoiceNote: true,
    includeInRollCall: true,
    newThisWeek: true,
  },
  {
    id: "daniel-k",
    name: "Daniel Kwarteng",
    location: "Leeds",
    gender: "Man",
    birthday: "3 February",
    specialOccasion: "Starting university in September",
    favouriteSongs: ["My Testimony", "You Are Good"],
    favouriteArtists: ["Elevation Worship", "Israel Houghton"],
    prayerRequests: ["Confidence and good community at university"],
    testimonies: ["Received an offer from his first-choice university."],
    songRequests: ["My Testimony · Elevation Worship"],
    firstInteraction: "8 March 2026",
    lastInteraction: "5 July 2026",
    history: [
      { date: "5 Jul", channel: "Text", note: "Shared university testimony" },
      { date: "21 Jun", channel: "WhatsApp", note: "First Roll Call as a regular" },
      { date: "8 Mar", channel: "Voice note", note: "First interaction · prayer request" },
    ],
    inCongregation: true,
    newListener: false,
    pronunciation: "DAN-yul KWAH-teng",
    dateAdded: "21 June 2026",
    shows: ["Sundays with Adam"],
    notes: "Starting university in September; check in again before freshers week.",
    sensitive: true,
    consentVoiceNote: true,
    includeInRollCall: true,
  },
  {
    id: "okafor-family",
    name: "The Okafor Family",
    location: "Birmingham",
    gender: "Family",
    birthday: "Family birthdays held individually",
    specialOccasion: "Baby Amara dedication · 19 July",
    favouriteSongs: ["Way Maker", "Excess Love"],
    favouriteArtists: ["Sinach", "Mercy Chinwo"],
    prayerRequests: ["Baby Amara’s dedication service"],
    testimonies: ["A safe delivery and healthy first month for Amara."],
    songRequests: ["Way Maker · Sinach"],
    firstInteraction: "2 November 2025",
    lastInteraction: "6 July 2026",
    history: [
      { date: "6 Jul", channel: "WhatsApp", note: "Family Roll Call check-in" },
      { date: "22 Jun", channel: "Voice note", note: "Shared baby Amara testimony · 00:31" },
      { date: "2 Nov", channel: "Text", note: "First family song request" },
    ],
    inCongregation: true,
    newListener: false,
    pronunciation: "oh-KAH-for",
    familyGroup: "Okafor family",
    dateAdded: "9 November 2025",
    shows: ["Sundays with Adam", "Saturday Breakfast"],
    notes: "Keep the family together in the spoken Roll Call.",
    consentVoiceNote: true,
    includeInRollCall: true,
  },
  {
    id: "sister-angela",
    name: "Sister Angela Morris",
    location: "Luton",
    gender: "Woman",
    birthday: "27 November",
    specialOccasion: "Church ministry anniversary · October",
    favouriteSongs: ["Never Lost", "Great Is Thy Faithfulness"],
    favouriteArtists: ["Tasha Cobbs Leonard", "The Clark Sisters"],
    prayerRequests: ["Young people in her church"],
    testimonies: ["Her youth group has grown from six to eighteen members."],
    songRequests: ["Never Lost · CeCe Winans"],
    firstInteraction: "14 April 2024",
    lastInteraction: "29 June 2026",
    history: [
      { date: "29 Jun", channel: "Call", note: "Youth ministry testimony" },
      { date: "8 Jun", channel: "WhatsApp", note: "Roll Call and prayer request" },
      { date: "14 Apr", channel: "Text", note: "First interaction" },
    ],
    inCongregation: true,
    newListener: false,
    pronunciation: "AN-juh-lah MOR-iss",
    dateAdded: "21 April 2024",
    shows: ["Sundays with Adam"],
    notes: "Preserve the title Sister when mentioning Angela on air.",
    doNotMention: true,
    includeInRollCall: false,
  },
  {
    id: "naomi-b",
    name: "Naomi Boateng",
    location: "Reading",
    gender: "Woman",
    birthday: "Not known",
    specialOccasion: "New home · moved 28 June",
    favouriteSongs: ["Firm Foundation"],
    favouriteArtists: ["Cody Carnes"],
    prayerRequests: ["Peace and good neighbours in her new home"],
    testimonies: ["Found a home after a difficult six-month search."],
    songRequests: ["Firm Foundation · Cody Carnes"],
    firstInteraction: "28 June 2026",
    lastInteraction: "6 July 2026",
    history: [
      { date: "6 Jul", channel: "Voice note", note: "Second Sunday check-in · 00:18" },
      { date: "28 Jun", channel: "WhatsApp", note: "First interaction and new-home testimony" },
    ],
    inCongregation: false,
    newListener: true,
    pronunciation: "NAY-oh-mee BOH-teng",
    shows: ["Sundays with Adam"],
    notes: "Two interactions so far. Review for Congregation after one more Sunday.",
    consentVoiceNote: false,
  },
]

export const newListenerQueue = [
  {
    id: "naomi-b",
    name: "Naomi Boateng",
    location: "Reading",
    source: "2 interactions · voice note",
    pronunciation: "NAY-oh-mee BOH-teng",
    duplicate: "",
    firstInteraction: "28 June 2026",
    interactionType: "Voice note",
    message: "The Sunday School lesson helped me settle after moving house.",
    show: "Sundays with Adam",
    consentNeeded: true,
  },
  {
    id: "james-p",
    name: "James Peters",
    location: "Enfield",
    source: "3 interactions · WhatsApp",
    pronunciation: "JAYMZ PEE-turz",
    duplicate: "",
    firstInteraction: "14 June 2026",
    interactionType: "WhatsApp",
    message: "Please add my family to the Roll Call—we listen on the school run home from church.",
    show: "Sundays with Adam",
    consentNeeded: false,
  },
  {
    id: "marcia-w-new",
    name: "Marcia W.",
    location: "Croydon",
    source: "1 interaction · text",
    pronunciation: "MAR-sha",
    duplicate: "Possible duplicate: Marcia Williams · Croydon",
    firstInteraction: "5 July 2026",
    interactionType: "Text",
    message: "Morning Adam, checking in from Croydon and requesting Goodness of God.",
    show: "Sundays with Adam",
    consentNeeded: false,
  },
  {
    id: "ruth-a",
    name: "Ruth Adebayo",
    location: "Enfield",
    source: "1 interaction · prayer request",
    pronunciation: "ROOTH ah-deh-BYE-oh",
    duplicate: "",
    firstInteraction: "5 July 2026",
    interactionType: "Prayer request",
    message: "Please pray for courage while we wait for an important family decision.",
    show: "Sundays with Adam",
    consentNeeded: false,
  },
] as const

export const listenerMetrics = [
  { label: "Total listeners", value: "1,486", note: "Known across all shows", kind: "listeners" },
  { label: "Congregation members", value: "1,284", note: "Permanent roll call", kind: "congregation" },
  { label: "New listener queue", value: "4", note: "2 ready to review", kind: "new" },
  { label: "Birthdays this week", value: "6", note: "Next: Aunty Pauline", kind: "birthday" },
  { label: "Prayer requests", value: "18", note: "5 marked sensitive", kind: "prayer" },
  { label: "Testimonies", value: "9", note: "3 ready for air", kind: "testimony" },
  { label: "Song requests", value: "24", note: "This Sunday", kind: "songs" },
  { label: "Most active", value: "Marcia", note: "12 interactions this month", kind: "active" },
] as const
