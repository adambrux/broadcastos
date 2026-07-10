"use client"

import { useSyncExternalStore } from "react"

import { validateLinkFramework, type LinkFrameworkValues } from "@/lib/link-framework"

export type StudioShowId = "sundays" | "afternoons" | "saturday"
export type StudioMode = "in-studio" | "remote"

export type StudioItem = {
  id: string
  time: string
  title: string
  type: string
  hour: string
  featureId: string
  objective: string
  duration: string
  context: string
  recap: string
  script: string
  cta: string
  tease: string
  fallback: string
  stationRequirement: string
  notes: string
  done: boolean
}

export type ListenerMessage = {
  id: string
  sender: string
  body: string
  text: string
  songRequests: string[]
  selected: boolean
}

export type StudioWorkspace = {
  mode: StudioMode
  showId: StudioShowId
  date: string
  items: StudioItem[]
  messages: ListenerMessage[]
  updatedAt: string
}

export const studioShows = {
  sundays: { name: "Sundays with Adam", schedule: "Sunday · 09:00–12:00" },
  afternoons: { name: "Afternoons with Adam", schedule: "Weekdays · 13:00–16:00" },
  saturday: { name: "Saturday Breakfast", schedule: "Saturday · 07:00–10:00" },
} as const

const makeItem = (
  id: string,
  time: string,
  title: string,
  type: string,
  objective: string,
  duration = "02:00",
  details: Partial<Omit<StudioItem, "id" | "time" | "title" | "type" | "objective" | "duration" | "done">> = {}
): StudioItem => ({
  id,
  time,
  title,
  type,
  hour: details.hour ?? "",
  featureId: details.featureId ?? title,
  objective,
  duration,
  context: details.context ?? "",
  recap: details.recap ?? "",
  script: details.script ?? "",
  cta: details.cta ?? "",
  tease: details.tease ?? "",
  fallback: details.fallback ?? "",
  stationRequirement: details.stationRequirement ?? "",
  notes: details.notes ?? "",
  done: false,
})

