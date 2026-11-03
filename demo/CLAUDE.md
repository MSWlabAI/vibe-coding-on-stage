# Live build — rules for this repo

You are building a small web tool for interventional cardiologists, live, on stage,
in front of several hundred of them. Speed and reliability beat cleverness.

## Who uses it
Cardiologists on their phones, in a cath lab or a conference hall. One hand, bad light,
large thumbs. Mobile first. Desktop just needs to not look broken.

## Stack (already installed — do not add anything)
- Vite + React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite` (utility classes only, no config file needed)
- Vitest for unit tests
- Deployed to Vercel with `vercel --prod` from this folder

## Hard rules
1. **Never add dependencies.** No `npm install`. Everything you need is here.
2. **No backend, no login, no database, no API keys, no env vars.** Pure static app.
3. **Keep it in `src/`.** UI lives in `src/App.tsx` (split into small components in `src/components/`
   if it gets long). **All clinical numbers and handout text are pre-vetted in `src/clinical/`**
   (`laao.ts`, `mehran.ts`, `handouts.ts`, each with tests). Import from there. Never re-type a
   risk table, a point value or a handout from memory.
4. **Do not ask me questions.** Make a reasonable choice, build, and tell me what you chose.
5. **Before you say you are done, run `npm run check`** (typecheck + build + tests) and fix anything red.
6. **Every clinical number on screen comes from `src/clinical/`** (sources are in those file headers)
   and every screen shows the footer line: "Educational tool, not medical advice."
7. The tables and handouts in `src/clinical/` are frozen. Do not edit, invent or round them. If the
   brief asks for a number that is not there, say so in the UI instead of guessing.
8. Keep the whole app working at every step. Do not leave half-finished features.
9. **Never commit or push.** Leave your changes uncommitted; the presenter deploys with `vercel --prod`.
   GitHub main must stay the empty starting page, because the reset button redeploys it.

## The brief
If `BRIEF.md` exists, it was written by the audience (via the console app) and is the
source of truth for what to build: the tool, the app name, the colour theme, and the
feature list. Build exactly what it says, in the order it lists. Skip anything marked rejected.

Every feature the brief lists must ship in some visible, working form; the audience is watching for it.
If one cannot be built literally under the hard rules, build the closest version that fits and label it on
screen. A picture, diagram or illustration: draw a simple inline SVG in its own component (no image files,
no internet images, no AI image generation), captioned "Illustration". A number or handout sentence that is
not in `src/clinical/`: show a visible note saying it is not in the vetted content yet. Never skip a feature
silently. When you report done, list each feature with one line on how you built it.

## Style
- Big tap targets (min 44px), high contrast, one column on phones.
- Scores update instantly as toggles change; no submit button.
- Plain-English result line under each score, e.g. "≈ 3.2% annual stroke risk".
