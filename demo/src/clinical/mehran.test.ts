import { describe, expect, it } from 'vitest'
import {
  CONTRAST_MAX_ML, CONTRAST_MIN_ML, MEHRAN_RISK, clampContrast, contrastPoints, isHighRisk,
  mehranCategory, mehranRisk, mehranScore, type MehranInput, type RenalBand,
} from './mehran'

const none: MehranInput = {
  hypotension: false, iabp: false, chf: false, ageOver75: false, anemia: false, diabetes: false,
  contrastMl: 0, renal: 'egfrOver60',
}

describe('Mehran score: yes/no risk factors (Mehran 2004)', () => {
  it('scores 0 with nothing', () => expect(mehranScore(none)).toBe(0))
  it.each([
    ['hypotension', 5], ['iabp', 5], ['chf', 5], ['ageOver75', 4], ['anemia', 3], ['diabetes', 3],
  ] as const)('%s alone = %i', (k, pts) => expect(mehranScore({ ...none, [k]: true })).toBe(pts))
})

describe('Mehran score: renal function (one band only)', () => {
  it.each([
    ['egfrOver60', 0], ['egfr41to60', 2], ['egfr20to40', 4], ['egfrUnder20', 6], ['creatinineOver1_5', 4],
  ] as [RenalBand, number][])('%s alone = %i', (renal, pts) => expect(mehranScore({ ...none, renal })).toBe(pts))
})

describe('Mehran score: contrast volume, 1 point per 100 mL (floor)', () => {
  it.each([[0, 0], [99, 0], [100, 1], [250, 2], [1000, 10]])('%i mL -> %i points', (ml, pts) => {
    expect(contrastPoints(ml)).toBe(pts)
    expect(mehranScore({ ...none, contrastMl: ml })).toBe(pts)
  })
  it('never goes negative or NaN', () => {
    expect(contrastPoints(-50)).toBe(0)
    expect(contrastPoints(Number.NaN)).toBe(0)
  })
  it('clamps the stepper to 0-1000 mL', () => {
    expect(clampContrast(-50)).toBe(CONTRAST_MIN_ML)
    expect(clampContrast(1050)).toBe(CONTRAST_MAX_ML)
    expect(clampContrast(350)).toBe(350)
    expect(clampContrast(Number.NaN)).toBe(0)
  })
})

describe('Mehran categories and risk table (Mehran 2004)', () => {
  it.each([
    [0, 'low', 7.5, 0.04], [5, 'low', 7.5, 0.04],
    [6, 'moderate', 14.0, 0.12], [10, 'moderate', 14.0, 0.12],
    [11, 'high', 26.1, 1.09], [15, 'high', 26.1, 1.09],
    [16, 'veryHigh', 57.3, 12.6], [41, 'veryHigh', 57.3, 12.6],
  ] as const)('score %i -> %s, CIN %f%, dialysis %f%', (score, cat, cin, dial) => {
    expect(mehranCategory(score)).toBe(cat)
    expect(mehranRisk(score)).toEqual({ category: cat, cinPercent: cin, dialysisPercent: dial })
  })
  it('table is frozen at the published values', () =>
    expect(MEHRAN_RISK).toEqual({
      low: { cinPercent: 7.5, dialysisPercent: 0.04 },
      moderate: { cinPercent: 14.0, dialysisPercent: 0.12 },
      high: { cinPercent: 26.1, dialysisPercent: 1.09 },
      veryHigh: { cinPercent: 57.3, dialysisPercent: 12.6 },
    }))
  it('only high and very high trigger the hydration reminder', () => {
    expect(isHighRisk('low')).toBe(false)
    expect(isHighRisk('moderate')).toBe(false)
    expect(isHighRisk('high')).toBe(true)
    expect(isHighRisk('veryHigh')).toBe(true)
  })
})

describe('Mehran score: combined cases', () => {
  it('max in the app range is 41 (all factors, eGFR < 20, 1000 mL)', () =>
    expect(mehranScore({
      hypotension: true, iabp: true, chf: true, ageOver75: true, anemia: true, diabetes: true,
      contrastMl: 1000, renal: 'egfrUnder20',
    })).toBe(41))
  it('realistic: 78-year-old diabetic, anemia, eGFR 35, 250 mL = 16 (very high)', () => {
    const score = mehranScore({ ...none, ageOver75: true, diabetes: true, anemia: true, renal: 'egfr20to40', contrastMl: 250 })
    expect(score).toBe(16) // 4 + 3 + 3 + 4 + 2
    expect(mehranRisk(score)).toEqual({ category: 'veryHigh', cinPercent: 57.3, dialysisPercent: 12.6 })
  })
  it('shock with IABP, eGFR 50, 150 mL = 13 (high)', () => {
    const score = mehranScore({ ...none, hypotension: true, iabp: true, renal: 'egfr41to60', contrastMl: 150 })
    expect(score).toBe(13)
    expect(mehranCategory(score)).toBe('high')
  })
})
