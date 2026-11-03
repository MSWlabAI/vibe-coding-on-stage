import { CATEGORIES, EVENT, POLLS } from './config'
import type { PublicState } from './store'

export function winner(state: PublicState, pollId: string) {
  const poll = POLLS.find((p) => p.id === pollId)!
  const counts = state.polls[pollId] ?? {}
  const override = state.settings.overrides[pollId]
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const sorted = [...poll.options].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
  const chosen = override ? poll.options.find((o) => o.id === override) ?? sorted[0] : sorted[0]
  return { option: chosen, votes: counts[chosen.id] ?? 0, total, overridden: Boolean(override) }
}

export function buildBrief(state: PublicState): string {
  const build = winner(state, 'build')
  const theme = winner(state, 'theme')
  const subs = state.submissions
  const selected = subs.filter((s) => s.category === 'feature' && s.selected).sort((a, b) => b.votes - a.votes)
  const rejected = subs.filter((s) => s.category === 'feature' && s.status === 'rejected' && s.showcase)
  const names = subs.filter((s) => s.category === 'name' && s.status === 'approved').sort((a, b) => b.votes - a.votes)
  const nameOverride = state.settings.appName?.trim()
  const appName = nameOverride || names[0]?.text || EVENT.defaultAppName
  const pct = (v: number, t: number) => (t ? Math.round((100 * v) / t) : 0)

  const lines: string[] = []
  lines.push(`# Audience brief — ${EVENT.title}`)
  lines.push(`Generated ${new Date().toISOString()} from ${build.total} votes and ${subs.length} audience submissions.`)
  lines.push('')
  lines.push('## Build this')
  lines.push(`**${build.option.label}** (${pct(build.votes, build.total)}% of ${build.total} votes${build.overridden ? ', moderator override' : ''})`)
  lines.push('')
  lines.push(build.option.spec)
  lines.push('')
  lines.push('## App name (show this in the header)')
  lines.push(`"${appName}"${names[0] && !nameOverride ? ` — audience pick, ${names[0].votes} upvotes` : ''}`)
  lines.push('')
  lines.push('## Theme')
  lines.push(`${theme.option.label}: ${theme.option.spec}`)
  lines.push('')
  lines.push('## Features, in priority order (build these, in this order)')
  if (selected.length === 0) lines.push('(none selected yet)')
  selected.forEach((s, i) => lines.push(`${i + 1}. ${s.text} (${s.votes} upvotes)`))
  if (selected.length) {
    lines.push('')
    lines.push(
      'Every feature above must ship in some visible, working form. The audience is watching for it. ' +
        'If one cannot be built literally under CLAUDE.md (no network, no new dependencies, frozen clinical text), ' +
        'build the closest version that fits and label it on screen. A picture, diagram or illustration: draw a simple ' +
        'inline SVG in its own component (no image files, no internet images, no AI image generation), captioned ' +
        '"Illustration". A number or handout sentence that is not in src/clinical/: show a visible note saying it is ' +
        'not in the vetted content yet. Never skip a feature silently.',
    )
  }
  lines.push('')
  if (rejected.length) {
    lines.push('## Rejected by the moderator (do NOT build)')
    rejected.forEach((s) => lines.push(`- ${s.text}`))
    lines.push('')
  }
  lines.push('## Always')
  lines.push('- Mobile first, large tap targets, instant updates, no backend, no new dependencies.')
  lines.push('- Footer on every screen: "Educational tool, not medical advice." with the sources of every clinical number.')
  lines.push('- Run `npm run check` before reporting done.')
  lines.push('- When you report done, list each feature above with one line on how you built it.')
  lines.push('')
  lines.push(`_Submission categories: ${CATEGORIES.map((c) => c.id).join(', ')}._`)
  return lines.join('\n')
}
