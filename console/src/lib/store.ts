import { Redis } from '@upstash/redis'
import { BLOCKLIST, CATEGORIES, LIMITS, PHASES, POLLS, type Phase } from './config'

export type Status = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  category: 'feature' | 'name'
  text: string
  anon: string
  status: Status
  selected: boolean // moderator picked it for the build
  showcase: boolean // moderator wants it on the big screen in the "not today" bin
  createdAt: number
}

export interface PublicSubmission extends Omit<Submission, 'anon'> {
  votes: number
  mine: boolean
  upvoted: boolean
}

export interface Settings {
  demoUrl: string
  appName: string
  overrides: Record<string, string> // pollId -> optionId
  slide: number // deck slide (0-based) set by the admin page's Back/Next; the /deck page follows it
}

export interface PublicState {
  phase: Phase
  polls: Record<string, Record<string, number>>
  myVotes: Record<string, string>
  submissions: PublicSubmission[]
  pendingCount: number
  settings: Settings
  serverTime: number
}

const DEFAULT_SETTINGS: Settings = { demoUrl: '', appName: '', overrides: {}, slide: 0 }

// ---------- storage backends ----------

interface Backend {
  getPhase(): Promise<Phase>
  setPhase(p: Phase): Promise<void>
  vote(pollId: string, optionId: string, anon: string): Promise<void>
  pollCounts(pollId: string): Promise<Record<string, number>>
  myVote(pollId: string, anon: string): Promise<string | null>
  addSubmission(s: Submission): Promise<void>
  listSubmissions(): Promise<Submission[]>
  updateSubmission(id: string, patch: Partial<Submission>): Promise<void>
  toggleUpvote(id: string, anon: string): Promise<boolean>
  upvoteCount(id: string): Promise<number>
  hasUpvoted(id: string, anon: string): Promise<boolean>
  getSettings(): Promise<Settings>
  setSettings(s: Settings): Promise<void>
  reset(): Promise<void>
}

const NS = process.env.CONSOLE_NAMESPACE ?? 'tct'
const k = (...parts: string[]) => [NS, ...parts].join(':')

function redisBackend(redis: Redis): Backend {
  return {
    async getPhase() {
      const p = await redis.get<string>(k('phase'))
      return PHASES.includes(p as Phase) ? (p as Phase) : 'vote'
    },
    async setPhase(p) {
      await redis.set(k('phase'), p)
    },
    async vote(pollId, optionId, anon) {
      const prev = await redis.hget<string>(k('ballot', pollId), anon)
      if (prev === optionId) return
      const tx = redis.multi()
      if (prev) tx.hincrby(k('poll', pollId), prev, -1)
      tx.hincrby(k('poll', pollId), optionId, 1)
      tx.hset(k('ballot', pollId), { [anon]: optionId })
      await tx.exec()
    },
    async pollCounts(pollId) {
      const raw = (await redis.hgetall<Record<string, number>>(k('poll', pollId))) ?? {}
      const out: Record<string, number> = {}
      for (const [key, v] of Object.entries(raw)) out[key] = Math.max(0, Number(v))
      return out
    },
    async myVote(pollId, anon) {
      return (await redis.hget<string>(k('ballot', pollId), anon)) ?? null
    },
    async addSubmission(s) {
      const tx = redis.multi()
      tx.set(k('sub', s.id), s)
      tx.rpush(k('subs'), s.id)
      await tx.exec()
    },
    async listSubmissions() {
      const ids = await redis.lrange<string>(k('subs'), 0, -1)
      if (ids.length === 0) return []
      const subs = await redis.mget<(Submission | null)[]>(...ids.map((id) => k('sub', id)))
      return subs.filter((s): s is Submission => Boolean(s))
    },
    async updateSubmission(id, patch) {
      const cur = await redis.get<Submission>(k('sub', id))
      if (!cur) return
      await redis.set(k('sub', id), { ...cur, ...patch })
    },
    async toggleUpvote(id, anon) {
      const added = await redis.sadd(k('up', id), anon)
      if (added === 1) return true
      await redis.srem(k('up', id), anon)
      return false
    },
    async upvoteCount(id) {
      return redis.scard(k('up', id))
    },
    async hasUpvoted(id, anon) {
      return (await redis.sismember(k('up', id), anon)) === 1
    },
    async getSettings() {
      return { ...DEFAULT_SETTINGS, ...((await redis.get<Partial<Settings>>(k('settings'))) ?? {}) }
    },
    async setSettings(s) {
      await redis.set(k('settings'), s)
    },
    async reset() {
      // Wipes votes, submissions, forced winners and the app-name override, but keeps the demo URL,
      // so a reset after a rehearsal never blanks the phase-4 QR code and never carries a forced pick into the talk.
      const settings: Settings = { ...DEFAULT_SETTINGS, demoUrl: (await this.getSettings()).demoUrl }
      // KEYS on a namespace of a few hundred keys is fine for a one-off reset.
      const keys = await redis.keys(k('*'))
      if (keys.length) await redis.del(...keys)
      await redis.set(k('settings'), settings)
    },
  }
}

