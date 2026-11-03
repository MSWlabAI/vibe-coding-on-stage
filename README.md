# Vibe coding on stage

**Your audience votes on what to build and writes the features. An AI coding agent builds the app live, and everyone opens it on their phone before the session ends.**

This kit was made for a 15-minute live session for interventional cardiologists at TCT 2026. Nobody in the room needs to code, including the presenter. It works for any field where the audience knows the domain better than any developer would.

---

## What happens in the room

| Step | The audience | You (on your phone) | On the big screen |
| --- | --- | --- | --- |
| 1 · Vote | Scan a QR code and vote on which app to build and how it looks | Watch the bars | Live vote bars |
| 2 · Feature requests | Submit ideas and upvote each other's | Approve good cards, bin wild ones as "Not today", add suggested ideas | The winning app, its starting prompt, and the top requests |
| 3 · Brief locked | Watch | Lock the brief; the top 3 upvoted features go in | Copy buttons for the two terminal commands |
| Build (2–3 min) | Watch the agent work | Paste one command, then narrate | The terminal: the agent reads, writes, tests, fixes |
| 4 · It's live | Scan a second QR code and use the app | Paste the deploy command | A big QR code to the finished app |

The whole session runs from **one link** (a web deck with the live screen built in). You advance it from your phone and only touch the laptop to paste two commands.

---

## What's in this repo

```
console/   The audience console (Next.js on Vercel, Upstash Redis)
           /          audience page: vote, submit, upvote
           /screen    projector page: live bars, feature board, copy-paste commands, app QR
           /admin     your phone: phases, moderation, suggested features, deck Back/Next
           /deck      optional: your whole talk as one web deck, with the live screen embedded
           /api/brief the brief the agent builds from

demo/      The app the agent builds live (Vite + React + Tailwind, static, no backend)
           CLAUDE.md        the guardrails the agent must follow
           src/clinical/    pre-vetted domain content (tables, scores, handouts) with tests
           scripts/brief.sh pulls the locked brief into BRIEF.md
           scripts/reset.sh puts the folder (and the live app) back to the empty start
```

### Why it works reliably on stage

- **The agent never makes up domain facts.** Every number and every patient-facing sentence comes from `demo/src/clinical/`, which you write and test in advance. `CLAUDE.md` forbids retyping or inventing it. If a feature asks for something that isn't vetted, the app must say so on screen.
- **The brief is a structured prompt.** Each ballot option comes with a tested starting spec. The audience's top three features are added to it, and the rejected ideas are listed as "do not build".
- **Every feature must ship in some visible form.** If one can't be built literally (for example "add a picture" with no internet), the agent builds the closest safe version, such as a drawn illustration, and labels it.
- **A hard gate before deploy.** `npm run check` (typecheck, build, tests) must be green.
- **A parachute.** One pre-built, tested app per ballot option on a `golden-*` branch, already deployed to backup URLs.

---

## You will need