export const studioTemplates: Record<StudioShowId, StudioItem[]> = {
  sundays: [
    makeItem("sun-welcome", "09:00", "Welcome", "Link", "Open warmly, give the time and invite listeners into the show.", "02:30", {
      hour: "Hour 1",
      featureId: "Welcome & Congregation",
      context: "You’re listening to Sundays with Adam on Premier Gospel. It’s Sunday morning, I’m Adam Brooks, and we’re beginning three hours of worship, conversation and family.",
      recap: "If you’ve just joined us, this is the Sunday morning show where we gather the Sunday Show Congregation, pray together and make space for worship and encouragement.",
      script: "Today we’ll welcome the Congregation, hear Pastor Yvonne’s reflection, open Sunday School after ten and end with music, life and prayer before Ibe Giantkiller.",
      cta: "Send your good morning and where you’re listening from.",
      tease: "After this first song, we’ll begin the Sunday Show Congregation Roll Call.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("sun-roll-call", "09:12", "Sunday Show Congregation Roll Call", "Feature", "Welcome the permanent congregation and this week’s new listeners.", "10:00", {
      hour: "Hour 1",
      featureId: "Sunday Show Congregation Roll Call",
      context: "You’re listening to Sundays with Adam on Premier Gospel, and we’re gathering the Sunday Show Congregation.",
      recap: "If you’ve just joined us, the Roll Call is permanent and cumulative — once you’re part of the Congregation, you stay in the family unless you ask us to remove you.",
      script: "Let’s welcome the names, families, towns and new additions who are part of our Sunday morning community this week.",
      cta: "Send your name and location if you’d like to be welcomed into the Sunday Show Congregation.",
      tease: "After the Roll Call, we’ll settle the morning with prayer.",
    }),
    makeItem("sun-prayer", "09:25", "Opening prayer", "Prayer", "Settle the programme and pray for listeners.", "02:30", {
      hour: "Hour 1",
      featureId: "Opening Prayer",
      context: "You’re listening to Sundays with Adam on Premier Gospel, and we’re taking a moment to pray together.",
      recap: "If you’ve just joined us, we’ve opened the show and welcomed the Sunday Show Congregation.",
      script: "Lord, meet every listener exactly where they are this morning. Bring peace into homes, hope into hearts and joy into this Sunday. Amen.",
      cta: "Pray with me where you are.",
      tease: "Pastor Yvonne’s reflection is coming up shortly.",
    }),
    makeItem("sun-reflection", "09:33", "Pastor Yvonne reflection", "Package", "Introduce the reflection and respond briefly afterwards.", "03:30", {
      hour: "Hour 1",
      featureId: "Pastor Yvonne Reflection",
      context: "You’re listening to Sundays with Adam on Premier Gospel, and Pastor Yvonne is bringing our Sunday reflection.",
      recap: "If you’ve just joined us, this is the part of the first hour where we pause for a pastoral thought to carry into the week.",
      script: "Here’s Pastor Yvonne with a reflection for your Sunday morning. Listen for the one sentence God might be putting in your hands today.",
      cta: "Send the line that stood out to you.",
      tease: "After the reflection, we’ll hear from you and look ahead to Sunday School.",
    }),
    makeItem("sun-school-1", "10:05", "Sunday School · Part 1", "Feature", "Set up the lesson and ask the first audience question.", "05:00", {
      hour: "Hour 2",
      featureId: "Sunday School",
      context: "You’re listening to Sundays with Adam on Premier Gospel. It’s just after ten, and Sunday School is open.",
      recap: "If you’ve just joined us, today’s lesson is [lesson title], and we’re beginning with the question: [audience question before].",
      script: "Part one sets up the story, names the tension and helps us hear why this lesson matters for ordinary life.",
      cta: "Send your answer to the Sunday School question.",
      tease: "Part two is coming next with the golden text.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("sun-school-2", "10:22", "Sunday School · Part 2", "Feature", "Develop the lesson and land the golden text.", "05:00", {
      hour: "Hour 2",
      featureId: "Sunday School",
      context: "You’re listening to Sunday School on Sundays with Adam on Premier Gospel.",
      recap: "If you’ve just joined us, today we’re learning about [lesson title], and part one opened the big question of [question recap].",
      script: "Now we open the golden text: [golden text]. Let’s hear what this scripture gives us for home, work, church and the week ahead.",
      cta: "Send one word that sums up what the golden text says to you.",
      tease: "Part three will turn the lesson into one practical action.",
    }),
    makeItem("sun-school-3", "10:42", "Sunday School · Part 3", "Feature", "Resolve the lesson with one practical action.", "05:00", {
      hour: "Hour 2",
      featureId: "Sunday School",
      context: "You’re listening to the final part of Sunday School on Premier Gospel.",
      recap: "If you’ve just joined us, we’ve been looking at [lesson title] through [golden text].",
      script: "The practical action is this: [application]. This is the part we can live before next Sunday arrives.",
      cta: "Send the faithful action you’re taking this week.",
      tease: "In the final hour, we’ll move into Track of the Week, Faith and Finance and prayer.",
      stationRequirement: "Second time check · Second station ID · Second presenter ID",
    }),
    makeItem("sun-track", "11:08", "Track of the Week", "Feature", "Introduce the station-supplied track.", "02:30", {
      hour: "Hour 3",
      featureId: "Track of the Week",
      context: "You’re listening to Sundays with Adam on Premier Gospel, and we’re in the final hour with Track of the Week.",
      recap: "If you’ve just joined us, this is the station-supplied song we’re giving special attention to this week.",
      script: "Here’s why this track matters today: [track context]. Listen out for [lyric/theme].",
      cta: "Tell me what this song makes you think about.",
      tease: "Faith and Finance is coming up later this hour.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("sun-finance", "11:24", "Faith and Finance", "Package", "Introduce the podcast and connect it to everyday life.", "04:00", {
      hour: "Hour 3",
      featureId: "Faith and Finance",
      context: "You’re listening to Sundays with Adam on Premier Gospel, and it’s time for Faith and Finance.",
      recap: "If you’ve just joined us, this is where practical stewardship meets real everyday life.",
      script: "Today’s podcast thought is about [topic]. The question underneath it is how we honour God with the decisions we make Monday to Saturday.",
      cta: "Think of one practical money decision you can pray about this week.",
      tease: "Pastor Yvonne’s final prayer is still to come before we hand over to Ibe Giantkiller.",
    }),
    makeItem("sun-prayer-final", "11:50", "Final prayer and handover", "Prayer", "Close pastorally and hand over cleanly to Ibe Giantkiller.", "05:00", {
      hour: "Hour 3",
      featureId: "Pastor Yvonne Prayer / Handover",
      context: "You’re listening to the final moments of Sundays with Adam on Premier Gospel.",
      recap: "This morning we’ve gathered the Sunday Show Congregation, opened Sunday School, shared music, life and prayer.",
      script: "Let’s close with prayer and send you into the rest of Sunday with peace, courage and hope.",
      cta: "Stay with Premier Gospel as Ibe Giantkiller takes you into the afternoon.",
      tease: "Ibe Giantkiller is up next with more Premier Gospel for your Sunday.",
      stationRequirement: "Second time check · Second station ID · Presenter ID · handover",
    }),
  ],
  afternoons: [
    makeItem("aft-1-1", "13:00", "Welcome · Afternoon Conversation", "Link", "Open the programme, identify the show and preview all three hours.", "02:30", {
      hour: "1PM",
      featureId: "The Afternoon Conversation",
      context: "You’re listening to Afternoons with Adam on Premier Gospel. It’s [time] on [date], I’m Adam Brooks, and for this first hour we’re opening today’s Afternoon Conversation.",
      recap: "Across the next three hours we’ll talk, play Adam’s Afternoon Arcade at two, and finish with Afternoon Uplift after three.",
      script: "Today I want us to take one real-life story and turn it into a conversation about faith, hope and the way we actually live.",
      cta: "Send me your first thought on today’s question.",
      tease: "Stay with me, because after the next song I’ll explain the story and why I think it matters.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("aft-1-2", "13:12", "Explain today’s story", "Feature", "Turn one topical story into a life conversation.", "03:00", {
      hour: "1PM",
      featureId: "The Afternoon Conversation",
      context: "You’re listening to Afternoons with Adam on Premier Gospel, and we’re inside today’s Afternoon Conversation.",
      recap: "If you’ve just joined us, we’re talking about [story] — and the bigger question is [question].",
      script: "Here’s why this matters beyond the headline: [why it matters]. I think the faith angle is less about winning an argument and more about asking what love, wisdom and courage look like here.",
      cta: "What would you do in this situation?",
      tease: "I’ll read some of your thoughts in a moment.",
    }),
    makeItem("aft-1-3", "13:25", "Continue conversation", "Interaction", "Recap clearly so messages can arrive, then move the conversation forward.", "02:30", {
      hour: "1PM",
      featureId: "The Afternoon Conversation",
      context: "You’re listening to Afternoons with Adam on Premier Gospel, and we’re in the middle of today’s Afternoon Conversation.",
      recap: "If you’ve just joined us, today we’re asking [question] after [one-line story recap].",
      script: "A different way to look at this is [fresh angle]. That’s where it gets personal, because many of us have had to make decisions like this quietly.",
      cta: "Send me one sentence: yes, no, or ‘it depends’ — and why.",
      tease: "Coming up, I want to add one personal reflection that might change how we hear this story.",
    }),
    makeItem("aft-1-4", "13:36", "Personal reflection", "Link", "Develop the thought without repeating the same setup.", "02:00", {
      hour: "1PM",
      featureId: "The Afternoon Conversation",
      context: "You’re listening to Afternoons with Adam on Premier Gospel, and we’re still unpacking today’s Afternoon Conversation.",
      recap: "The story is [recap], but the deeper question is what kind of people this moment is inviting us to become.",
      script: "My honest reflection is [personal reflection]. Sometimes the most Christian response is not the loudest one; it’s the one that helps somebody feel seen and steady.",
      cta: "Tell me where you’ve seen this play out in real life.",
      tease: "Next, I’ll try to land the takeaway for the first hour.",
    }),
    makeItem("aft-1-5", "13:48", "Takeaway and life application", "Feature", "Give listeners one practical thought they can carry.", "02:30", {
      hour: "1PM",
      featureId: "The Afternoon Conversation",
      context: "You’re listening to Afternoons with Adam on Premier Gospel, and we’re landing the first hour’s Afternoon Conversation.",
      recap: "If you’ve just joined us, we’ve been talking about [story] and asking [question].",
      script: "The takeaway for me is [takeaway]. A possible scripture that sits with this is [scripture], not as a slogan, but as a way to live this out today.",
      cta: "Send me the one word this conversation leaves you with.",
      tease: "After the news, the Arcade opens at two.",
      stationRequirement: "Second time check · Second station ID · Second presenter ID",
    }),
    makeItem("aft-1-6", "13:55", "Wrap hour and tease Arcade", "Interaction", "Read messages, close the thought and make two o’clock feel appointment-to-listen.", "02:00", {
      hour: "1PM",
      featureId: "The Afternoon Conversation",
      context: "You’re listening to Afternoons with Adam on Premier Gospel. We’re just wrapping the first hour’s Afternoon Conversation.",
      recap: "This hour we’ve been talking about [question], and your messages have taken it in some brilliant directions.",
      script: "Let me read a couple before we move on: [messages]. The big thought I’m keeping is [final thought].",
      cta: "Last message on this: what’s your one-line takeaway?",
      tease: "At two, Adam’s Afternoon Arcade opens — today’s challenge is [game].",
    }),
    makeItem("aft-2-1", "14:05", "Launch Adam’s Afternoon Arcade", "Interaction", "Create an appointment-to-listen moment and explain the rules.", "03:00", {
      hour: "2PM",
      featureId: "Adam’s Afternoon Arcade",
      context: "Welcome to Adam’s Afternoon Arcade on Premier Gospel. If you’ve just joined us, I’m Adam Brooks and the Arcade is officially open.",
      recap: "Today’s challenge is called [game name]. Here’s how it works: [rules].",
      script: "This is the bit of the show where we loosen the shoulders, use the brain a little, and see who’s brave enough to play along.",
      cta: "Send your first answer now.",
      tease: "I’ll give you the first clue after this.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("aft-2-2", "14:18", "Arcade recap and clue one", "Interaction", "Recap the game for new listeners and add the first clue.", "02:30", {
      hour: "2PM",
      featureId: "Adam’s Afternoon Arcade",
      context: "Welcome back to Adam’s Afternoon Arcade on Premier Gospel.",
      recap: "If you’ve just joined us, today’s challenge is [game]. The rules are [short rules].",
      script: "Here’s your next clue: [clue]. Also, the fun thing about this is [talking point].",
      cta: "Send your updated guess.",
      tease: "More guesses and another clue are coming up.",
    }),
    makeItem("aft-2-3", "14:30", "Arcade guesses and clue two", "Interaction", "Read guesses, keep the game moving and add a second clue.", "03:00", {
      hour: "2PM",
      featureId: "Adam’s Afternoon Arcade",
      context: "You’re listening to Adam’s Afternoon Arcade on Afternoons with Adam.",
      recap: "If you’ve just joined us, we’re playing [game], and so far the clues are [clues].",
      script: "Let’s see what you’re guessing: [messages]. I’m not saying you’re close, but I’m also not saying you’re miles away. Here’s the next clue: [clue].",
      cta: "Lock in a fresh guess.",
      tease: "Final clue is still to come.",
    }),
    makeItem("aft-2-4", "14:42", "Final clue and messages", "Interaction", "Give the final clue and build towards the reveal.", "02:30", {
      hour: "2PM",
      featureId: "Adam’s Afternoon Arcade",
      context: "Welcome back to Adam’s Afternoon Arcade on Premier Gospel.",
      recap: "If you’ve just joined us, today’s challenge is [game], and you’re trying to work out [answer target].",
      script: "Final clue before we start closing this down: [final clue]. A few more guesses coming in: [messages].",
      cta: "Send your final answer now.",
      tease: "After this, last chance to lock it in.",
      stationRequirement: "Second time check · Second station ID · Second presenter ID",
    }),
    makeItem("aft-2-5", "14:50", "Last chance to answer", "Interaction", "Create urgency before the reveal.", "01:30", {
      hour: "2PM",
      featureId: "Adam’s Afternoon Arcade",
      context: "You’re listening to Adam’s Afternoon Arcade, and we are moments away from the reveal.",
      recap: "Today’s challenge has been [game], with clues pointing to [short clue recap].",
      script: "This is your last chance. No shame if you’ve only just joined — sometimes the late guesses are the best guesses.",
      cta: "Send your final answer before the next song ends.",
      tease: "The reveal is next.",
    }),
    makeItem("aft-2-6", "14:56", "Reveal and close Arcade", "Interaction", "Reveal, celebrate and close the Arcade with the permanent line.", "02:30", {
      hour: "2PM",
      featureId: "Adam’s Afternoon Arcade",
      context: "You’re listening to Adam’s Afternoon Arcade on Premier Gospel, and it is reveal time.",
      recap: "If you’ve just joined us, today’s challenge was [game], and the answer is about to land.",
      script: "The answer is [answer]. Congratulations to [names]. The Arcade closes for today… but it’ll be open again tomorrow at two.",
      cta: "Send a clap for today’s winner.",
      tease: "After three, we move into Afternoon Uplift — something to help you leave stronger.",
    }),
    makeItem("aft-3-1", "15:05", "Welcome to Afternoon Uplift", "Link", "Reset the show, introduce Track of the Week and preview a stronger final hour.", "03:00", {
      hour: "3PM",
      featureId: "Afternoon Uplift",
      context: "You’re listening to Afternoons with Adam on Premier Gospel. It’s [time], I’m Adam Brooks, and welcome to Afternoon Uplift.",
      recap: "So far today we’ve had [conversation recap] and Adam’s Afternoon Arcade.",
      script: "This final hour is here to help us leave stronger — not preachier, just stronger. We’ll start with Track of the Week: [track].",
      cta: "Tell me one thing you need strength for this week.",
      tease: "After the track, I’ll share the thought behind today’s Uplift.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("aft-3-2", "15:18", "Fresh observation", "Feature", "Offer a fresh life thought before scripture.", "02:30", {
      hour: "3PM",
      featureId: "Afternoon Uplift",
      context: "You’re listening to Afternoon Uplift on Afternoons with Adam.",
      recap: "If you’ve just joined us, this is the part of the show where we slow down slightly and leave stronger.",
      script: "Here’s the observation I keep coming back to: [life thought]. Sometimes strength looks quieter than we expect.",
      cta: "Send me the word ‘strength’ if that’s landing for you today.",
      tease: "In a moment, I’ll connect this with a Bible story.",
    }),
    makeItem("aft-3-3", "15:30", "Bible story and application", "Feature", "Bring scripture in naturally and apply it to real life.", "03:00", {
      hour: "3PM",
      featureId: "Afternoon Uplift",
      context: "You’re listening to Afternoon Uplift on Premier Gospel.",
      recap: "If you’ve just joined us, today’s thought is about [theme] — leaving stronger, not heavier.",
      script: "There’s a Bible story that helps me here: [story]. The scripture says [scripture]. The application is simple: [application].",
      cta: "Where do you need to practise that today?",
      tease: "We’ll pray about that in a moment.",
    }),
    makeItem("aft-3-4", "15:42", "Prayer", "Prayer", "Pray briefly, warmly and directly for listeners.", "02:00", {
      hour: "3PM",
      featureId: "Afternoon Uplift",
      context: "You’re listening to Afternoons with Adam on Premier Gospel, and we’re taking a moment to pray.",
      recap: "If you’ve just joined us, we’ve been talking about [theme] and asking God for strength for ordinary life.",
      script: "Lord, for every listener carrying something quietly today, meet them with courage, peace and wisdom. Help us leave this hour stronger than we entered it. Amen.",
      cta: "If you’d like prayer, send the word ‘prayer’.",
      tease: "I’ll read a few encouragements before we say goodbye.",
      stationRequirement: "Second time check · Second station ID · Second presenter ID",
    }),
    makeItem("aft-3-5", "15:50", "Listener encouragement", "Interaction", "Use listener responses and land the final takeaway.", "02:30", {
      hour: "3PM",
      featureId: "Afternoon Uplift",
      context: "You’re listening to the final few minutes of Afternoons with Adam on Premier Gospel.",
      recap: "This final hour has been about [theme] — and leaving stronger.",
      script: "A few of your messages: [messages]. The final takeaway is [takeaway].",
      cta: "Send one encouragement for another listener.",
      tease: "I’ll say goodbye properly and get you ready for Cass next.",
    }),
    makeItem("aft-3-6", "15:56", "Goodbye and handover", "Link", "Close with warmth, preview tomorrow and hand over cleanly to Cass.", "02:00", {
      hour: "3PM",
      featureId: "Afternoon Uplift",
      context: "You’re listening to Afternoons with Adam on Premier Gospel. We’re just about at the end of today’s show.",
      recap: "Today we’ve talked about [conversation], played [arcade], and finished with [uplift].",
      script: "Thank you for spending the afternoon with me. Tomorrow we’ll be back with a fresh Conversation, the Arcade at two, and more Uplift after three. Cass is with you next.",
      cta: "Keep Premier Gospel on for Cass.",
      tease: "Cass is next with more music, encouragement and company for the rest of your day.",
    }),
  ],
  saturday: [
    makeItem("sat-welcome", "07:02", "Weekend welcome", "Link", "Welcome listeners, release the week and preview the morning.", "02:30", {
      hour: "Hour 1",
      featureId: "Weekend Welcome",
      context: "You’re listening to Saturday Breakfast on Premier Gospel. It’s Saturday morning, Jonathan Reid is with you, and Adam Brooks is producing.",
      recap: "If you’ve just joined us, this is your weekend companion: worship, prayer, conversation, events and gospel music.",
      script: "Let’s ease into the weekend together, release the week behind us and make room for joy, faith and family this morning.",
      cta: "Send your Saturday good morning and where you’re listening from.",
      tease: "In a few minutes, we’ll pray off the week and step into Wake Up & Worship.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("sat-prayer", "07:08", "Pray Off The Week", "Prayer", "Pray to release the stresses of the week.", "02:30", {
      hour: "Hour 1",
      featureId: "Pray Off The Week",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and we’re taking a moment to pray off the week.",
      recap: "If you’ve just joined us, this is where we release what the week has carried and invite God into the weekend.",
      script: "Lord, we place the pressure, noise and unfinished pieces of the week into your hands. Give every listener rest, clarity and joy for today. Amen.",
      cta: "Send AMEN if you’re praying with us.",
      tease: "Spirit Charge is coming up with a bold thought for your Saturday.",
    }),
    makeItem("sat-spirit", "07:25", "Spirit Charge", "Feature", "Give a concise faith-filled thought for the weekend.", "03:00", {
      hour: "Hour 1",
      featureId: "Spirit Charge",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and this is your Spirit Charge for the weekend.",
      recap: "If you’ve just joined us, this is a short faith thought to help you move into Saturday with courage.",
      script: "Today’s charge is [thought]. Don’t let the week define the weekend before it begins.",
      cta: "Send one word for what you’re believing God for this weekend.",
      tease: "Wake Up & Worship is next.",
    }),
    makeItem("sat-worship", "07:42", "Wake Up & Worship", "Feature", "Create a joyful worship moment.", "06:00", {
      hour: "Hour 1",
      featureId: "Wake Up & Worship",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and it’s time to Wake Up & Worship.",
      recap: "If you’ve just joined us, we’re lifting the morning with worship before the weekend conversation opens properly after eight.",
      script: "This is a moment to turn the volume up, open the windows if you can, and let worship reset the atmosphere.",
      cta: "Tell us which worship song is soundtracking your Saturday.",
      tease: "After eight, the Saturday Social Club opens.",
      stationRequirement: "Second time check · Second station ID · Second presenter ID",
    }),
    makeItem("sat-social", "08:18", "Saturday Social Club", "Interaction", "Open a relaxed weekend conversation with listeners.", "04:00", {
      hour: "Hour 2",
      featureId: "Saturday Social Club",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and the Saturday Social Club is open.",
      recap: "If you’ve just joined us, this is the relaxed weekend conversation where your messages shape the morning.",
      script: "Today’s club question is [question]. It’s easy, family-friendly and exactly the kind of thing Saturday radio was made for.",
      cta: "Send your answer to today’s Saturday question.",
      tease: "I’ll read your replies after the next song.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("sat-question", "08:36", "Weekend question", "Interaction", "Use the strongest listener answers and keep it natural.", "03:30", {
      hour: "Hour 2",
      featureId: "Weekend Question",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and we’re inside today’s Weekend Question.",
      recap: "If you’ve just joined us, we’re asking [question], and the answers are already coming in.",
      script: "Here are a few of your replies: [messages]. The thing I love about this question is [fresh observation].",
      cta: "Send your answer if you haven’t joined in yet.",
      tease: "Weekend events and a guest spotlight are coming up in the final hour.",
      stationRequirement: "Second time check · Second station ID · Second presenter ID",
    }),
    makeItem("sat-events", "09:08", "Events you can attend", "Feature", "Share useful gospel events clearly and efficiently.", "04:00", {
      hour: "Hour 3",
      featureId: "Events You Can Attend",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and we’re in the final hour with gospel events you can attend.",
      recap: "If you’ve just joined us, this is where we point you towards useful things happening in the gospel community this month.",
      script: "Here are the events to know about: [events]. Pick one that helps you connect, worship or support what God is doing locally.",
      cta: "Choose one event to look up or share with someone today.",
      tease: "A guest or artist clip is coming up next.",
      stationRequirement: "Time check · Station ID · Presenter ID",
    }),
    makeItem("sat-guest", "09:28", "Guest or artist clip", "Package", "Set up the clip and pull out one memorable thought.", "04:00", {
      hour: "Hour 3",
      featureId: "Guest Spotlight",
      context: "You’re listening to Saturday Breakfast on Premier Gospel, and we’ve got a guest spotlight for the final hour.",
      recap: "If you’ve just joined us, this is a short clip from [guest/artist] about [topic].",
      script: "Listen for this one line: [setup]. It says something important about faith, creativity and ordinary life.",
      cta: "Send the line from the clip that stands out to you.",
      tease: "Before we finish, Jonathan will pray for your weekend.",
    }),
    makeItem("sat-close", "09:52", "Final prayer and handover", "Prayer", "Pray for the weekend, sign off and hand over.", "05:00", {
      hour: "Hour 3",
      featureId: "Final Weekend Prayer",
      context: "You’re listening to the final moments of Saturday Breakfast on Premier Gospel.",
      recap: "This morning we’ve prayed off the week, worshipped, opened the Saturday Social Club and looked ahead to the weekend.",
      script: "Let’s pray for the weekend: Lord, cover every home, journey, plan and quiet place today. Give your people joy, wisdom and rest. Amen.",
      cta: "Stay with Premier Gospel for what’s next.",
      tease: "More music and encouragement continues next on Premier Gospel.",
      stationRequirement: "Second time check · Second station ID · Presenter ID · handover",
    }),
  ],
}

