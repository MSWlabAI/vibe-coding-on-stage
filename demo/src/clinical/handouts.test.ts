import { describe, expect, it } from 'vitest'
import {
  averageSentenceLength, bodySentences, CLOSING, CONTENT, getHandout, handoutText, LANGS, LEVELS,
  PROCEDURES, SECTION_HEADINGS, SECTION_ORDER, wordCount,
  type Level, type ProcedureId,
} from './handouts'
import type { Lang } from './handouts'

const combos: [ProcedureId, Level, Lang][] = PROCEDURES.flatMap((p) =>
  LEVELS.flatMap((l) => LANGS.map((g) => [p, l, g] as [ProcedureId, Level, Lang])),
)
const pairs: [ProcedureId, Lang][] = PROCEDURES.flatMap((p) => LANGS.map((g) => [p, g] as [ProcedureId, Lang]))
const text = (p: ProcedureId, l: Level, g: Lang) => handoutText(getHandout(p, l, g))
const callUs = (p: ProcedureId, l: Level, g: Lang) => CONTENT[p][l][g].callUs.join(' ').toLowerCase()

describe('coverage', () => {
  it('has 5 procedures x 2 levels x 2 languages = 20 handouts', () => expect(combos).toHaveLength(20))

  it.each(combos)('%s / %s / %s exists with a title and caption', (p, l, g) => {
    const h = getHandout(p, l, g)
    expect(CONTENT[p][l][g]).toBeDefined()
    expect(h.title.length).toBeGreaterThan(3)
    expect(h.caption.length).toBeGreaterThan(3)
    expect([h.procedure, h.level, h.lang]).toEqual([p, l, g])
  })
})

describe('structure', () => {
  it('section order is fixed', () =>
    expect(SECTION_ORDER).toEqual(['done', 'firstWeek', 'wound', 'activity', 'medicines', 'callUs']))

  it('English headings are the agreed six', () =>
    expect(SECTION_ORDER.map((id) => SECTION_HEADINGS.en[id])).toEqual([
      'What was done today', 'The first week at home', 'Your wound (access site) care',
      'Activity', 'Medicines', 'Call us or go to the emergency department if',
    ]))

  it.each(combos)('%s / %s / %s has exactly the six sections, in order', (p, l, g) => {
    const h = getHandout(p, l, g)
    expect(h.sections.map((s) => s.id)).toEqual([...SECTION_ORDER])
    expect(h.sections.map((s) => s.heading)).toEqual(SECTION_ORDER.map((id) => SECTION_HEADINGS[g][id]))
    expect(Object.keys(CONTENT[p][l][g]).sort()).toEqual([...SECTION_ORDER].sort())
  })

  it.each(combos)('%s / %s / %s: every section has 2-5 non-empty, punctuated items', (p, l, g) => {
    for (const s of getHandout(p, l, g).sections) {
      expect(s.items.length, s.id).toBeGreaterThanOrEqual(2)
      expect(s.items.length, s.id).toBeLessThanOrEqual(5)
      for (const item of s.items) {
        expect(item.trim().length).toBeGreaterThan(5)
        expect(item).toMatch(/[.!?]$/)
      }
    }
  })

  it.each(combos)('%s / %s / %s ends with the closing line', (p, l, g) => {
    expect(getHandout(p, l, g).closing).toBe(CLOSING[g])
    expect(text(p, l, g).endsWith(CLOSING[g])).toBe(true)
  })

  it('closing lines are the agreed wording', () => {
    expect(CLOSING.en).toBe("This sheet is general education. Your own care team's instructions come first.")
    expect(CLOSING.es).toBe('Esta hoja es educación general. Las instrucciones de su propio equipo médico van primero.')
  })
})

describe('length and reading level', () => {
  it.each(combos)('%s / %s / %s is 120-320 words', (p, l, g) => {
    const n = wordCount(text(p, l, g))
    expect(n).toBeGreaterThanOrEqual(120)
    expect(n).toBeLessThanOrEqual(320)
  })

  it.each(pairs)('%s / %s: simple has shorter sentences than standard', (p, g) => {
    expect(averageSentenceLength(getHandout(p, 'simple', g))).toBeLessThan(
      averageSentenceLength(getHandout(p, 'standard', g)),
    )
  })

  it.each(pairs)('%s / %s: simple averages 10 words or fewer per sentence', (p, g) =>
    expect(averageSentenceLength(getHandout(p, 'simple', g))).toBeLessThanOrEqual(10))
})

