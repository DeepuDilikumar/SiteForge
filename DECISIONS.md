# Decisions beyond the spec

Choices made where the spec was silent or where a later instruction changed it.

## Visual direction

- **Light by default, dark on request.** The spec asked for a dark theme via `prefers-color-scheme`.
  Following a later instruction, the app is light by default and a theme toggle (header, landing)
  switches to dark. The choice is stored in a `sf-theme` cookie so the server renders the right
  theme with no flash.
- **Interactive controls follow x.ai; layout follows Google's marketing pages.** Also from that
  instruction. Primary buttons are near-black "ink" pills (white in dark mode), the search box is a
  composer-style pill with a round arrow submit button, and filter chips fill with ink when
  selected. Section layout, large display headings, rounded surface bands, segmented tabs and blue
  numerals follow the Google Ads/Business pages. Blue (`--accent`) is kept for links, focus rings,
  selection marks and highlights. x.ai/bot sits behind a Cloudflare challenge and could not be
  screenshotted, so its style was reproduced from its known design language.
- **Display size.** Marketing headings use a 64px display size (beyond the 44px top of the scale)
  to match the Google reference. App screens stay on the 14–44px scale.
- **Google Sans Flex** is available in `next/font/google` and is used, so the Figtree fallback was
  not needed. Its metrics aren't in Next's override table, so `adjustFontFallback` is off and a
  system-font fallback stack is set.
- Material Symbols Rounded loads from Google Fonts with `icon_names=`, so only the icons the app
  uses are downloaded.

## Data model additions

- `business.source` (`mock` | `google`) and `business.countryCode`: needed to refresh only Google
  records and to normalise phones to E.164 for WhatsApp.
- `site.tone`: remembered so regeneration keeps the chosen tone.
- `site.overrides` (JSON `{ phone?, hours? }`): the operator's edits to business facts, kept
  separate from AI copy so the content schema stays exactly as specified.
- `lead` is unique per `(user, business)`. Building again for the same business adds a new site to
  the existing lead (and counts as a new site). The build page links to the existing site.
- Hours are stored as seven strings, Monday first (`"9:00 AM – 6:00 PM"` or `"Closed"`).

## AI

- Default model is `gemini-flash-latest`, Google's alias for the current Flash model;
  `GEMINI_MODEL` overrides it.
- The copy always includes `signature`, not only for Legacy, so switching templates later
  never leaves Legacy without its signature section. Other templates ignore it.
- Review highlights from Gemini are checked against the real review text; invented or paraphrased
  quotes are dropped and attribution is rewritten as "First L.". If none survive, real excerpts
  are picked deterministically.
- Operator edits are validated with a looser schema (length caps, no word-count floors), because
  the 60–110 word rule is a constraint on the AI, not on the operator.
- Free plan copy regenerations: a section rewrite and a full rewrite each count as one of the three.
  A failed rewrite doesn't count.
- Template-picker thumbnails and the landing demo use the deterministic copywriter, so browsing
  templates never spends AI calls.
- Simulating an AI failure (journey QA): in development only, the cookie
  `sf_simulate_ai_failure=1` makes every AI call fail. It is ignored in production.

## Build flow

- The build streams newline-delimited JSON from `POST /api/sites/build`; each stage is reported
  after its real work completes (load and refresh the business; write copy; render; quality
  checks and save). Nothing is written until the last stage passes, so a failed build never uses
  the free credit.
- The free-site limit is checked before the stream starts and again inside the final stage, so a
  double click can't create two free sites.

## Places

- Mock data: about ten hand-written business names per curated city and category. Addresses,
  phones, ratings, reviews and hours are generated deterministically from curated street, locality
  and review pools. Other queries generate plausible names for India, the US, the UK or Australia,
  detected from the city name or a region hint ("Denver, CO").
- Mock phone numbers use reserved fictional ranges where they exist (US 555‑01xx, UK Ofcom drama
  ranges, AU ACMA fictional ranges). India has no such range, so Indian demo numbers are random
  and may belong to real people. Don't send demo messages to them.
- Google records are refreshed after 24 hours (`PLACE_STALE_AFTER_MS`), well inside Google's
  30-day limit for coordinates.

## Product details

- Status changes on the dashboard show a toast with **Undo**.
- Unpublishing asks for confirmation, because shared links stop working.
- Resuming after upgrade: the upgrade dialog sends `next` with a `resume=` parameter
  (`build`, `publish`, `export`, `outreach`). After checkout the destination finishes that action,
  and a "You're on Pro." toast appears.
- `/account` shows profile and plan. With the billing stub, Pro can be cancelled (back to free)
  for testing.
- Published pages are cached for 60 seconds; preview pages are never cached.
- The watermark is a small "Built with SiteForge" badge inserted server-side at the end of the page,
  above the mobile action bar.