const storageKey = "broadcastos-studio-workspace-v1"
const eventName = "broadcastos-workspace-change"
const fallbackWorkspace: StudioWorkspace = {
  mode: "remote",
  showId: "afternoons",
  date: "2026-07-06",
  items: [],
  messages: [],
  updatedAt: "",
}
const fallbackSnapshot = JSON.stringify(fallbackWorkspace)

function normalizeItem(item: StudioItem): StudioItem {
  return {
    ...item,
    hour: item.hour ?? "",
    featureId: item.featureId ?? item.title ?? "",
    context: item.context ?? "",
    recap: item.recap ?? "",
    script: item.script ?? "",
    cta: item.cta ?? "",
    tease: item.tease ?? "",
    fallback: item.fallback ?? "",
    stationRequirement: item.stationRequirement ?? "",
    notes: item.notes ?? "",
  }
}

function normalizeMessage(message: ListenerMessage): ListenerMessage {
  return {
    ...message,
    sender: message.sender ?? "",
    body: message.body ?? message.text ?? "",
    text: message.text ?? message.body ?? "",
    songRequests: message.songRequests ?? [],
    selected: message.selected ?? true,
  }
}

function getSnapshot() {
  return window.localStorage.getItem(storageKey) ?? fallbackSnapshot
}

