import Anthropic from "@anthropic-ai/sdk"
import { messageSourceLabels, type MessageSource } from "@/lib/listener-messages-shared"

/**
 * The on-air read of a listener's message (v2.41, voice fixed v2.44 from
 * Adam's own rewrite of the first test). It has to sound like Adam talking
 * about the person, live: the name once and then she or he, how they got in
 * touch in the opener, their own words folded into his sentence with no
 * quotation marks, connected spoken sentences. Needs ANTHROPIC_API_KEY on the
 * server; without it the message stays "pending".
 */

export function readVersionConfigured() {
  return Boolean((process.env.ANTHROPIC_API_KEY ?? "").trim())
}

const SYSTEM = `You write the on-air read of a listener's message for Adam Brooks, a presenter on Premier Gospel, a UK Christian radio station. Adam reads your line out loud, live, so it has to sound like him talking about the person, not like a news brief.

Here is a message and exactly how Adam reads it. Copy this shape every time.

The message, from Sam, on WhatsApp:
"Hiya Adam!! Hope you and the team are all good. Just wanted to say thank you so much for the show today, I've had the worst week, my mum's been in hospital since Tuesday and I've been running between work and the ward and honestly your show in the car is the only bit of peace I get. That song you played at about 2, the Travis Greene one, I cried in the car park lol. Anyway keep doing what you're doing, we love you over here in Croydon. Could you play something by CeCe for my mum tomorrow? She loves her. Thanks again x"

Adam's read:
Sam in Croydon has messaged in on WhatsApp today and she says it has been the worst week with her mum in hospital since Tuesday, and the show in the car is literally the only bit of peace she gets. Also, she says the Travis Greene song had her crying in the car park, and she's asked for something by CeCe Winans tomorrow for mum, who loves her music.

The rules behind it:
- Open with the person and how they got in touch: "[Name] in [place, only if they said one] has messaged in on WhatsApp today and she says…". Texted in, messaged on Instagram, emailed in, whichever it was.
- Say the name once, at the start. After that it is she, he or they. Use she or he only when the message or the name makes it clear; otherwise they. Never repeat the name in later sentences.
- Fold their own words into the sentence in the third person, with no quotation marks. Keep their flavour words (literally, honestly, proper, so much). Leave out lol, emojis and kisses.
- Connected, spoken sentences joined with and, also she says, so. Not short clipped sentences.
- Cut the hello, the thank you, the compliments about the show and the sign-off. Keep the story, the feeling, and any song request. A first name for an artist can be completed to the full name when it is obvious (CeCe is CeCe Winans).
- Fifty to eighty words. UK English. No em dashes, no emojis, no hashtags, no headings.
- Keep names, places, song titles and artists as written. Never add a fact or a feeling they did not write.
- A prayer request or anything tender stays gentle and plain. Do not dramatise it.
- Output only the read. Nothing before it, nothing after it.`

const arrivedBy: Record<MessageSource, string> = {
  whatsapp: "WhatsApp (so: has messaged in on WhatsApp)",
  text: "text message (so: has texted in)",
  instagram: "Instagram (so: has messaged on Instagram)",
  email: "email (so: has emailed in)",
}

export async function writeReadVersion(input: { name: string; raw: string; showName: string; source?: MessageSource }): Promise<string | null> {
  if (!readVersionConfigured()) return null
  const client = new Anthropic()
  const source = input.source ?? "whatsapp"
  const response = await client.beta.messages.create(
    {
      model: "claude-opus-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Listener: ${input.name}\nGot in touch by: ${arrivedBy[source] ?? messageSourceLabels[source]}\nShow: ${input.showName}\n\nMessage:\n${input.raw}`,
        },
      ],
    },
    { timeout: 25000 }
  )
  if (response.stop_reason === "refusal") return null
  const block = response.content.find((item): item is Anthropic.Beta.BetaTextBlock => item.type === "text")
  const text = block?.text.trim() ?? ""
  return text || null
}
