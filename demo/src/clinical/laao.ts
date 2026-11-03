// Frozen clinical tables. Do not edit or round these on stage.
//
// CHA2DS2-VASc annual adjusted stroke / systemic embolism rate (%/year) by score.
// Source: Friberg L, Rosenqvist M, Lip GYH. Eur Heart J 2012;33:1500-1510 (Swedish AF cohort, n=182,678).
// HAS-BLED major bleeding rate (per 100 patient-years) by score.
// Source: Pisters R et al. Chest 2010;138:1093-1100 (Euro Heart Survey). Scores >=6: too few patients.
// Thresholds: 2023 ACC/AHA/ACCP/HRS Guideline for AF (Joglar JA et al. Circulation 2024;149:e1-e156):
//   anticoagulation recommended at CHA2DS2-VASc >=2 (men) / >=3 (women); HAS-BLED >=3 = high bleeding risk.

export type Sex = 'male' | 'female'
export type AgeBand = 'under65' | '65to74' | '75plus'

export interface ChadsInput {
  chf: boolean
  hypertension: boolean
  diabetes: boolean
  strokeTiaTe: boolean
  vascularDisease: boolean
  ageBand: AgeBand
  sex: Sex
}

export interface HasBledInput {
  uncontrolledHypertension: boolean // SBP > 160 mmHg
  abnormalRenal: boolean
  abnormalLiver: boolean
  stroke: boolean
  bleeding: boolean
  labileInr: boolean
  elderly: boolean // age > 65
  drugs: boolean // antiplatelet or NSAID
  alcohol: boolean // >= 8 drinks/week
}

export const CHADS_STROKE_RISK: Record<number, number> = {
  0: 0.2, 1: 0.6, 2: 2.2, 3: 3.2, 4: 4.8, 5: 7.2, 6: 9.7, 7: 11.2, 8: 10.8, 9: 12.2,
}

export const HASBLED_BLEED_RISK: Record<number, number> = {
  0: 1.13, 1: 1.02, 2: 1.88, 3: 3.74, 4: 8.7, 5: 12.5,
}

export function chadsScore(i: ChadsInput): number {
  let s = 0
  if (i.chf) s += 1
  if (i.hypertension) s += 1
  if (i.diabetes) s += 1
  if (i.strokeTiaTe) s += 2
  if (i.vascularDisease) s += 1
  if (i.ageBand === '65to74') s += 1
  if (i.ageBand === '75plus') s += 2
  if (i.sex === 'female') s += 1
  return s
}

export function hasBledScore(i: HasBledInput): number {
  return [
    i.uncontrolledHypertension, i.abnormalRenal, i.abnormalLiver, i.stroke, i.bleeding,
    i.labileInr, i.elderly, i.drugs, i.alcohol,
  ].filter(Boolean).length
}

export function strokeRiskPercent(score: number): number {
  return CHADS_STROKE_RISK[Math.min(Math.max(score, 0), 9)]
}

/** Returns null for scores >= 6, where the source cohort had too few patients. */
export function bleedRiskPer100(score: number): number | null {
  if (score >= 6) return null
  return HASBLED_BLEED_RISK[Math.max(score, 0)]
}

export function anticoagulationRecommended(score: number, sex: Sex): boolean {
  return sex === 'female' ? score >= 3 : score >= 2
}

export function highBleedingRisk(hasBled: number): boolean {
  return hasBled >= 3
}
