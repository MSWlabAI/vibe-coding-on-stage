# demo — the app the agent builds live

A pre-warmed target: dependencies installed, Tailwind wired, and an empty "nothing here yet" page deployed
to the fixed URL on your QR code. On stage the agent writes `src/` from BRIEF.md, and you deploy with
`vercel --prod`.

- `CLAUDE.md`: the rules the agent follows (no new dependencies, no backend, import all domain content
  from `src/clinical/`, every brief feature must ship, run `npm run check` before saying done, never commit).
- `src/clinical/`: the pre-vetted content (risk tables, scores, patient handouts), each with tests and its
  sources in the file header. Replace with your own field's content; keep it frozen on stage.
- `scripts/brief.sh https://your-console.vercel.app`: saves the locked brief as BRIEF.md.
- `scripts/reset.sh [--deploy]`: back to a clean `main` with green checks; `--deploy` also puts the
  empty page back on the live URL.

`npm run check` = typecheck + build + tests.

Parachutes: build each ballot option once in rehearsal, check it, and keep it on a `golden-<option>` branch
deployed to its own backup URL.
