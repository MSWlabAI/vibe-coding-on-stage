import { validAnon } from './store'

export function anonFrom(req: Request): string | null {
  const h = req.headers.get('x-anon')
  if (validAnon(h)) return h
  const q = new URL(req.url).searchParams.get('anon')
  return validAnon(q) ? q : null
}

// On Vercel the admin page stays locked until ADMIN_KEY is set, so a fresh deploy never runs with a
// publicly known key. Running locally without ADMIN_KEY, the key is 'dev-key'.
export function adminKey(): string {
  const key = process.env.ADMIN_KEY?.trim()
  if (key) return key
  return process.env.VERCEL ? '' : 'dev-key'
}

export function isAdmin(req: Request): boolean {
  const key = adminKey()
  const h = req.headers.get('x-admin-key') ?? new URL(req.url).searchParams.get('key')
  return Boolean(key) && Boolean(h) && h === key
}

export const noStore = { 'Cache-Control': 'no-store, max-age=0' }

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: noStore })
}
