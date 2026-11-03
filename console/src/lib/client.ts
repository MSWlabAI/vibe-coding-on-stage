'use client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { PublicState } from './store'

export type ClientState = PublicState & { admin: boolean; redis: boolean; demoHook?: boolean; notice?: string }

export function anonId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem('tct-anon')
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, '')
      localStorage.setItem('tct-anon', id)
    }
    return id
  } catch {
    return 'nostorage-' + Math.random().toString(36).slice(2, 12)
  }
}

export function adminKey(): string {
  if (typeof window === 'undefined') return ''
  try {
    const fromUrl = new URLSearchParams(location.search).get('key')
    if (fromUrl) localStorage.setItem('tct-admin-key', fromUrl)
    return localStorage.getItem('tct-admin-key') ?? ''
  } catch {
    return ''
  }
}

export async function api<T = ClientState>(path: string, body?: unknown, opts: { admin?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-anon': anonId() }
  if (opts.admin) headers['x-admin-key'] = adminKey()
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(path, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

/** Polls /api/state every `ms` while the tab is visible. */
export function useLiveState(ms: number, opts: { admin?: boolean } = {}) {
  const [state, setState] = useState<ClientState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refresh = useCallback(async () => {
    try {
      const s = await api<ClientState>('/api/state', undefined, opts)
      setState(s)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'offline')
    }
  }, [opts.admin]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let stopped = false
    const loop = async () => {
      if (stopped) return
      if (document.visibilityState === 'visible') await refresh()
      timer.current = setTimeout(loop, ms)
    }
    loop()
    const onVis = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVis)
    return () => { stopped = true; if (timer.current) clearTimeout(timer.current); document.removeEventListener('visibilitychange', onVis) }
  }, [ms, refresh])
  return { state, setState, error, refresh }
}

const noopSubscribe = () => () => {}
/** Browser-only value that renders as `fallback` on the server (no hydration mismatch, no effect). */
export function useBrowserValue<T>(get: () => T, fallback: T): T {
  return useSyncExternalStore(noopSubscribe, get, () => fallback)
}
