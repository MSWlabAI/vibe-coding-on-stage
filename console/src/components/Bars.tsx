import type { Poll } from '@/lib/config'

export function Bars({ poll, counts, mine, big = false, onPick, disabled }: {
  poll: Poll
  counts: Record<string, number>
  mine?: string
  big?: boolean
  onPick?: (optionId: string) => void
  disabled?: boolean
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const max = Math.max(1, ...Object.values(counts))
  return (
    <div className="grid gap-3">
      {poll.options.map((o) => {
        const n = counts[o.id] ?? 0
        const pct = total ? Math.round((100 * n) / total) : 0
        const picked = mine === o.id
        const inner = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`${big ? 'text-3xl' : 'text-lg'} font-semibold leading-tight`}>{o.label}{picked && <span className="ml-2 text-sky-400">✓</span>}</span>
              <span className={`${big ? 'text-3xl' : 'text-base'} tabular-nums font-bold text-sky-300`}>{pct}%</span>
            </div>
            {!big && <p className="mt-0.5 text-sm text-slate-400">{o.blurb}</p>}
            <div className={`mt-2 ${big ? 'h-6' : 'h-2.5'} w-full overflow-hidden rounded-full bg-slate-800`}>
              <div className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${(100 * n) / max}%` }} />
            </div>
          </>
        )
        return onPick ? (
          <button key={o.id} type="button" disabled={disabled} onClick={() => onPick(o.id)}
            className={`rounded-2xl border p-4 text-left transition active:scale-[0.99] disabled:opacity-60 ${picked ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-900'}`}>
            {inner}
          </button>
        ) : (
          <div key={o.id} className={`rounded-2xl border p-4 ${big ? 'border-slate-800 bg-slate-900/60' : 'border-slate-800 bg-slate-900'}`}>{inner}</div>
        )
      })}
      <p className={`text-right ${big ? 'text-xl' : 'text-xs'} text-slate-400`}>{total} vote{total === 1 ? '' : 's'}</p>
    </div>
  )
}
