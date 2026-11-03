import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError, type CloudSave, type User } from './api'
import type { GameBridge, GameMeta } from './bridge'
import { fingerprint } from './hash'
import { decideSync, loadKnownVersion, storeKnownVersion } from './sync'

export type SyncStatus = 'guest' | 'idle' | 'syncing' | 'synced' | 'pending' | 'offline' | 'no-career' | 'conflict'
export interface Conflict { cloud: CloudSave; local: GameMeta }

const HK = (uid: number) => `lfc_fp_${uid}`
const loadFp = (uid: number) => { try { return localStorage.getItem(HK(uid)) } catch { return null } }
const storeFp = (uid: number, fp: string) => { try { localStorage.setItem(HK(uid), fp) } catch { /* ignore */ } }

export function useCloudSync(bridge: GameBridge, user: User | null) {
  const [status, setStatus] = useState<SyncStatus>(user ? 'idle' : 'guest')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const cloudVersion = useRef<number | null | undefined>(undefined) // undefined = not fetched this session
  const busy = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const userRef = useRef(user)
  userRef.current = user

  useEffect(() => { cloudVersion.current = undefined; setConflict(null); setStatus(user ? 'idle' : 'guest') }, [user?.id])

  const fetchCloud = async (): Promise<CloudSave | null> => {
    try { const c = await api.getSave(1); cloudVersion.current = c.version; return c } catch (e) {
      if (e instanceof ApiError && e.status === 404) { cloudVersion.current = null; return null }
      throw e
    }
  }

  const syncNow = useCallback(async (opts: { keepalive?: boolean } = {}) => {
    const u = userRef.current
    if (!u || busy.current || !bridge.ready) return
    busy.current = true
    setStatus('syncing')
    try {
      const { data, meta } = await bridge.exportSave()
      if (!meta.hasCareer && cloudVersion.current === null) { setStatus('no-career'); return }
      const fp = fingerprint(data)
      const dirty = fp !== loadFp(u.id)
      let cloud: CloudSave | null = null
      if (cloudVersion.current === undefined || (!meta.hasCareer)) cloud = await fetchCloud()
      const action = decideSync({ localHasCareer: meta.hasCareer, knownVersion: loadKnownVersion(u.id), cloudVersion: cloudVersion.current ?? null, localDirty: dirty })
      if (action === 'none') { setStatus('synced'); setLastSync(new Date()); return }
      if (action === 'upload') {
        try {
          const known = cloudVersion.current === null ? null : loadKnownVersion(u.id)
          const r = await api.putSave(data, known, false, 1, !!opts.keepalive)
          cloudVersion.current = r.version
          storeKnownVersion(u.id, r.version)
          storeFp(u.id, fp)
          setStatus('synced'); setLastSync(new Date())
        } catch (e) {
          if (e instanceof ApiError && e.status === 409) {
            const c = await fetchCloud()
            if (c) { setConflict({ cloud: c, local: meta }); setStatus('conflict') }
            return
          }
          throw e
        }
        return
      }
      if (!cloud) cloud = await fetchCloud()
      if (!cloud) { setStatus('idle'); return }
      if (action === 'download') {
        storeKnownVersion(u.id, cloud.version)
        storeFp(u.id, fingerprint(cloud.data))
        await bridge.importSave(cloud.data) // the game reloads itself with the cloud career
        setStatus('synced'); setLastSync(new Date())
        return
      }
      setConflict({ cloud, local: meta }); setStatus('conflict')
    } catch (e) {
      setStatus(e instanceof ApiError && e.status === 0 ? 'offline' : 'pending')
      if (e instanceof ApiError && e.status === 401) setStatus('guest')
    } finally {
      busy.current = false
    }
  }, [bridge])

  const resolveConflict = useCallback(async (keep: 'cloud' | 'device') => {
    const u = userRef.current
    const c = conflict
    if (!u || !c) return
    setConflict(null)
    if (keep === 'cloud') {
      storeKnownVersion(u.id, c.cloud.version)
      storeFp(u.id, fingerprint(c.cloud.data))
      await bridge.importSave(c.cloud.data)
      setStatus('synced'); setLastSync(new Date())
    } else {
      const { data } = await bridge.exportSave()
      const r = await api.putSave(data, c.cloud.version, true)
      cloudVersion.current = r.version
      storeKnownVersion(u.id, r.version)
      storeFp(u.id, fingerprint(data))
      setStatus('synced'); setLastSync(new Date())
    }
  }, [bridge, conflict])

  // game events: sync shortly after the game saves; full check when the game (re)loads
  useEffect(() => bridge.on((type) => {
    if (!userRef.current) return
    if (type === 'ready') { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void syncNow(), 800) }
    if (type === 'saved') {
      setStatus((s) => (s === 'conflict' || s === 'syncing' ? s : 'pending'))
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void syncNow(), 15000)
    }
  }), [bridge, syncNow])

  useEffect(() => {
    if (!user) return
    if (bridge.ready) void syncNow()
    const iv = window.setInterval(() => void syncNow(), 90000)
    const vis = () => { if (document.visibilityState === 'hidden') void syncNow({ keepalive: true }) }
    document.addEventListener('visibilitychange', vis)
    return () => { window.clearInterval(iv); document.removeEventListener('visibilitychange', vis) }
  }, [user?.id, bridge, syncNow])

  return { status, lastSync, conflict, syncNow, resolveConflict, setStatus }
}
