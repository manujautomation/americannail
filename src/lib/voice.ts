import { BUSINESS, HOURS } from "@/lib/constants";

// Voice used for all prompts — Amazon Polly neural voice via Twilio <Say>,
// fluent US English.
export const VOICE = "Polly.Joanna-Neural";

export function xmlResponse(inner: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${inner}</Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

export function say(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<Say voice="${VOICE}">${escaped}</Say>`;
}

/** Main menu <Gather> — accepts keypad digits and natural speech. */
export function menuGather(prompt: string): string {
  return (
    `<Gather input="dtmf speech" numDigits="1" timeout="6" speechTimeout="auto" ` +
    `action="/api/voice/menu" method="POST" ` +
    `hints="one, two, timing, hours, open, appointment, booking, book">` +
    say(prompt) +
    `</Gather>`
  );
}

/** Forward the call to the salon's real phone line. */
export function connectToSalon(): string {
  return (
    say("Connecting you to American Nails and Spa now. Please hold.") +
    `<Dial>${BUSINESS.phone}</Dial>` +
    say("The salon could not be reached. Please try again later. Goodbye.")
  );
}

/** Spoken opening-hours summary, generated from the HOURS constant so it
 *  never drifts from what the website shows. Consecutive days with the same
 *  hours are grouped ("Tuesday through Friday"). */
export function hoursSpeech(): string {
  const parts: string[] = [];
  let i = 0;
  while (i < HOURS.length) {
    const d = HOURS[i];
    let j = i;
    while (
      j + 1 < HOURS.length &&
      HOURS[j + 1].closed === d.closed &&
      HOURS[j + 1].open === d.open &&
      HOURS[j + 1].close === d.close
    ) {
      j++;
    }
    const dayRange = i === j ? d.day : `${d.day} through ${HOURS[j].day}`;
    parts.push(
      d.closed
        ? `we are closed on ${dayRange}`
        : `${dayRange}, ${d.open} to ${d.close}`
    );
    i = j + 1;
  }
  return `Our hours are: ${parts.join(". ")}. Walk-ins are always welcome.`;
}
