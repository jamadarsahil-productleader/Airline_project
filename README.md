# FareFlow · Cloudflare Pages + Duffel test API

This is an internal **test-mode only** prototype. The Duffel token is read only by a Cloudflare Pages Function. No real fares, private marine/corporate content, customer email integration, bookings, payments, PNRs or tickets are included.

## What to upload

The project root must contain:

```
index.html
functions/api/_common.js
functions/api/flights.js
functions/api/price.js
README.md
```

**Do not use Cloudflare's dashboard ZIP / Direct Upload.** It does not compile the `functions` directory. Connect a GitHub repository to a **new Cloudflare Pages project**, or deploy with Wrangler. If your previous Pages project was created through Direct Upload, keep it as an older demo and create a new Git-connected Pages project. No Python or pip is required.

## 1. Get a test token

1. Register/sign in at https://duffel.com.
2. In the Duffel dashboard, create a **test-mode** access token. It begins with `duffel_test_`.
3. Keep it private. Do not paste it into `index.html`, GitHub, a Google Sheet or ChatGPT.

This project intentionally rejects live-mode tokens.

## 2. Upload the project to GitHub

Create a private GitHub repository. Upload the **contents of this extracted project** so that `index.html` and the `functions` folder are at repository root. Do not upload the ZIP as a single file.

## 3. Create a Cloudflare Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Choose your private GitHub repository.
3. Select the static/no-framework preset. Set **Build command** to `exit 0` and **Build output directory** to `.` (repository root).
4. Deploy. The page will appear, but API search will say it needs configuration until you complete step 4.

If your dashboard refuses `.` as a build output directory, use the repository root setting offered by your Pages setup, or adapt the static output directory while keeping `functions` at project root. Do not move `functions` under the static output.

## 4. Configure secrets

In the new Pages project: **Settings → Variables and Secrets / Environment variables** (production scope).

- `DUFFEL_TEST_TOKEN`: your Duffel test token
- `FAREFLOW_DEMO_CODE`: a long, random pilot code you choose (not your Gmail or Cloudflare password)

Mark both as secrets when offered. Trigger a new deployment after changing runtime settings if the dashboard says one is needed. Share the pilot code only with trusted testers; they enter it in the FareFlow form on each page load. The code is deliberately not stored in localStorage.

**Important security limit:** A shared code is not a replacement for proper identity and rate limiting. Before inviting other people, put the entire Pages project behind Cloudflare Access (allow-listed test emails) and configure rate limiting for `/api/*` if available. Otherwise leave this as a private, low-volume, test-token experiment. Search requests can consume supplier quota.

## 5. Test

1. Open the new Pages URL.
2. Enter the pilot access code.
3. Review or change the origin, destination, date and adults.
4. Click **Search Duffel test offers**.
5. Select an offer and click **Refresh price**.
6. Adjust illustrative markup and download an **internal test draft**.

Use a future date. Duffel test inventory can be sparse and unrealistic for some routes. The app is intentionally limited to one-way adult searches and shows at most 12 offers.

## Google Sheet

**No change is needed to your existing Gmail → Bookings Sheet script for this API pilot.** It still imports emails into the private Sheet. Copy sample text from column D into the website for now. The public Cloudflare site does not read the Sheet and will not create Gmail drafts; that would require a separate authenticated integration. Do not publish your Sheet or expose your Gmail credentials to the website.

## Technical notes

- `/api/flights`: validates itinerary; server-side POST to Duffel Offer Requests.
- `/api/price`: server-side GET of a selected offer to refresh its test total.
- Both endpoints require the pilot code and accept only a `duffel_test_` token.
- The app does not calculate GST, convert currencies, add document/baggage surcharges or interpret fare eligibility.
- Do not quote or book based on test mode. Live fares and agency-negotiated private fares need separately authorised supplier/agency access.
