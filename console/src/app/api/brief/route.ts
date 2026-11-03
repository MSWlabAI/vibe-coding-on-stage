import { buildBrief } from '@/lib/brief'
import { noStore } from '@/lib/server'
import { publicState } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Plain-text brief for Claude Code:  curl https://<console>/api/brief > BRIEF.md
export async function GET() {
  const state = await publicState(null, { admin: true })
  return new Response(buildBrief(state), {
    headers: { ...noStore, 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
