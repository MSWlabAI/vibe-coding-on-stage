'use client'
import { useState } from 'react'

/** A command shown on the projector with a big Copy button, for pasting into the presenter's terminal. */
export function CopyCommand({ label, command }: { label: string; command: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      // Fallback for browsers that block the async clipboard API.
      const t = document.createElement('textarea')
      t.value = command
      t.style.position = 'fixed'
      t.style.opacity = '0'
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
      <p className="text-2xl font-semibold text-slate-300">{label}</p>
      <div className="mt-3 flex items-start gap-4">
        <code className="flex-1 break-words font-mono text-xl leading-snug text-emerald-300">{command}</code>
        <button type="button" onClick={copy}
          className={`min-h-[56px] shrink-0 rounded-xl px-6 text-2xl font-bold ${copied ? 'bg-emerald-500 text-slate-950' : 'bg-sky-500 text-slate-950 hover:bg-sky-400'}`}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