describe('safety: no dosing, no invented numbers', () => {
  it.each(combos)('%s / %s / %s never mentions mg, mcg or tablet', (p, l, g) => {
    const t = text(p, l, g).toLowerCase()
    for (const banned of ['mg', 'mcg', 'tablet']) expect(t).not.toContain(banned)
  })

  it.each(combos)('%s / %s / %s uses no numbers except 10 (minutes) and 911', (p, l, g) => {
    const nums = text(p, l, g).match(/\d+/g) ?? []
    for (const n of nums) expect(['10', '911']).toContain(n)
  })

  it.each(combos)('%s / %s / %s carries the 10-minute pressure rule and 911', (p, l, g) => {
    const c = callUs(p, l, g)
    expect(c).toContain(g === 'en' ? '10 minutes of firm pressure' : '10 minutos de presión firme')
    expect(c).toContain('911')
  })
})

describe('clinically sensible "call us" lists', () => {
  const stroke = { en: /(trouble speaking|cannot talk well)/, es: /(dificultad para hablar|le cuesta hablar)/ }
  const breath = { en: /(short(ness)? of breath|trouble breathing)/, es: /(falta(n)? el aire|falta de aire)/ }

  it.each(LEVELS.flatMap((l) => LANGS.flatMap((g) => (['tavr', 'laao', 'teer'] as const).map((p) => [p, l, g] as const))))(
    '%s / %s / %s lists new stroke symptoms', (p, l, g) => expect(callUs(p, l, g)).toMatch(stroke[g]))

  it.each(LEVELS.flatMap((l) => LANGS.flatMap((g) => (['tavr', 'teer'] as const).map((p) => [p, l, g] as const))))(
    '%s / %s / %s lists shortness of breath', (p, l, g) => expect(callUs(p, l, g)).toMatch(breath[g]))

  it.each(LEVELS.flatMap((l) => LANGS.map((g) => [l, g] as const)))(
    'radialcath / %s / %s lists a cold or numb hand', (l, g) =>
      expect(callUs('radialcath', l, g)).toMatch(g === 'en' ? /hand .*cold.*numb/ : /mano .*fría.*(dormida|adormecida)/))

  it.each(LEVELS.flatMap((l) => LANGS.map((g) => [l, g] as const)))(
    'pci / %s / %s lists chest pain', (l, g) => expect(callUs('pci', l, g)).toMatch(g === 'en' ? /chest pain/ : /pecho/))

  it.each(combos)('%s / %s / %s lists fever and fainting or chest pain', (p, l, g) => {
    const c = callUs(p, l, g)
    expect(c).toMatch(g === 'en' ? /fever/ : /fiebre/)
    expect(c).toMatch(g === 'en' ? /(faint|chest pain)/ : /(desmaya|pecho)/)
  })

  it('radial cath says no stent was placed', () => {
    for (const l of LEVELS) {
      expect(CONTENT.radialcath[l].en.done.join(' ')).toMatch(/no stent/)
      expect(CONTENT.radialcath[l].es.done.join(' ')).toMatch(/ningún stent/)
    }
  })
})

describe('helpers', () => {
  it('wordCount ignores bullets and punctuation-only tokens', () => expect(wordCount('• Call 911 — now.')).toBe(3))
  it('bodySentences splits items into sentences', () => {
    const h = getHandout('tavr', 'simple', 'en')
    expect(bodySentences(h)[0]).toBe('Today you got a new aortic valve.')
  })
  it('handoutText starts with the title and includes every heading', () => {
    const h = getHandout('teer', 'simple', 'es')
    const t = handoutText(h)
    expect(t.startsWith(h.title)).toBe(true)
    for (const s of h.sections) expect(t).toContain(s.heading)
  })
})
