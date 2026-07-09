import { NextRequest } from "next/server";
import { xmlResponse, menuGather, connectToSalon } from "@/lib/voice";

// Twilio webhook — answers incoming calls with the main menu.
// Point the Twilio phone number's "A call comes in" webhook at
// POST https://<deployment>/api/voice/incoming
export async function POST(req: NextRequest) {
  const attempt = Number(new URL(req.url).searchParams.get("attempt") ?? "1");

  // If the caller stayed silent through two menu plays, stop making them
  // wait and just ring the salon.
  if (attempt > 2) {
    return xmlResponse(connectToSalon());
  }

  const greeting =
    attempt === 1
      ? "Thank you for calling American Nails and Spa in Stephens City. " +
        "Press 1, or say one, to hear our opening hours. " +
        "Press 2, or say two, to make an appointment or speak with the salon."
      : "Press 1 for opening hours, or press 2 to speak with the salon.";

  return xmlResponse(
    menuGather(greeting) +
      // Gather timed out with no input — replay a shorter menu.
      `<Redirect method="POST">/api/voice/incoming?attempt=${attempt + 1}</Redirect>`
  );
}

// Twilio can be configured to use GET; support it for convenience.
export const GET = POST;
