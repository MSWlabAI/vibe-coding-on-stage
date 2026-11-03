'use client'
import { useState } from 'react'
import { CATEGORIES, LIMITS, PHASES, PHASE_LABEL, POLLS } from '@/lib/config'
import { adminKey, api, useBrowserValue, useLiveState, type ClientState } from '@/lib/client'
import type { PublicSubmission } from '@/lib/store'
import { winner } from '@/lib/brief'
import DECK from '@/lib/deck-slides.json'

export default function Admin() {
  const { state, setState, error, refresh } = useLiveState(2000, { admin: true })
  const storedKey = useBrowserValue(adminKey, '')
  const [key, setKey] = useState<string | null>(null)
  const [demoUrl, setDemoUrl] = useState<string | null>(null)
  const [appName, setAppName] = useState<string | null>(null)
  const [brief, setBrief] = useState('')
  const [msg, setMsg] = useState('')
  const [notice, setNotice] = useState('')
  const origin = useBrowserValue(() => window.location.origin, '')

  async function admin(body: Record<string, unknown>) {
    try { const r = await api<ClientState>('/api/admin', body, { admin: true }); setState(r); setMsg(''); setNotice(r.notice ?? '') } catch (e) { setNotice(''); setMsg(e instanceof Error ? e.message : 'error') }
  }

  if (!state) return <Wrap><p className="text-slate-400">{error ?? 'Loading…'}</p></Wrap>
  if (!state.admin) {
    return (
      <Wrap>
        <p className="text-slate-300">Enter the admin key (the ADMIN_KEY environment variable; running locally without it, <code>dev-key</code>).</p>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); localStorage.setItem('tct-admin-key', key ?? storedKey); refresh() }}>
          <input value={key ?? storedKey} onChange={(e) => setKey(e.target.value)} className="min-h-11 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3" placeholder="admin key" />
          <button className="rounded-lg bg-sky-500 px-4 font-semibold text-slate-950">Unlock</button>
        </form>
      </Wrap>
    )
  }

  const pending = state.submissions.filter((s) => s.status === 'pending')
  const byCat = (c: string, status?: string) => state.submissions.filter((s) => s.category === c && (!status || s.status === status))
  const build = winner(state, 'build').option
  const onBoard = new Set(byCat('feature').map((s) => s.text.toLowerCase()))
  const ideas = build.ideas ?? []
  const notAdded = ideas.filter((t) => !onBoard.has(t.toLowerCase()))
  const slide = Math.max(0, Math.min(DECK.length - 1, state.settings.slide ?? 0))

  return (
    <Wrap>
      {!state.redis && <p className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-200">In-memory storage: fine for local testing, <b>not</b> for the stage. Add Upstash Redis env vars on Vercel.</p>}
      {msg && <p className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">{msg}</p>}

      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-800 bg-slate-950/95 px-4 py-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => admin({ action: 'slide', to: Math.max(0, slide - 1) })} disabled={slide <= 0}
            className="min-h-14 rounded-xl border border-slate-700 px-4 text-lg font-bold disabled:opacity-40">◀ Back</button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500">Deck · slide {slide + 1} / {DECK.length}</p>
            <p className="truncate font-semibold">{DECK[slide] ?? '—'}</p>
            <p className="truncate text-xs text-slate-500">Next: {DECK[slide + 1] ?? 'end of deck'}</p>
          </div>
          <button type="button" onClick={() => admin({ action: 'slide', to: Math.min(DECK.length - 1, slide + 1) })} disabled={slide >= DECK.length - 1}
            className="min-h-14 rounded-xl bg-sky-500 px-4 text-lg font-bold text-slate-950 disabled:opacity-40">Next ▶</button>
        </div>
      </div>

      <Section title="Phase">
        <div className="flex flex-wrap gap-2">
          {PHASES.map((p) => (
            <button key={p} onClick={() => admin({ action: 'phase', phase: p })}
              className={`min-h-11 rounded-lg border px-4 font-semibold ${state.phase === p ? 'border-sky-400 bg-sky-500/20 text-sky-200' : 'border-slate-700'}`}>{PHASE_LABEL[p]}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Audience: <a className="underline" href="/" target="_blank">/</a> · Projector: <a className="underline" href="/screen" target="_blank">/screen</a> · Brief: <a className="underline" href="/api/brief" target="_blank">/api/brief</a></p>
      </Section>

      <Section title={`Moderation queue (${pending.length})`}>
        {pending.length === 0 && <p className="text-sm text-slate-500">Queue is empty.</p>}
        <ul className="grid gap-2">
          {pending.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
              <span className="mr-auto"><span className="mr-2 rounded bg-slate-800 px-1.5 text-xs uppercase text-slate-400">{s.category}</span>{s.text}</span>
              <Btn onClick={() => admin({ action: 'moderate', id: s.id, status: 'approved' })} tone="good">Approve</Btn>
              <Btn onClick={() => admin({ action: 'moderate', id: s.id, status: 'rejected', showcase: true })} tone="warn">Reject + show “not today”</Btn>
              <Btn onClick={() => admin({ action: 'moderate', id: s.id, status: 'rejected' })}>Reject quietly</Btn>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Suggested features${state.phase === 'requests' ? ` for ${build.label}` : ''}`}>
        {state.phase !== 'requests' ? (
          <p className="text-sm text-slate-500">In phase 2 this lists ready-made ideas for the winning app. Add them so the room has cards to upvote.</p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {notAdded.length > 0 && <Btn tone="good" onClick={() => admin({ action: 'seed', texts: notAdded })}>Add all ({notAdded.length})</Btn>}
              <span className="text-xs text-slate-500">Added ideas become approved cards with 0 votes; the audience upvotes them.</span>
            </div>
            <ul className="grid gap-2">
              {ideas.map((t) => (
                <li key={t} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <span className="mr-auto">{t}</span>
                  {onBoard.has(t.toLowerCase())
                    ? <span className="text-sm font-semibold text-emerald-300">✓ On the board</span>
                    : <Btn onClick={() => admin({ action: 'seed', texts: [t] })}>Add</Btn>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section title="Features — pick what goes in the build">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Btn onClick={() => admin({ action: 'selectTop', n: LIMITS.maxBuildFeatures })} tone="good">Select top {LIMITS.maxBuildFeatures} by votes</Btn>
          <span className="text-xs text-slate-500">Selected items are what Claude Code builds, in vote order.</span>
        </div>
        <List items={byCat('feature', 'approved')} render={(s) => (
          <>
            <Btn onClick={() => admin({ action: 'select', id: s.id, selected: !s.selected })} tone={s.selected ? 'good' : undefined}>{s.selected ? '✓ In build' : 'Add to build'}</Btn>
            <Btn onClick={() => admin({ action: 'moderate', id: s.id, status: 'rejected', showcase: true })} tone="warn">Reject</Btn>
          </>
        )} />
        <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">Rejected</p>
        <List items={byCat('feature', 'rejected')} render={(s) => (
          <>
            <span className="text-xs text-slate-500">{s.showcase ? 'on screen' : 'quiet'}</span>
            <Btn onClick={() => admin({ action: 'moderate', id: s.id, status: 'approved' })}>Un-reject</Btn>
          </>
        )} />
      </Section>

      <Section title="App name">
        <List items={byCat('name', 'approved')} render={(s) => <Btn onClick={() => admin({ action: 'moderate', id: s.id, status: 'rejected', showcase: true })} tone="warn">Reject</Btn>} />
        <label className="mt-3 block text-sm text-slate-400">Override (leave blank to use the top-voted name)</label>
        <div className="mt-1 flex gap-2">
          <input value={appName ?? state.settings.appName} onChange={(e) => setAppName(e.target.value)} className="min-h-11 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3" />
          <Btn onClick={() => admin({ action: 'settings', appName: appName ?? state.settings.appName }).then(() => setAppName(null))}>Save</Btn>
        </div>
      </Section>

      <Section title="Overrides & demo URL">
        {POLLS.map((p) => (
          <div key={p.id} className="mb-2 flex items-center gap-2">
            <span className="w-40 text-sm text-slate-400">{p.question}</span>
            <select value={state.settings.overrides[p.id] ?? ''} onChange={(e) => admin({ action: 'settings', overrides: { [p.id]: e.target.value } })}
              className="min-h-11 rounded-lg border border-slate-700 bg-slate-900 px-3">
              <option value="">Audience winner</option>
              {p.options.map((o) => <option key={o.id} value={o.id}>{o.label} (override)</option>)}
            </select>
            <span className="text-xs text-slate-500">{Object.entries(state.polls[p.id] ?? {}).map(([k, v]) => `${k}:${v}`).join(' · ')}</span>
          </div>
        ))}
        <label className="mt-3 block text-sm text-slate-400">Deployed app URL (shown with a QR in phase 4)</label>
        <div className="mt-1 flex gap-2">
          <input value={demoUrl ?? state.settings.demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://your-demo-app.vercel.app" className="min-h-11 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3" />
          <Btn onClick={() => admin({ action: 'settings', demoUrl: demoUrl ?? state.settings.demoUrl }).then(() => setDemoUrl(null))}>Save</Btn>
        </div>
      </Section>

      <Section title="Brief for Claude Code">
        <div className="flex flex-wrap gap-2">
          <Btn tone="good" onClick={async () => { const t = await (await fetch('/api/brief', { cache: 'no-store' })).text(); setBrief(t); await navigator.clipboard?.writeText(t).catch(() => {}); setMsg('') }}>Preview + copy brief</Btn>
          <span className="self-center text-xs text-slate-500">or on the laptop: <code>./scripts/brief.sh {origin}</code></span>
        </div>
        {brief && <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs">{brief}</pre>}
      </Section>

      <Section title="Reset for a new run">
        <div className="flex flex-wrap gap-2">
          <Btn tone="warn" onClick={() => { if (prompt(`Type RESET to wipe all votes and cards${state.demoHook ? ' and put the demo app back to "Nothing here yet"' : ''}. Forced winners and the app-name override are cleared; the demo URL is kept.`) === 'RESET') admin({ action: 'reset', confirm: 'RESET', resetDemo: true }) }}>Reset everything</Btn>
          <Btn onClick={() => { if (confirm('Put the demo app back to "Nothing here yet"? It takes about a minute.')) admin({ action: 'resetDemo' }) }}>Reset demo app only</Btn>
        </div>
        <p className="mt-2 text-xs text-slate-500">{state.demoHook
          ? 'Demo app reset is connected: it redeploys the empty page from GitHub main in about a minute.'
          : 'Demo app reset is not connected yet: add DEMO_DEPLOY_HOOK_URL (a Vercel deploy hook for your demo app project, branch main) to this project, then redeploy.'}</p>
        {notice && <p className="mt-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>}
        <p className="mt-2 text-xs text-slate-500">Categories: {CATEGORIES.map((c) => `${c.id} (max ${c.maxPerPerson}/person)`).join(', ')}</p>
      </Section>
    </Wrap>
  )
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-4xl px-4 py-8"><h1 className="mb-6 text-2xl font-bold">Moderator console</h1>{children}</main>
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-8 rounded-2xl border border-slate-800 p-4"><h2 className="mb-3 text-lg font-semibold">{title}</h2>{children}</section>
}
function Btn({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone?: 'good' | 'warn' }) {
  const c = tone === 'good' ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200' : tone === 'warn' ? 'border-amber-500/60 bg-amber-500/10 text-amber-200' : 'border-slate-700'
  return <button type="button" onClick={onClick} className={`min-h-10 rounded-lg border px-3 text-sm font-semibold ${c}`}>{children}</button>
}
function List({ items, render }: { items: PublicSubmission[]; render: (s: PublicSubmission) => React.ReactNode }) {
  if (items.length === 0) return <p className="text-sm text-slate-500">None.</p>
  return (
    <ul className="grid gap-2">
      {items.map((s) => (
        <li key={s.id} className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 ${s.selected ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-slate-800 bg-slate-900'}`}>
          <span className="w-14 font-bold tabular-nums text-sky-300">▲ {s.votes}</span>
          <span className="mr-auto">{s.text}</span>
          {render(s)}
        </li>
      ))}
    </ul>
  )
}