function subscribe(listener: () => void) {
  const notify = () => listener()
  window.addEventListener(eventName, notify)
  window.addEventListener("storage", notify)
  return () => {
    window.removeEventListener(eventName, notify)
    window.removeEventListener("storage", notify)
  }
}

export function useStudioWorkspace() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => fallbackSnapshot)
  const workspace = JSON.parse(snapshot) as StudioWorkspace
  return { ...workspace, mode: workspace.mode ?? "remote", items: (workspace.items ?? []).map(normalizeItem), messages: (workspace.messages ?? []).map(normalizeMessage) }
}

export function saveStudioWorkspace(workspace: StudioWorkspace) {
  const next = { ...workspace, updatedAt: new Date().toISOString() }
  window.localStorage.setItem(storageKey, JSON.stringify(next))
  window.dispatchEvent(new Event(eventName))
}

export function createBlankWorkspace(showId: StudioShowId, date: string, mode: StudioMode): StudioWorkspace {
  return { mode, showId, date, items: [], messages: [], updatedAt: new Date().toISOString() }
}

export function createTemplateWorkspace(showId: StudioShowId, date: string, mode: StudioMode): StudioWorkspace {
  return {
    mode,
    showId,
    date,
    items: studioTemplates[showId].map((studioItem) => ({ ...studioItem })),
    messages: [],
    updatedAt: new Date().toISOString(),
  }
}