function memoryBackend(): Backend {
  const g = globalThis as unknown as { __tctMem?: ReturnType<typeof fresh> }
  function fresh() {
    return {
      phase: 'vote' as Phase,
      polls: new Map<string, Map<string, number>>(),
      ballots: new Map<string, Map<string, string>>(),
      subs: [] as Submission[],
      ups: new Map<string, Set<string>>(),
      settings: { ...DEFAULT_SETTINGS },
    }
  }
  if (!g.__tctMem) g.__tctMem = fresh()
  const m = () => g.__tctMem!
  const map = <V,>(st: Map<string, Map<string, V>>, key: string) => {
    if (!st.has(key)) st.set(key, new Map())
    return st.get(key)!
  }
  return {
    async getPhase() { return m().phase },
    async setPhase(p) { m().phase = p },
    async vote(pollId, optionId, anon) {
      const ballot = map(m().ballots, pollId)
      const counts = map(m().polls, pollId)
      const prev = ballot.get(anon)
      if (prev === optionId) return
      if (prev) counts.set(prev, Math.max(0, (counts.get(prev) ?? 0) - 1))
      counts.set(optionId, (counts.get(optionId) ?? 0) + 1)
      ballot.set(anon, optionId)
    },
    async pollCounts(pollId) { return Object.fromEntries(map(m().polls, pollId)) },
    async myVote(pollId, anon) { return map(m().ballots, pollId).get(anon) ?? null },
    async addSubmission(s) { m().subs.push(s) },
    async listSubmissions() { return [...m().subs] },
    async updateSubmission(id, patch) {
      const i = m().subs.findIndex((s) => s.id === id)
      if (i >= 0) m().subs[i] = { ...m().subs[i], ...patch }
    },
    async toggleUpvote(id, anon) {
      if (!m().ups.has(id)) m().ups.set(id, new Set())
      const set = m().ups.get(id)!
      if (set.has(anon)) { set.delete(anon); return false }
      set.add(anon); return true
    },
    async upvoteCount(id) { return m().ups.get(id)?.size ?? 0 },
    async hasUpvoted(id, anon) { return m().ups.get(id)?.has(anon) ?? false },
    async getSettings() { return { ...m().settings } },
    async setSettings(s) { m().settings = s },
    async reset() { const demoUrl = m().settings.demoUrl; g.__tctMem = fresh(); g.__tctMem.settings = { ...DEFAULT_SETTINGS, demoUrl } },
  }
}

export function usingRedis(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return Boolean(url && token)
}

let backend: Backend | null = null
export function store(): Backend {
  if (backend) return backend
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  backend = url && token ? redisBackend(new Redis({ url, token })) : memoryBackend()
  return backend
}

// ---------- higher-level operations ----------

