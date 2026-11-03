import { describe, expect, it } from 'vitest'
import {
  anticoagulationRecommended, bleedRiskPer100, chadsScore, hasBledScore, highBleedingRisk,
  strokeRiskPercent, type ChadsInput, type HasBledInput,
} from './laao'

const noChads: ChadsInput = {
  chf: false, hypertension: false, diabetes: false, strokeTiaTe: false,
  vascularDisease: false, ageBand: 'under65', sex: 'male',
}
const noBled: HasBledInput = {
  uncontrolledHypertension: false, abnormalRenal: false, abnormalLiver: false, stroke: false,
  bleeding: false, labileInr: false, elderly: false, drugs: false, alcohol: false,
}

describe('CHA2DS2-VASc', () => {
  it('scores 0 for a young man with nothing', () => expect(chadsScore(noChads)).toBe(0))
  it('scores 1 for a young woman with nothing (sex category)', () =>
    expect(chadsScore({ ...noChads, sex: 'female' })).toBe(1))
  it('gives 2 points for age >= 75 and 2 for prior stroke', () =>
    expect(chadsScore({ ...noChads, ageBand: '75plus', strokeTiaTe: true })).toBe(4))
  it('gives 1 point for age 65-74', () => expect(chadsScore({ ...noChads, ageBand: '65to74' })).toBe(1))
  it('maxes at 9', () =>
    expect(chadsScore({
      chf: true, hypertension: true, diabetes: true, strokeTiaTe: true,
      vascularDisease: true, ageBand: '75plus', sex: 'female',
    })).toBe(9))
  it('typical LAAO referral: 78F, HTN, DM, prior TIA = 7', () =>
    expect(chadsScore({ ...noChads, sex: 'female', ageBand: '75plus', hypertension: true, diabetes: true, strokeTiaTe: true })).toBe(7))
})

describe('stroke risk table (Friberg 2012)', () => {
  it.each([[0, 0.2], [1, 0.6], [2, 2.2], [3, 3.2], [4, 4.8], [5, 7.2], [6, 9.7], [7, 11.2], [8, 10.8], [9, 12.2]])(
    'score %i -> %f %/yr', (s, r) => expect(strokeRiskPercent(s)).toBe(r))
})

describe('anticoagulation threshold (2023 ACC/AHA/ACCP/HRS)', () => {
  it('>= 2 for men', () => {
    expect(anticoagulationRecommended(1, 'male')).toBe(false)
    expect(anticoagulationRecommended(2, 'male')).toBe(true)
  })
  it('>= 3 for women', () => {
    expect(anticoagulationRecommended(2, 'female')).toBe(false)
    expect(anticoagulationRecommended(3, 'female')).toBe(true)
  })
})

describe('HAS-BLED', () => {
  it('scores 0 with nothing', () => expect(hasBledScore(noBled)).toBe(0))
  it('counts renal and liver separately', () =>
    expect(hasBledScore({ ...noBled, abnormalRenal: true, abnormalLiver: true })).toBe(2))
  it('maxes at 9', () =>
    expect(hasBledScore({
      uncontrolledHypertension: true, abnormalRenal: true, abnormalLiver: true, stroke: true,
      bleeding: true, labileInr: true, elderly: true, drugs: true, alcohol: true,
    })).toBe(9))
  it('>= 3 is high bleeding risk', () => {
    expect(highBleedingRisk(2)).toBe(false)
    expect(highBleedingRisk(3)).toBe(true)
  })
})

describe('bleeding risk table (Pisters 2010)', () => {
  it.each([[0, 1.13], [1, 1.02], [2, 1.88], [3, 3.74], [4, 8.7], [5, 12.5]])(
    'score %i -> %f per 100 pt-yr', (s, r) => expect(bleedRiskPer100(s)).toBe(r))
  it('returns null at >= 6 (insufficient data)', () => expect(bleedRiskPer100(6)).toBeNull())
})
