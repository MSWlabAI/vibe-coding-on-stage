'use client'
import { useState } from 'react'
import { CATEGORIES, EVENT, LIMITS, PHASE_LABEL, POLLS } from '@/lib/config'
import { api, useLiveState, type ClientState } from '@/lib/client'
import type { PublicSubmission } from '@/lib/store'
import { Bars } from '@/components/Bars'
import { winner } from '@/lib/brief'

export default function Audience() {
  const { state, setState, error } = useLiveState(2500)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function say(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2200) }
  async function act(fn: () => Promise<ClientState>) {
    setBusy(true)
    try { setState(await fn()) } catch (e) { say(e instanceof Error ? e.message : 'Something went wrong') } finally { setBusy(false) }
  }

  if (!state) {
    return <Shell><p className="text-slate-400">{error ? `Can't reach the console (${error}). Retrying…` : 'Loading…'}</p></Shell>
  }

  const { phase } = state
  return (
    <Shell phaseLabel={PHASE_LABEL[phase]}>
      {toast && <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg pop">{toast}</div>}

      {phase === 'vote' && (
        <>
          <Intro>Two quick votes. Tap to choose; tap again to change your mind. Results update live on the big screen.</Intro>
          {POLLS.map((p) => (
            <section key={p.id} className="mt-6">
              <h2 className="mb-3 text-xl font-bold">{p.question}</h2>
              <Bars poll={p} counts={state.polls[p.id] ?? {}} mine={state.myVotes[p.id]} disabled={busy}
                onPick={(optionId) => act(() => api('/api/vote', { pollId: p.id, optionId }))} />
            </section>
          ))}
        </>
      )}

      {phase === 'requests' && (
        <>
          <Intro>Voting is closed. Now tell us what the app should do. The moderator approves cards, then everyone upvotes. Top-voted features go into the brief.</Intro>
          <ResultsStrip state={state} />
          <details className="mt-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <summary className="cursor-pointer py-1 text-base font-semibold text-sky-300">Read the starting prompt</summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{winner(state, 'build').option.spec}</p>
            <p className="mt-2 text-sm text-slate-400">The top {LIMITS.maxBuildFeatures} feature requests get added to this.</p>
          </details>
          {CATEGORIES.map((c) => (
            <SubmitSection key={c.id} cat={c} state={state} busy={busy} act={act} />
          ))}
        </>
      )}

      {(phase === 'locked' || phase === 'live') && (
        <>
          {phase === 'live' && state.settings.demoUrl ? (
            <a href={state.settings.demoUrl} target="_blank" rel="noreferrer"
              className="block rounded-2xl bg-sky-500 p-5 text-center text-xl font-bold text-slate-950 shadow-lg pop">
              Open the app you just built →
              <span className="mt-1 block text-sm font-medium opacity-80">{state.settings.demoUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          ) : (
            <Intro>The brief is locked. Watch the screen: Claude Code is building it now.</Intro>
          )}
          <ResultsStrip state={state} />
          <BriefSummary state={state} />
        </>
      )}
    </Shell>
  )
}

function Shell({ children, phaseLabel }: { children: React.ReactNode; phaseLabel?: string }) {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
      <p className="text-xs uppercase tracking-[0.25em] text-sky-400">{EVENT.title}</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">{phaseLabel ?? 'Welcome'}</h1>
      {children}
      <footer className="mt-10 text-center text-xs text-slate-500">Anonymous. Nothing is stored except your taps.</footer>
    </main>
  )
}

function Intro({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-base text-slate-300">{children}</p>
}

function ResultsStrip({ state }: { state: ClientState }) {
  return (
    <div className="mt-5 grid gap-2">
      {POLLS.map((p) => {
        const counts = state.polls[p.id] ?? {}
        const override = state.settings.overrides[p.id]
        const top = override
          ? p.options.find((o) => o.id === override)!
          : [...p.options].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))[0]
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        const pct = total ? Math.round((100 * (counts[top.id] ?? 0)) / total) : 0
        return (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <span className="text-sm text-slate-400">{p.question}</span>
            <span className="text-right font-semibold">{top.label} <span className="text-sky-300">{override ? '' : `${pct}%`}</span></span>
          </div>
        )
      })}
    </div>
  )
}