- Node 22 or later, Git, and a GitHub account
- A [Vercel](https://vercel.com) account (the free tier is fine) and the Vercel CLI (`npm i -g vercel`)
- [Upstash Redis](https://vercel.com/marketplace/upstash), added through Vercel's marketplace (free tier)
- An AI coding agent: [Claude Code](https://claude.com/claude-code), Codex, Cursor or similar
- A phone hotspot. Conference and hospital Wi-Fi often block `vercel.app`.

---

## Try it locally in 5 minutes

```bash
cd console && npm install && npm run dev
```
Open `http://localhost:3000` (audience), `/screen` (projector) and `/admin?key=dev-key` (you) in three windows. Vote, add features, and lock the brief. Then, in another terminal:
```bash
cd demo && npm install && ./scripts/brief.sh http://localhost:3000 && claude "Read CLAUDE.md and BRIEF.md. Build exactly what the brief says. Run npm run check before you tell me you're done, and tell me what you chose."
```
Then `npm run dev` in `demo/` shows what it built. Run `./scripts/reset.sh` to start over.

---

## One-time setup (about 30 minutes)

### 1. Get the code
Click **Use this template** on GitHub, or clone the repo. Then:
```bash
cd console && npm install && cd ../demo && npm install && npm run check
```

### 2. Deploy the console
```bash
cd console
vercel link                # create a new project, e.g. "my-console"
```
In the Vercel dashboard for that project:
- **Storage → Upstash Redis → Connect.** Without it, votes live in memory and get lost between servers.
- **Settings → Environment Variables:** add `ADMIN_KEY` with a long private value. The admin page refuses to work in production without it.

```bash
vercel --prod
```
Open `https://<your-console>/admin?key=<ADMIN_KEY>` on your phone. If you see an amber "in-memory storage" banner, Redis isn't connected yet.

### 3. Deploy the empty demo app
```bash
cd ../demo
vercel link                # a second project, e.g. "my-pocket-tools"
vercel --prod
```
That URL is the QR code for the finished app, and it never changes. Paste it into the admin page under **Deployed app URL**.

### 4. Make it yours
Edit `console/src/lib/config.ts`:
- **Ballot options.** For each one: a label, a one-line blurb, the `spec` (the starting prompt, pointing at your vetted modules), and the `ideas` you can add as suggested features in phase 2
- **Themes:** the "pick the look" vote
- **Event:** the title, and `STAGE_DEMO_DIR` (where `demo/` lives on your laptop, used in the copy-paste commands)
- **The blocklist** for auto-rejecting profanity

Put your vetted content in `demo/src/clinical/` (rename the folder for another field) with tests. Keep it frozen: the agent imports it and never edits it.

### 5. Build your parachutes
For each ballot option, run the live build once (see below), check it carefully, and commit it to a branch named `golden-<option>`. Deploy each to its own backup Vercel project. If a live build ever fails, you switch the app URL to the backup in the admin page.

### 6. Optional: the one-link deck
Export your slides as Claude Slides files (`deck.json` and `slides/*.html`) into `console/deck/src/`, then run `node deck/build.mjs`. The build:
- adds the live screen after the slides named in `LIVE_AFTER`;
- serves the deck at `/deck`;
- lets the admin page's **◀ Back / Next ▶** bar drive it from your phone.

---

## Running the session

**Before you walk up:**
```bash
cd demo
vercel whoami                      # must print your name; if not: vercel login
./scripts/reset.sh --deploy        # clean folder, empty app back on the QR URL
```
- **Admin:** tap **Reset everything**.
- **Laptop:** one deck tab only, in fullscreen (press F). Do Not Disturb on, terminal text large.

**On stage (15 minutes):**

| Clock | What you do |
| --- | --- |
| 0:00 | Cover slide with the vote QR is up as people sit |
| 2:30 | Live screen. Watch the vote, call the winner. Admin: **2 · Feature requests**, then **Add all** suggested ideas |
| 3:30 | Read the starting prompt aloud. Let them upvote for 60–90 s. Approve and bin cards |
| 5:20 | Admin: **3 · Brief locked**. It auto-picks the top 3. On the laptop: **Copy** box 1, paste in Terminal |
| 5:35 | The build: 2–3 minutes. Narrate: the model reads the rules, uses its tools, tests, fixes |
| 8:30 | When it says done: `/exit`, **Copy** box 2, paste. That's `npm run check && vercel --prod` |
| 9:30 | Admin: **4 · It's live**. The app QR is on screen and everyone scans it |
| 10:15 | Your remaining slides while they play with the app |

The two commands behind the Copy buttons:
```bash
cd <demo> && ./scripts/brief.sh https://<your-console> && claude "Read CLAUDE.md and BRIEF.md. Build exactly what the brief says. Run npm run check before you tell me you're done, and tell me what you chose."
cd <demo> && npm run check && vercel --prod
```

**Between practice runs:** `./scripts/reset.sh --deploy`, then admin **Reset everything**.

---

## Lessons from our rehearsals

- **Use the model you rehearsed with.** Fast mode helps on stage. Maximum effort settings make the build slower, not better.
- **Seed the board.** In phase 2, tap **Add all** so the room has good, buildable cards to upvote straight away.
- **Three features is the sweet spot.** Builds took about 1–3 minutes with vetted content in place.
- **Close every other deck tab.** Each copy of the deck follows your phone. The deck now lets only one copy play sound, but one tab is simpler.
- **Run `vercel whoami` before you go on.** An expired login is the most common deploy failure.
- **Don't debug on stage.** If the build isn't green by about 6 minutes, deploy the golden branch and say it's from rehearsal.
- **"Switch to cellular"** fixes most "it won't load" moments.

---

## Safety

- **No patient data.** No names, MRNs, dates of birth or images in the prompt, the chat or the app. Without an agreement with the vendor, no PHI at all.
- **No secrets in prompts or code.** A public link is public.
- **A prototype is not a medical device.** Every screen carries "Educational tool, not medical advice." Check every number against its source.

---

## Use it for your own field

Swap `demo/src/clinical/` for your own vetted content and tests. Point the ballot `spec`s at it and update the suggested `ideas`. Everything else (voting, moderation, brief, build, deploy) stays the same.

---

Created by Dr. Jeff Bander and the MSW AI Lab for a live session at TCT 2026. MIT licensed; see `LICENSE`. Educational use only: not medical advice.
