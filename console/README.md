# console — the audience console

Next.js app on Vercel with Upstash Redis (in-memory fallback when running locally). See the main README in the
repo root for setup and the run of show.

| Page | Who | What |
| --- | --- | --- |
| `/` | Audience (phones) | Vote; then submit feature requests and app names, and upvote |
| `/screen` | Projector | Live bars; the winning app's starting prompt beside the top requests; copy-paste commands once the brief is locked; the app QR when live |
| `/admin?key=…` | You (phone) | Phases, moderation, suggested features (Add / Add all), select features, overrides, reset, deck Back/Next |
| `/deck` | Projector | Optional: your talk as one web deck with the live screen embedded |
| `/api/brief` | The agent | The locked brief as Markdown (`demo/scripts/brief.sh` saves it as BRIEF.md) |

## Configure
Everything the audience sees is in `src/lib/config.ts`: the ballot options (each with a starting `spec` and
suggested `ideas`), themes, card limits, the blocklist, the event title, and `STAGE_DEMO_DIR` for the
copy-paste commands.

## Run locally
```bash
npm install
npm run dev     # in-memory storage; admin key is dev-key
```
Open `/`, `/screen` and `/admin?key=dev-key`. Use a private window for a second voter.

## Deploy
`vercel link`, then connect Upstash Redis (Vercel → Storage) and set `ADMIN_KEY` (Settings → Environment
Variables). Then run `vercel --prod`. On Vercel the admin page stays locked until `ADMIN_KEY` is set.

## Check a deployment
```bash
node scripts/smoke.mjs https://your-console.vercel.app                         # read-only
ADMIN_KEY=<key> node scripts/smoke.mjs https://your-console.vercel.app --full  # simulated audience, then resets
```
Don't run `--full` against a console a room is using: it resets the votes.

## The web deck
Put Claude Slides files (`deck.json`, `slides/*.html`) in `deck/src/`, list the slides that should be
followed by the live screen in `LIVE_AFTER` in `deck/build.mjs`, and add any images to `ASSETS`. Then run
`node deck/build.mjs`. Keyboard: arrows or a clicker, F fullscreen, N notes, R replay video.
