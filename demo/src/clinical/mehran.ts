// Frozen clinical tables. Do not edit or round these on stage.
//
// Mehran risk score for contrast-induced nephropathy (CIN) after PCI.
// Source: Mehran R, Aymong ED, Nikolsky E, et al. "A simple risk score for prediction of
//   contrast-induced nephropathy after percutaneous coronary intervention: development and
//   initial validation." J Am Coll Cardiol 2004;44:1393-1399. doi:10.1016/j.jacc.2004.06.068
// CIN definition in the paper: rise in serum creatinine >= 25% or >= 0.5 mg/dL within 48 h.
//
// Points (Mehran 2004):
//   Hypotension (SBP < 80 mmHg for >= 1 h requiring inotropes or IABP within 24 h) .. 5
//   Intra-aortic balloon pump (IABP) ............................................. 5
//   Congestive heart failure (NYHA class III/IV or history of pulmonary edema) ....... 5
//   Age > 75 years ................................................................ 4
//   Anemia (baseline hematocrit < 39% for men, < 36% for women) ...................... 3
//   Diabetes mellitus ............................................................. 3
//   Contrast media volume ......................................... 1 per 100 mL (floor)
//   Renal function, ONE of:
//     serum creatinine > 1.5 mg/dL ................................................. 4
//     OR eGFR (mL/min/1.73 m2): < 20 = 6, 20-40 = 4, 40-60 = 2 (here 41-60), > 60 = 0
//
// Risk categories and observed rates (Mehran 2004, development cohort):
//   score <= 5   low        CIN  7.5%   dialysis 0.04%
//   score 6-10   moderate   CIN 14.0%   dialysis 0.12%
//   score 11-15  high       CIN 26.1%   dialysis 1.09%
//   score >= 16  very high  CIN 57.3%   dialysis 12.6%

export type RenalBand = 'egfrOver60' | 'egfr41to60' | 'egfr20to40' | 'egfrUnder20' | 'creatinineOver1_5'
export type MehranCategory = 'low' | 'moderate' | 'high' | 'veryHigh'

export interface MehranInput {
  hypotension: boolean
  iabp: boolean
  chf: boolean
  ageOver75: boolean
  anemia: boolean
  diabetes: boolean
  contrastMl: number
  renal: RenalBand
}

/** Points per yes/no risk factor (Mehran 2004). */
export const MEHRAN_POINTS = {
  hypotension: 5,
  iabp: 5,
  chf: 5,
  ageOver75: 4,
  anemia: 3,
  diabetes: 3,
} as const

/** Renal function points (Mehran 2004). Only one band applies. */
export const RENAL_POINTS: Record<RenalBand, number> = {
  egfrOver60: 0,
  egfr41to60: 2,
  egfr20to40: 4,
  egfrUnder20: 6,
  creatinineOver1_5: 4,
}

/** Contrast stepper limits for the UI (not part of the score itself). */
export const CONTRAST_MIN_ML = 0
export const CONTRAST_MAX_ML = 1000
export const CONTRAST_STEP_ML = 50

/** Observed CIN and dialysis rates (%) per category (Mehran 2004). */
export const MEHRAN_RISK: Record<MehranCategory, { cinPercent: number; dialysisPercent: number }> = {
  low: { cinPercent: 7.5, dialysisPercent: 0.04 },
  moderate: { cinPercent: 14.0, dialysisPercent: 0.12 },
  high: { cinPercent: 26.1, dialysisPercent: 1.09 },
  veryHigh: { cinPercent: 57.3, dialysisPercent: 12.6 },
}

/** Keeps a contrast volume inside the UI range; non-finite input becomes 0. */
export function clampContrast(ml: number): number {
  if (!Number.isFinite(ml)) return CONTRAST_MIN_ML
  return Math.min(Math.max(ml, CONTRAST_MIN_ML), CONTRAST_MAX_ML)
}

/** 1 point per full 100 mL of contrast (integer division). */
export function contrastPoints(ml: number): number {
  if (!Number.isFinite(ml) || ml <= 0) return 0
  return Math.floor(ml / 100)
}

export function mehranScore(i: MehranInput): number {
  let s = 0
  if (i.hypotension) s += MEHRAN_POINTS.hypotension
  if (i.iabp) s += MEHRAN_POINTS.iabp
  if (i.chf) s += MEHRAN_POINTS.chf
  if (i.ageOver75) s += MEHRAN_POINTS.ageOver75
  if (i.anemia) s += MEHRAN_POINTS.anemia
  if (i.diabetes) s += MEHRAN_POINTS.diabetes
  s += contrastPoints(i.contrastMl)
  s += RENAL_POINTS[i.renal]
  return s
}

export function mehranCategory(score: number): MehranCategory {
  if (score <= 5) return 'low'
  if (score <= 10) return 'moderate'
  if (score <= 15) return 'high'
  return 'veryHigh'
}

export function mehranRisk(score: number): { category: MehranCategory; cinPercent: number; dialysisPercent: number } {
  const category = mehranCategory(score)
  return { category, ...MEHRAN_RISK[category] }
}

/** High and very high categories trigger the hydration / contrast-sparing reminder. */
export function isHighRisk(category: MehranCategory): boolean {
  return category === 'high' || category === 'veryHigh'
}
