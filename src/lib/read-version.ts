import Anthropic from "@anthropic-ai/sdk"

/**
 * The on-air read of a listener's message (v2.41). Third person, present
 * tense, the person's own words kept where the line is good, the irrelevant
 * cut. Needs ANTHROPIC_API_KEY on the server; without it the message stays
 * "pending" and the producer (or Adam) writes the read by hand.
 */

export function readVersionConfigured() {
  return Boolean((process.env.ANTHROPIC_API_KEY ?? "").trim())
}

const SYSTEM = `You write the on-air read of a listener's message for Adam Brooks, a presenter on Premier Gospel, a UK Christian radio station. Adam reads your line out loud, as the person.

Rules:
- Third person, present tense, starting with the person's first name: "Sam says she's been low this week, but the show's been getting her through."
- Keep the person's own words in quotes when a line is good. Otherwise paraphrase plainly.
- Cut anything that is not worth air: hellos to the studio, repeated points, filler. Keep a song request if there is one.
- One to three short sentences, under 60 words.
- UK English. No em dashes, no emojis, no hashtags, no headings.
- Keep names, places, song titles and artists exactly as written. Never add a fact or a feeling the person did not write.
- A prayer request or anything tender stays gentle and plain. Do not dramatise it.
- Output only the read line. Nothing before it, nothing after it.`

export async function writeReadVersion(input: { name: string; raw: string; showName: string }): Promise<string | null> {
  if (!readVersionConfigured()) return null
  const client = new Anthropic()
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
          content: `Listener: ${input.name}\nShow: ${input.showName}\n\nMessage:\n${input.raw}`,
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
