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
  },
]

export const newListenerQueue = [
  { id: "naomi-b", name: "Naomi Boateng", location: "Reading", source: "2 interactions · voice note", pronunciation: "NAY-oh-mee BOH-teng", duplicate: "" },
  { id: "james-p", name: "James Peters", location: "Enfield", source: "3 interactions · WhatsApp", pronunciation: "JAYMZ PEE-turz", duplicate: "" },
  { id: "marcia-w-new", name: "Marcia W.", location: "Croydon", source: "1 interaction · text", pronunciation: "MAR-sha", duplicate: "Possible duplicate: Marcia Williams · Croydon" },
] as const
