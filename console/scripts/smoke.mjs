#!/usr/bin/env node
// Smoke test for the audience console. Read-only by default; --full runs a simulated audience
// through every phase (needs ADMIN_KEY) and then resets the console back to phase 1.
//
//   node scripts/smoke.mjs https://your-console.vercel.app
//   ADMIN_KEY=xxx node scripts/smoke.mjs https://your-console.vercel.app --full
//
// Exit code 0 = all checks passed.
const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const FULL = process.argv.includes('--full')
const KEY = process.env.ADMIN_KEY ?? ''
const VOTERS = Number(process.env.VOTERS ?? 60)
let failures = 0
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) failures++ }
const anon = (p, i) => `${p}-${String(i).padStart(6, '0')}-smoke`
async function call(path, body, who = anon('smoke', 1), admin = false) {
  const headers = { 'content-type': 'application/json', 'x-anon': who }
  if (admin) headers['x-admin-key'] = KEY
  const t = Date.now()
  const r = await fetch(BASE + path, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  return { status: r.status, ms: Date.now() - t, ...j }
}

console.log(`Smoke test against ${BASE}${FULL ? ' (full)' : ' (read-only)'}`)
const s0 = await call('/api/state')
ok(s0.status === 200, `GET /api/state → ${s0.status} in ${s0.ms} ms`)
ok(s0.redis === true, `storage is Redis (redis=${s0.redis}); in-memory would lose votes between serverless instances`)
ok(['vote', 'requests', 'locked', 'live'].includes(s0.phase), `phase is "${s0.phase}"`)
ok(typeof s0.settings?.demoUrl === 'string' && s0.settings.demoUrl.startsWith('https://'), `demo URL is set (${s0.settings?.demoUrl || 'EMPTY'})`)
const brief0 = await fetch(BASE + '/api/brief')
ok(brief0.status === 200, `GET /api/brief → ${brief0.status}`)

if (FULL) {
  if (!KEY) { console.log('  FAIL --full needs ADMIN_KEY'); process.exit(1) }
  const before = s0.settings
  const a = await call('/api/state', null, anon('smoke', 1), true)
  ok(a.admin === true, 'admin key accepted')
  ok((await call('/api/admin', { action: 'reset', confirm: 'RESET' }, anon('smoke', 1), true)).status === 200, 'reset')
  ok((await call('/api/admin', { action: 'phase', phase: 'vote' }, anon('smoke', 1), true)).status === 200, 'phase → vote')

  // Burst of concurrent voters, like a room scanning a QR at once.
  const t = Date.now()
  const opts = ['laao', 'mehran', 'discharge']
  const results = await Promise.all(Array.from({ length: VOTERS }, (_, i) =>
    call('/api/vote', { pollId: 'build', optionId: opts[i % 3] }, anon('voter', i))
      .then(() => call('/api/vote', { pollId: 'theme', optionId: i % 2 ? 'cathlab' : 'sinai' }, anon('voter', i)))))
  const bad = results.filter((r) => r.status !== 200).length
  const s1 = await call('/api/state')
  const total = Object.values(s1.polls.build).reduce((x, y) => x + y, 0)
  ok(bad === 0, `${VOTERS} concurrent voters: ${bad} failed, burst took ${Date.now() - t} ms`)
  ok(total === VOTERS, `tally exact: ${total}/${VOTERS} build votes`)
  // Change-of-mind keeps the tally exact.
  await call('/api/vote', { pollId: 'build', optionId: 'laao' }, anon('voter', 0))
  const s2 = await call('/api/state')
  ok(Object.values(s2.polls.build).reduce((x, y) => x + y, 0) === VOTERS, 'vote change keeps the total exact')

  ok((await call('/api/admin', { action: 'phase', phase: 'requests' }, anon('smoke', 1), true)).status === 200, 'phase → requests')
  const feats = ['Add a Spanish toggle', 'Text the result to myself', 'Show the trial data', 'Add a TikTok dance']
  for (let i = 0; i < feats.length; i++) ok((await call('/api/submit', { category: 'feature', text: feats[i] }, anon('sub', i))).status === 200, `submit "${feats[i]}"`)
  ok((await call('/api/submit', { category: 'name', text: 'Watchman Wingman' }, anon('namer', 1))).status === 200, 'submit a name')
  const dup = await call('/api/submit', { category: 'feature', text: 'add a spanish toggle' }, anon('sub', 9))
  ok(dup.status === 400, 'duplicate refused')
  const prof = await call('/api/submit', { category: 'feature', text: 'make it the fucking best' }, anon('sub', 8))
  ok(prof.status === 200, 'profanity accepted silently…')
  const pub = await call('/api/state', null, anon('other', 1))
  ok(pub.submissions.length === 0, '…but nothing is visible to the audience before moderation')
  const adm = await call('/api/state', null, anon('smoke', 1), true)
  ok(adm.submissions.some((x) => x.text.startsWith('make it') && x.status === 'rejected'), 'profanity auto-rejected in the admin view')
  const pending = adm.submissions.filter((x) => x.status === 'pending')
  for (const x of pending) await call('/api/admin', { action: 'moderate', id: x.id, status: x.text.includes('TikTok') ? 'rejected' : 'approved', showcase: x.text.includes('TikTok') }, anon('smoke', 1), true)
  const approved = (await call('/api/state', null, anon('smoke', 1), true)).submissions.filter((x) => x.status === 'approved' && x.category === 'feature')
  let k = 0
  for (const x of approved) { k++; await Promise.all(Array.from({ length: 20 - k * 3 }, (_, i) => call('/api/upvote', { id: x.id }, anon('up', i)))) }
  ok((await call('/api/admin', { action: 'selectTop', n: 3 }, anon('smoke', 1), true)).status === 200, 'select top 3')
  ok((await call('/api/admin', { action: 'phase', phase: 'locked' }, anon('smoke', 1), true)).status === 200, 'phase → locked')
  const brief = await (await fetch(BASE + '/api/brief')).text()
  ok(/## Build this/.test(brief) && /1\. /.test(brief) && /Watchman Wingman/.test(brief) && /do NOT build[\s\S]*TikTok/.test(brief), 'brief has winner, ranked features, name, rejected list')
  console.log('--- brief preview ---\n' + brief.split('\n').slice(0, 14).join('\n') + '\n---')
  ok((await call('/api/admin', { action: 'phase', phase: 'live' }, anon('smoke', 1), true)).status === 200, 'phase → live')

  // Put the console back the way the talk needs it.
  ok((await call('/api/admin', { action: 'reset', confirm: 'RESET' }, anon('smoke', 1), true)).status === 200, 'reset after test')
  ok((await call('/api/admin', { action: 'phase', phase: 'vote' }, anon('smoke', 1), true)).status === 200, 'phase back to vote')
  const end = await call('/api/state')
  ok(end.phase === 'vote' && end.submissions.length === 0 && Object.values(end.polls.build).every((v) => v === 0), 'console is clean: phase 1, zero votes, zero submissions')
  ok(end.settings.demoUrl === before.demoUrl, `demo URL survived the reset (${end.settings.demoUrl})`)
}
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
