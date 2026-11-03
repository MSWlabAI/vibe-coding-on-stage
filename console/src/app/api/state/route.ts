import { anonFrom, isAdmin, json } from '@/lib/server'
import { publicState, usingRedis } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const admin = isAdmin(req)
  const state = await publicState(anonFrom(req), { admin })
  return json({ ...state, admin, redis: usingRedis(), ...(admin ? { demoHook: Boolean(process.env.DEMO_DEPLOY_HOOK_URL) } : {}) })
}
