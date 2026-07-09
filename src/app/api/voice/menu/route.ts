import { NextRequest } from "next/server";
import {
  xmlResponse,
  say,
  menuGather,
  connectToSalon,
  hoursSpeech,
} from "@/lib/voice";

// Twilio webhook — handles the caller's menu choice (keypad or speech).
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const digits = (form?.get("Digits") as string | null) ?? "";
  const speech = ((form?.get("SpeechResult") as string | null) ?? "").toLowerCase();

  const choseHours =
    digits === "1" || /\b(one|1|hour|hours|timing|time|open)\b/.test(speech);
  const choseSalon =
    digits === "2" ||
    /\b(two|2|appointment|booking|book|speak|talk|human|person)\b/.test(speech);

  if (choseSalon) {
    return xmlResponse(connectToSalon());
  }

  if (choseHours) {
    return xmlResponse(
      say(hoursSpeech()) +
        menuGather(
          "Press 1 to hear the hours again, or press 2 to speak with the salon."
        ) +
        `<Redirect method="POST">/api/voice/incoming?attempt=3</Redirect>`
    );
  }

  // Unrecognized input — one more try, then the incoming route's attempt
  // counter falls through to connecting the call.
  return xmlResponse(
    say("Sorry, I didn't catch that.") +
      `<Redirect method="POST">/api/voice/incoming?attempt=2</Redirect>`
  );
}