export function cleanText(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function validAnon(a: unknown): a is string {
  return typeof a === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(a)
}

export async function publicState(anon: string | null, opts: { admin?: boolean } = {}): Promise<PublicState> {
  const s = store()
  const [phase, settings, subs] = await Promise.all([s.getPhase(), s.getSettings(), s.listSubmissions()])
  const polls: Record<string, Record<string, number>> = {}
  const myVotes: Record<string, string> = {}
  await Promise.all(
    POLLS.map(async (p) => {
      polls[p.id] = await s.pollCounts(p.id)
      for (const o of p.options) polls[p.id][o.id] ??= 0
      if (anon) {
        const mv = await s.myVote(p.id, anon)
        if (mv) myVotes[p.id] = mv
      }
    }),
  )
  const visible = subs.filter((x) => {
    if (opts.admin) return true
    if (x.status === 'approved') return true
    if (x.status === 'rejected' && x.showcase) return true
    return anon !== null && x.anon === anon // your own pending / rejected items
  })
  const submissions: PublicSubmission[] = await Promise.all(
    visible.map(async (x) => {
      const [votes, upvoted] = await Promise.all([s.upvoteCount(x.id), anon ? s.hasUpvoted(x.id, anon) : false])
      const { anon: owner, ...rest } = x
      return { ...rest, votes, mine: anon !== null && owner === anon, upvoted }
    }),
  )
  submissions.sort((a, b) => b.votes - a.votes || a.createdAt - b.createdAt)
  return {
    phase,
    polls,
    myVotes,
    submissions,
    pendingCount: subs.filter((x) => x.status === 'pending').length,
    settings,
    serverTime: Date.now(),
  }
}

export async function submit(category: string, text: string, anon: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const cat = CATEGORIES.find((c) => c.id === category)
  if (!cat) return { ok: false, error: 'Unknown category' }
  const clean = cleanText(text)
  if (clean.length < LIMITS.textMin) return { ok: false, error: 'A little longer, please' }
  if (clean.length > LIMITS.textMax) return { ok: false, error: `Keep it under ${LIMITS.textMax} characters` }
  const s = store()
  const all = await s.listSubmissions()
  if (all.length >= LIMITS.maxSubmissionsTotal) return { ok: false, error: 'The board is full — thank you!' }
  const mine = all.filter((x) => x.anon === anon && x.category === cat.id).length
  if (mine >= cat.maxPerPerson) return { ok: false, error: `You already sent ${cat.maxPerPerson} — upvote others instead` }
  if (all.some((x) => x.category === cat.id && x.text.toLowerCase() === clean.toLowerCase()))
    return { ok: false, error: 'Someone already said that — upvote it!' }
  const blocked = BLOCKLIST.test(clean)
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  await s.addSubmission({
    id, category: cat.id, text: clean, anon, status: blocked ? 'rejected' : 'pending',
    selected: false, showcase: false, createdAt: Date.now(),
  })
  return { ok: true, id }
}

/** Moderator-added feature cards (suggested ideas): approved immediately, no per-person limit, duplicates skipped. */
export async function seedFeatures(texts: string[]): Promise<{ added: number; skipped: number }> {
  const s = store()
  const all = await s.listSubmissions()
  const have = new Set(all.filter((x) => x.category === 'feature').map((x) => x.text.toLowerCase()))
  let added = 0
  let skipped = 0
  for (const t of texts) {
    const clean = cleanText(t)
    if (clean.length < LIMITS.textMin || clean.length > LIMITS.textMax || have.has(clean.toLowerCase()) || all.length + added >= LIMITS.maxSubmissionsTotal) { skipped++; continue }
    have.add(clean.toLowerCase())
    await s.addSubmission({
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, category: 'feature', text: clean,
      anon: 'moderator-suggested', status: 'approved', selected: false, showcase: false, createdAt: Date.now() + added,
    })
    added++
  }
  return { added, skipped }
}