export function createEmptyStudioItem(): StudioItem {
  return makeItem(`item-${Date.now()}`, "", "New link", "Link", "")
}

function toFrameworkValues(item: StudioItem): LinkFrameworkValues {
  return {
    context: item.context,
    recap: item.recap,
    moment: item.script,
    cta: item.cta,
    tease: item.tease,
  }
}

export function getContextFirstReadiness(item: StudioItem, showName?: string) {
  return validateLinkFramework(toFrameworkValues(item), { showName, featureName: item.featureId || item.title })
}

export function getStudioItemFrameworkValues(item: StudioItem): LinkFrameworkValues {
  return toFrameworkValues(item)
}

export function parseListenerMessages(value: string): ListenerMessage[] {
  return splitListenerBlocks(value).map((rawText, index) => {
    const { sender, body } = parseListenerIdentity(rawText)
    return {
      id: `message-${Date.now()}-${index}`,
      sender,
      body,
      text: sender ? `${sender}: ${body}` : body,
      songRequests: extractSongRequests(body),
      selected: true,
    }
  })
}

function splitListenerBlocks(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").trim()
  if (!normalized) return []

  const paragraphBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (paragraphBlocks.length > 1) return paragraphBlocks

  const blocks: string[] = []
  let current = ""

  normalized.split("\n").forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    if (looksLikeMessageStart(trimmed) && current) {
      blocks.push(current.trim())
      current = trimmed
      return
    }

    current = [current, trimmed].filter(Boolean).join("\n")
  })

  if (current.trim()) blocks.push(current.trim())
  return blocks
}

