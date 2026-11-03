import { anonFrom, json } from '@/lib/server'
import { publicState, store } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const anon = anonFrom(req)
  if (!anon) return json({ error: 'missing anon id' }, 400)
  const body = await req.json().catch(() => ({}))
  const id = String(body.id ?? '')
  const s = store()
  const phase = await s.getPhase()
  if (phase !== 'requests') return json({ error: 'Voting on requests is closed' }, 409)
  const sub = (await s.listSubmissions()).find((x) => x.id === id)
  if (!sub || sub.status !== 'approved') return json({ error: 'not available' }, 404)
  await s.toggleUpvote(id, anon)
  return json(await publicState(anon))
}
