// Everything the audience can vote on lives here. Edit freely before the talk.

export type Phase = 'vote' | 'requests' | 'locked' | 'live'
export const PHASES: Phase[] = ['vote', 'requests', 'locked', 'live']

export const PHASE_LABEL: Record<Phase, string> = {
  vote: '1 · Vote on what we build',
  requests: '2 · Feature requests',
  locked: '3 · Brief locked — building now',
  live: '4 · It\'s live',
}

export interface PollOption {
  id: string
  label: string
  blurb: string // one line shown to the audience
  spec: string // what goes into the brief for Claude Code
  ideas?: string[] // suggested feature cards the moderator can add in phase 2 (build ballot only)
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
}

export const POLLS: Poll[] = [
  {
    id: 'build',
    question: 'What should we build live?',
    options: [
      {
        id: 'laao',
        label: 'LAAO candidacy card',
        blurb: 'CHA₂DS₂-VASc + HAS-BLED side by side, with plain-English annual risk.',
        spec:
          'A single-page LAAO candidacy card. CHA2DS2-VASc and HAS-BLED calculators side by side (stacked on phones). ' +
          'Each input is a large toggle; scores update instantly. Under each score show the annual risk in plain English ' +
          '(stroke %/yr from Friberg 2012; major bleeds per 100 patient-years from Pisters 2010) and a one-line verdict: ' +
          'anticoagulation recommended at CHA2DS2-VASc >=2 men / >=3 women (2023 ACC/AHA/ACCP/HRS); HAS-BLED >=3 = high bleeding risk. ' +
          'When anticoagulation is indicated, show one line: LAAO may be considered if long-term OAC is contraindicated (Class 2a). ' +
          'Use the pre-vetted scoring and risk tables in src/clinical/laao.ts (already tested); do not re-type any number.',
        ideas: [
          'Show which risk factors add up to each score',
          'Stroke risk vs bleeding risk as two bars side by side',
          'Add a demo-patient button: 78-year-old woman with hypertension and a prior major bleed',
          'Flag the bleeding risks you can fix (BP, labile INR, NSAIDs, alcohol)',
          'Copy a one-line summary for my note',
        ],
      },
      {
        id: 'mehran',
        label: 'Contrast nephropathy risk',
        blurb: 'Mehran score for PCI, with the hydration reminder built in.',
        spec:
          'A single-page Mehran contrast-induced nephropathy risk calculator for PCI (Mehran R et al. JACC 2004;44:1393-9). ' +
          'Inputs: hypotension (5), IABP (5), CHF (5), age >75 (4), anemia (3), diabetes (3), contrast volume (1 per 100 mL, numeric), ' +
          'eGFR band (<20: 6, 20-40: 4, 40-60: 2). Show the total and the risk category with CIN and dialysis rates from the paper: ' +
          '<=5: 7.5% CIN / 0.04% dialysis; 6-10: 14% / 0.12%; 11-15: 26.1% / 1.09%; >=16: 57.3% / 12.6%. ' +
          'Add a short hydration reminder line for the two highest categories. ' +
          'Use the pre-vetted points and category tables in src/clinical/mehran.ts (already tested); do not re-type any number.',
        ideas: [
          'Contrast slider that shows mL left before the next risk category',
          'Show the points each factor adds',
          'Type the eGFR and pick the band automatically',
          'Risk meter that turns amber then red by category',
          'Copy a one-line summary for the cath report',
        ],
      },
      {
        id: 'discharge',
        label: 'Patient discharge explainer',
        blurb: 'Pick a procedure, get a plain-language handout at a chosen reading level.',
        spec:
          'A single-page patient discharge explainer. Dropdown of procedures (TAVR, PCI, LAAO, MitraClip/TEER, radial cath). ' +
          'Reading level toggle (simple / standard). Renders a printable plain-language handout from static text in src/handouts.ts: ' +
          'what was done, what to expect in the first week, when to call, activity and wound care. Print button. No AI calls, no network. ' +
          'Use the pre-vetted handouts in src/clinical/handouts.ts (getHandout, handoutText, already tested, English and Spanish); do not write new handout text.',
        ideas: [
          'Include a picture of where the catheter went in',
          'Spanish toggle',
          'A checklist of warning signs to call about',
          'Read it aloud button',
          'Text or share the handout',
          'Large print button',
        ],
      },
    ],
  },
  {
    id: 'theme',
    question: 'Pick the look',
    options: [
      { id: 'cathlab', label: 'Cath lab dark', blurb: 'Dark slate, sky-blue accent. Easy on the eyes under fluoro.', spec: 'dark slate background (bg-slate-950), sky-blue accent (sky-400/500), light text.' },
      { id: 'sinai', label: 'Clinic light', blurb: 'White cards on pale blue. Clean and printable.', spec: 'pale blue page (bg-sky-50), white cards, sky-700 accent, dark text.' },
      { id: 'contrast', label: 'High contrast', blurb: 'Black, white, yellow. Readable in any light.', spec: 'pure black background, white text and borders, yellow-300 accent for active states.' },
    ],
  },
]

export interface SubmissionCategory {
  id: 'feature' | 'name'
  title: string
  prompt: string
  placeholder: string
  maxPerPerson: number
}

export const CATEGORIES: SubmissionCategory[] = [
  {
    id: 'feature',
    title: 'Feature requests',
    prompt: 'What should it do? One idea per card. Upvote the ones you want built.',
    placeholder: 'e.g. Add a Spanish toggle',
    maxPerPerson: 3,
  },
  {
    id: 'name',
    title: 'Name the app',
    prompt: 'The winning name shows up in the app\'s header.',
    placeholder: 'e.g. Watchman Wingman',
    maxPerPerson: 2,
  },
]

export const LIMITS = {
  textMin: 3,
  textMax: 140,
  maxSubmissionsTotal: 600,
  maxBuildFeatures: 3, // default number of top features the admin "select top" button picks
}

// Words that get a submission auto-rejected (kept short and obvious; the moderator queue catches the rest).
export const BLOCKLIST = /\b(fuck|shit|bitch|asshole|cunt|nigg|fag|retard)\w*/i

export const EVENT = {
  title: 'Live Vibe Coding',
  subtitle: 'You write the brief. Claude Code writes the app. Deployed before the session ends.',
  defaultAppName: 'Structural Heart Pocket Tools',
}

// Commands shown with Copy buttons on the projector in phase 3 (brief locked), for the presenter's terminal.
export const STAGE_DEMO_DIR = '~/vibe-coding-on-stage/demo' // where demo/ lives on the presenter's laptop
export const STAGE_PROMPT =
  "Read CLAUDE.md and BRIEF.md. Build exactly what the brief says. Run npm run check before you tell me you're done, and tell me what you chose."
export function stageCommands(consoleUrl: string) {
  return {
    build: `cd ${STAGE_DEMO_DIR} && ./scripts/brief.sh ${consoleUrl} && claude "${STAGE_PROMPT}"`,
    deploy: `cd ${STAGE_DEMO_DIR} && npm run check && vercel --prod`,
  }
}
