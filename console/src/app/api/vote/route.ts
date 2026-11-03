import { POLLS } from '@/lib/config'
import { anonFrom, json } from '@/lib/server'
import { publicState, store } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const anon = anonFrom(req)
  if (!anon) return json({ error: 'missing anon id' }, 400)
  const body = await req.json().catch(() => ({}))
  const poll = POLLS.find((p) => p.id === body.pollId)
  const option = poll?.options.find((o) => o.id === body.optionId)
  if (!poll || !option) return json({ error: 'unknown poll or option' }, 400)
  const phase = await store().getPhase()
  if (phase !== 'vote') return json({ error: 'Voting is closed' }, 409)
  await store().vote(poll.id, option.id, anon)
  return json(await publicState(anon))
}
