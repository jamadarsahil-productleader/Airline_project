# FareFlow — for your EXISTING Cloudflare Worker

Your address is `https://airline-project.jamadarsahil.workers.dev/`. You do NOT need `.pages.dev` or a new project.

## Replace files in the GitHub repository linked to your Worker

At the repository root, put these paths exactly:

```
wrangler.jsonc
worker.js
public/index.html
functions/api/_common.js
functions/api/flights.js
functions/api/price.js
```

The previous root `index.html` can stay temporarily, but the site now serves `public/index.html`. The `functions/` files are imported by `worker.js`; Cloudflare will NOT automatically route them like Pages Functions. Do not upload this ZIP itself: extract it and upload the files while preserving the nested paths. Use GitHub's **Add file → Upload files**, dragging the extracted folder contents from Windows File Explorer, then verify the paths before committing. Alternatively use Git locally.

Your Worker is GitHub-connected. Check **Worker → Settings → Builds**: the root directory must contain `wrangler.jsonc` (usually repository root), and deploy command should be `npx wrangler deploy`. A green build that deploys only static assets is not sufficient. If you cannot edit the deploy command, use Wrangler CLI for this existing Worker instead; do not create another project.

## Add two secrets to the EXISTING Worker

Cloudflare dashboard → Workers & Pages → `airline-project` → **Settings** → **Variables and Secrets** → add:

* `DUFFEL_TEST_TOKEN` = your Duffel test API token (`duffel_test_...`)
* `FAREFLOW_DEMO_CODE` = an access code you choose (NOT your Gmail password)

Mark both as **Secret**. Never put either value in GitHub, HTML, screenshots, or `wrangler.jsonc`. Redeploy after saving if prompted.

## Verify

Open `https://airline-project.jamadarsahil.workers.dev/api/flights` directly in a browser. You should see JSON such as `{"error":"Use POST for this API."}` (a 405 is expected for a browser GET). If you see your HTML page or a Cloudflare error, Worker routing/deployment is still not active; check build logs and deploy command. If JSON appears, open the main site, enter the pilot access code and try a test search. A missing Duffel token gives a JSON configuration error; a wrong pilot code gives a JSON access-code error.

This is Duffel **test** inventory, not real sellable fares. No booking/payment is performed. Your Google Sheet automation does not need changes for this repair.
