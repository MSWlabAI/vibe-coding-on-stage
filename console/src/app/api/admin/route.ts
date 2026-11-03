import { LIMITS, PHASES, POLLS, type Phase } from '@/lib/config'
import { anonFrom, isAdmin, json } from '@/lib/server'
import { cleanText, publicState, seedFeatures, store, usingRedis, type Status } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Puts the live demo app back to the empty "Nothing here yet" page by triggering a Vercel
// deploy hook for the demo project's main branch. The hook URL is a server-only secret
// (DEMO_DEPLOY_HOOK_URL); it can only start a fresh production deploy of GitHub main.
async function triggerDemoReset(): Promise<{ ok: boolean; notice: string }> {
  const url = process.env.DEMO_DEPLOY_HOOK_URL?.trim()
  if (!url) return { ok: false, notice: 'Demo app not reset: DEMO_DEPLOY_HOOK_URL is not set on this project.' }
  if (!/^https:\/\/api\.vercel\.com\//.test(url)) return { ok: false, notice: 'Demo app not reset: DEMO_DEPLOY_HOOK_URL is not a Vercel deploy hook URL.' }
  try {
    const r = await fetch(url, { method: 'POST', cache: 'no-store' })
    if (!r.ok) return { ok: false, notice: `Demo app not reset: Vercel answered HTTP ${r.status}.` }
    return { ok: true, notice: 'Demo app reset started. The app URL shows "Nothing here yet" in about a minute.' }
  } catch {
    return { ok: false, notice: 'Demo app not reset: could not reach Vercel.' }
  }
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return json({ error: 'bad admin key' }, 401)
  const body = await req.json().catch(() => ({}))
  const s = store()
  let notice: string | undefined
  switch (body.action) {
    case 'phase': {
      if (!PHASES.includes(body.phase)) return json({ error: 'bad phase' }, 400)
      // Locking with nothing selected would send a brief with no features: pick the top approved ones.
      if (body.phase === 'locked') {
        const feats = (await s.listSubmissions()).filter((x) => x.category === 'feature')
        if (!feats.some((x) => x.selected)) {
          const picked = await selectTop(s, LIMITS.maxBuildFeatures)
          notice = picked ? `No features were selected, so the top ${picked} approved were added to the brief.` : 'No approved feature requests: the brief has no features.'
        }
      }
      await s.setPhase(body.phase as Phase)
      break
    }
    case 'moderate': {
      const status = body.status as Status
      if (!['pending', 'approved', 'rejected'].includes(status)) return json({ error: 'bad status' }, 400)
      await s.updateSubmission(String(body.id), {
        status,
        showcase: Boolean(body.showcase),
        ...(status !== 'approved' ? { selected: false } : {}),
      })
      break
    }
    case 'seed': {
      const texts = Array.isArray(body.texts) ? (body.texts as unknown[]).map(String).slice(0, 10) : []
      const r = await seedFeatures(texts)
      notice = `Added ${r.added} suggested feature${r.added === 1 ? '' : 's'}${r.skipped ? ` (${r.skipped} already on the board)` : ''}. The audience can upvote them now.`
      break
    }
    case 'select': {
      await s.updateSubmission(String(body.id), { selected: Boolean(body.selected) })
      break
    }
    case 'selectTop': {
      await selectTop(s, Number(body.n ?? LIMITS.maxBuildFeatures))
      break
    }
    case 'settings': {
      const cur = await s.getSettings()
      const overrides = { ...cur.overrides }
      if (body.overrides && typeof body.overrides === 'object') {
        for (const [pollId, optionId] of Object.entries(body.overrides as Record<string, string>)) {
          const poll = POLLS.find((p) => p.id === pollId)
          if (!poll) continue
          if (!optionId) delete overrides[pollId]
          else if (poll.options.some((o) => o.id === optionId)) overrides[pollId] = optionId
        }
      }
      await s.setSettings({
        demoUrl: body.demoUrl !== undefined ? cleanText(body.demoUrl).slice(0, 300) : cur.demoUrl,
        appName: body.appName !== undefined ? cleanText(body.appName).slice(0, 80) : cur.appName,
        overrides,
        slide: cur.slide,
      })
      break
    }
    case 'slide': {
      const to = Math.round(Number(body.to))
      if (!Number.isFinite(to)) return json({ error: 'bad slide' }, 400)
      const cur = await s.getSettings()
      await s.setSettings({ ...cur, slide: Math.max(0, Math.min(99, to)) })
      break
    }
    case 'reset': {
      if (body.confirm !== 'RESET') return json({ error: 'type RESET to confirm' }, 400)
      await s.reset()
      if (body.resetDemo === true) {
        const d = await triggerDemoReset()
        notice = 'Votes and cards cleared. ' + d.notice
      } else notice = 'Votes and cards cleared.'
      break
    }
    case 'resetDemo': {
      const d = await triggerDemoReset()
      if (!d.ok) return json({ error: d.notice }, 400)
      notice = d.notice
      break
    }
    default:
      return json({ error: 'unknown action' }, 400)
  }
  return json({ ...(await publicState(anonFrom(req), { admin: true })), admin: true, redis: usingRedis(), demoHook: Boolean(process.env.DEMO_DEPLOY_HOOK_URL), notice })
}

/** Marks the n most-upvoted approved feature cards as selected (and unselects the rest). Returns how many were picked. */
async function selectTop(s: ReturnType<typeof store>, n: number): Promise<number> {
  const all = (await s.listSubmissions()).filter((x) => x.category === 'feature')
  const ranked = await Promise.all(all.map(async (x) => ({ x, v: await s.upvoteCount(x.id) })))
  ranked.sort((a, b) => b.v - a.v || a.x.createdAt - b.x.createdAt)
  let picked = 0
  for (const { x } of ranked) {
    const take = x.status === 'approved' && picked < n
    if (take) picked++
    if (x.selected !== take) await s.updateSubmission(x.id, { selected: take })
  }
  return picked
}
