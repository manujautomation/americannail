# Voice Bot (IVR) — Setup Guide

The call-flow logic is already deployed as part of this app. When someone
calls the salon's virtual number they hear:

> "Thank you for calling American Nails and Spa in Stephens City.
> Press 1, or say one, to hear our opening hours.
> Press 2, or say two, to make an appointment or speak with the salon."

- **1 / "one" / "hours" / "timing"** → reads the opening hours (generated
  from the same `HOURS` constant the website uses, so they never drift),
  then offers the menu again.
- **2 / "two" / "appointment" / "speak"** → forwards the call to the real
  salon line, (540) 868-2811.
- Silence or unrecognized input twice → forwards to the salon anyway, so
  nobody gets stuck in the menu.

Voice: Amazon Polly "Joanna" (neural) — fluent US English.

## Endpoints (already live)

| Route | Purpose |
|---|---|
| `POST /api/voice/incoming` | Answers the call, plays the menu |
| `POST /api/voice/menu` | Handles the caller's choice (keypad or speech) |

## Hooking up Twilio (~10 minutes, needs the client's decision)

1. Create a Twilio account at twilio.com (free trial works for testing;
   trial calls play a short Twilio notice first).
2. Buy a local Virginia number (search area code 540) — about $1.15/month.
3. In Twilio Console → Phone Numbers → your number → Voice Configuration:
   - "A call comes in": **Webhook**,
     `https://americannail.vercel.app/api/voice/incoming`, **HTTP POST**
4. Call the number to test.

Ongoing cost estimate: number ~$1.15/mo + ~$0.0085/min inbound +
~$0.014/min for the forwarded leg. A small salon's volume lands around
**$5–10/month** total.

## Go-live decision for the client

The website's "Call Now" buttons currently dial the salon directly.
To route callers through the bot, either:

- change `BUSINESS.phone` in `src/lib/constants.ts` to the Twilio number
  (website callers get the menu; the salon's published Google/print number
  stays direct), or
- port/forward the salon's main line — bigger step, not recommended until
  the bot has proven itself.

## Notes

- No Twilio SDK or API key is needed for this flow — Twilio just fetches
  the XML instructions from the routes above. The endpoints hold no
  secrets and perform no account actions.
- Hours changes only need `src/lib/constants.ts` — the bot reads them
  dynamically.
