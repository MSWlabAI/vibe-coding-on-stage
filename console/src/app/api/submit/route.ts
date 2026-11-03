import { anonFrom, json } from '@/lib/server'
import { publicState, store, submit } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const anon = anonFrom(req)
  if (!anon) return json({ error: 'missing anon id' }, 400)
  const body = await req.json().catch(() => ({}))
  const phase = await store().getPhase()
  if (phase !== 'requests') return json({ error: 'Requests are closed' }, 409)
  const r = await submit(String(body.category ?? ''), body.text, anon)
  if (!r.ok) return json({ error: r.error }, 400)
  return json(await publicState(anon))
}
