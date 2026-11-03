'use client'
import { EVENT, LIMITS, PHASE_LABEL, POLLS, stageCommands } from '@/lib/config'
import { winner } from '@/lib/brief'
import { useBrowserValue, useLiveState } from '@/lib/client'
import { Bars } from '@/components/Bars'
import { Qr } from '@/components/Qr'
import { CopyCommand } from '@/components/CopyCommand'

export default function Screen() {
  const { state } = useLiveState(1500)
  const origin = useBrowserValue(() => window.location.origin, '')
  const commands = stageCommands(origin)

  if (!state) return <main className="grid min-h-dvh place-items-center text-3xl text-slate-400">Connecting…</main>
  const { phase } = state
  const features = state.submissions.filter((s) => s.category === 'feature' && s.status === 'approved')
  const selected = state.submissions.filter((s) => s.category === 'feature' && s.selected)
  const names = state.submissions.filter((s) => s.category === 'name' && s.status === 'approved')
  const notToday = state.submissions.filter((s) => s.status === 'rejected' && s.showcase)
  const appName = state.settings.appName || names[0]?.text || EVENT.defaultAppName
  const build = winner(state, 'build')
  const joinUrl = origin

  return (
    <main className="min-h-dvh px-12 py-10">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xl uppercase tracking-[0.3em] text-sky-400">{EVENT.title}</p>
          <h1 className="mt-2 text-6xl font-bold leading-none">{PHASE_LABEL[phase]}</h1>
        </div>
        {phase !== 'live' && (
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-3xl font-semibold">Scan to join</p>
              <p className="text-xl text-slate-400">{joinUrl.replace(/^https?:\/\//, '')}</p>
            </div>
            <Qr text={joinUrl} size={180} />
          </div>
        )}
      </header>

      {phase === 'vote' && (
        <div className="mt-10 grid grid-cols-2 gap-12">
          {POLLS.map((p) => (
            <section key={p.id}>
              <h2 className="mb-5 text-4xl font-semibold">{p.question}</h2>
              <Bars poll={p} counts={state.polls[p.id] ?? {}} big />
            </section>
          ))}
        </div>
      )}

      {phase === 'requests' && (
        <div className="mt-6 grid grid-cols-5 gap-10 2xl:mt-8">
          <section className="col-span-2">
            <h2 className="text-2xl uppercase tracking-wider text-slate-500">We are building</h2>
            <p className="mt-1 text-4xl font-bold leading-tight 2xl:text-5xl">{build.option.label}</p>
            <h2 className="mt-6 text-2xl uppercase tracking-wider text-slate-500">Starting prompt for Claude Code</h2>
            <blockquote className="mt-3 rounded-2xl border border-sky-500/40 bg-slate-900/70 p-6 text-[20px] leading-snug text-slate-100 2xl:text-[22px]">{build.option.spec}</blockquote>
            <p className="mt-4 text-2xl text-sky-300">Your top {LIMITS.maxBuildFeatures} feature requests get added to this.</p>
          </section>
          <section className="col-span-3">
            <h2 className="mb-4 text-4xl font-semibold">Top feature requests <span className="text-2xl text-slate-500">({features.length} approved, {state.pendingCount} in queue)</span></h2>
            <ol className="grid gap-3">
              {features.slice(0, 6).map((s, i) => (
                <li key={s.id} className={`flex items-center gap-5 rounded-2xl border px-6 py-3 ${s.selected ? 'border-emerald-500/70 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/60'}`}>
                  <span className="w-10 text-3xl font-bold text-slate-500">{i + 1}</span>
                  <span className="flex-1 text-3xl leading-tight">{s.text}</span>
                  <span className="text-4xl font-bold tabular-nums text-sky-300">▲ {s.votes}</span>
                </li>
              ))}
              {features.length === 0 && <li className="text-3xl text-slate-500">Waiting for the first approved request…</li>}
            </ol>
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <h2 className="mb-3 text-3xl font-semibold">Name the app</h2>
                <ol className="grid gap-2">
                  {names.slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-2">
                      <span className="text-2xl">{s.text}</span><span className="text-2xl font-bold text-sky-300">▲ {s.votes}</span>
                    </li>
                  ))}
                  {names.length === 0 && <li className="text-2xl text-slate-500">No names yet…</li>}
                </ol>
              </div>
              {notToday.length > 0 && (
                <div>
                  <h2 className="mb-3 text-3xl font-semibold text-slate-400">Not today 😅</h2>
                  <ul className="grid gap-2 text-2xl text-slate-500">{notToday.slice(0, 3).map((s) => <li key={s.id}>“{s.text}”</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {phase === 'locked' && (
        <div className="mt-10 grid grid-cols-2 gap-12">
          <section>
            <h2 className="text-3xl uppercase tracking-wider text-slate-500">We are building</h2>
            {POLLS.map((p) => {
              const counts = state.polls[p.id] ?? {}
              const override = state.settings.overrides[p.id]
              const top = override ? p.options.find((o) => o.id === override)! : [...p.options].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))[0]
              return <p key={p.id} className="mt-3 text-5xl font-bold">{top.label}</p>
            })}
            <h2 className="mt-10 text-3xl uppercase tracking-wider text-slate-500">Called</h2>
            <p className="mt-3 text-5xl font-bold text-sky-300">“{appName}”</p>
          </section>
          <section>
            <h2 className="text-3xl uppercase tracking-wider text-slate-500">With these features</h2>
            <ol className="mt-4 grid gap-4">
              {selected.map((s, i) => <li key={s.id} className="text-4xl"><span className="mr-4 text-slate-500">{i + 1}.</span>{s.text}</li>)}
            </ol>
            {notToday.length > 0 && (
              <>
                <h2 className="mt-10 text-3xl uppercase tracking-wider text-slate-500">Not today 😅</h2>
                <ul className="mt-3 grid gap-2 text-2xl text-slate-500">{notToday.slice(0, 4).map((s) => <li key={s.id}>“{s.text}”</li>)}</ul>
              </>
            )}
          </section>
          <div className="col-span-2 grid grid-cols-2 gap-8">
            <CopyCommand label="1 · Start the build" command={commands.build} />
            <CopyCommand label="2 · When Claude says done: type /exit, then" command={commands.deploy} />
          </div>
        </div>
      )}

      {phase === 'live' && (
        <div className="mt-12 grid grid-cols-2 items-center gap-12">
          <div>
            <p className="text-4xl text-slate-400">You wrote the brief. It is deployed.</p>
            <p className="mt-6 text-7xl font-bold leading-tight text-sky-300">“{appName}”</p>
            <p className="mt-8 text-4xl text-slate-300">{state.settings.demoUrl.replace(/^https?:\/\//, '') || 'Set the demo URL in /admin'}</p>
            <ol className="mt-8 grid gap-2 text-3xl text-slate-400">{selected.map((s) => <li key={s.id}>✓ {s.text}</li>)}</ol>
          </div>
          <div className="justify-self-center">{state.settings.demoUrl && <Qr text={state.settings.demoUrl} size={480} />}</div>
        </div>
      )}
    </main>
  )
}