function looksLikeMessageStart(line: string) {
  const withoutTimestamp = line.replace(/^\[?\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?,?\s*\d{1,2}:\d{2}\]?\s*[-–—]?\s*/, "")
  return /^[A-Z][A-Za-z .'-]{1,40}(?:,\s*[A-Za-z .'-]{2,40})?\s*(?:[:\-–—])\s+\S/.test(withoutTimestamp)
}

function parseListenerIdentity(rawText: string) {
  const cleaned = rawText
    .replace(/^\[?\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?,?\s*\d{1,2}:\d{2}\]?\s*[-–—]?\s*/, "")
    .trim()
  const match = cleaned.match(/^([A-Z][A-Za-z .'-]{1,50}(?:,\s*[A-Za-z .'-]{2,40})?)\s*(?:[:\-–—])\s*([\s\S]+)$/)

  if (!match) return { sender: "", body: cleaned }

  return {
    sender: match[1].trim(),
    body: match[2].trim(),
  }
}

function extractSongRequests(value: string) {
  const requests = new Set<string>()
  const patterns = [
    /\b(?:song request|request)\s*[:\-–—]?\s*([^\n.]+)/gi,
    /\b(?:please|pls|can you|could you|would you)?\s*play\s+([^\n.]+)/gi,
  ]

  patterns.forEach((pattern) => {
    for (const match of value.matchAll(pattern)) {
      const request = match[1]
        ?.replace(/\b(?:for me|please|pls|thanks|thank you)\b.*$/i, "")
        .replace(/\s+/g, " ")
        .trim()
      if (request && request.length > 2) requests.add(request)
    }
  })

  return Array.from(requests)
}