function SubmitSection({ cat, state, busy, act }: {
  cat: (typeof CATEGORIES)[number]
  state: ClientState
  busy: boolean
  act: (fn: () => Promise<ClientState>) => Promise<void>
}) {
  const [text, setText] = useState('')
  const items = state.submissions.filter((s) => s.category === cat.id)
  const mineCount = items.filter((s) => s.mine).length
  const canSubmit = mineCount < cat.maxPerPerson
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">{cat.title}</h2>
      <p className="mt-1 text-sm text-slate-400">{cat.prompt}</p>
      {canSubmit ? (
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; act(() => api('/api/submit', { category: cat.id, text })).then(() => setText('')) }}>
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.textMax} placeholder={cat.placeholder}
            className="min-h-12 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 text-base outline-none focus:border-sky-400" />
          <button type="submit" disabled={busy || text.trim().length < LIMITS.textMin}
            className="min-h-12 rounded-xl bg-sky-500 px-4 font-semibold text-slate-950 disabled:opacity-50">Send</button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-sky-300">You sent {cat.maxPerPerson} — thank you. Upvote the others.</p>
      )}
      <ul className="mt-4 grid gap-2">
        {items.length === 0 && <li className="text-sm text-slate-500">Nothing yet. Be first.</li>}
        {items.map((s) => <Card key={s.id} s={s} busy={busy} onUpvote={() => act(() => api('/api/upvote', { id: s.id }))} />)}
      </ul>
    </section>
  )
}

function Card({ s, busy, onUpvote }: { s: PublicSubmission; busy: boolean; onUpvote: () => void }) {
  const pending = s.status === 'pending'
  const rejected = s.status === 'rejected'
  return (
    <li className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${s.selected ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-slate-800 bg-slate-900'} ${pending || rejected ? 'opacity-70' : ''}`}>
      <button type="button" onClick={onUpvote} disabled={busy || s.status !== 'approved'} aria-label="Upvote"
        className={`flex min-h-11 min-w-12 flex-col items-center justify-center rounded-lg border text-sm font-bold tabular-nums ${s.upvoted ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'border-slate-700 text-slate-300'} disabled:opacity-50`}>
        <span>▲</span><span>{s.votes}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-base leading-snug">{s.text}</p>
        <p className="text-xs text-slate-500">
          {pending && 'Awaiting moderator'}
          {rejected && (s.showcase ? 'Not today 😅' : 'Not this time')}
          {s.selected && 'In the build ✓'}
          {s.mine && !pending && !rejected && !s.selected && 'Yours'}
        </p>
      </div>
    </li>
  )
}

function BriefSummary({ state }: { state: ClientState }) {
  const selected = state.submissions.filter((s) => s.category === 'feature' && s.selected)
  const rejected = state.submissions.filter((s) => s.category === 'feature' && s.status === 'rejected' && s.showcase)
  const names = state.submissions.filter((s) => s.category === 'name' && s.status === 'approved')
  const appName = state.settings.appName || names[0]?.text || EVENT.defaultAppName
  return (
    <div className="mt-6 grid gap-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">App name</p>
        <p className="text-xl font-bold">{appName}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">Building these features</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {selected.length === 0 && <li className="list-none text-slate-500">Moderator is picking…</li>}
          {selected.map((s) => <li key={s.id}>{s.text} <span className="text-slate-500">({s.votes})</span></li>)}
        </ol>
      </div>
      {rejected.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Not today</p>
          <ul className="mt-2 space-y-1 text-slate-400">{rejected.map((s) => <li key={s.id}>{s.text}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
