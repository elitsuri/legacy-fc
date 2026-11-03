// Pure decision logic for cloud sync (unit tested in sync.test.ts).
export type SyncAction = 'none' | 'upload' | 'download' | 'conflict'

export interface SyncInput {
  localHasCareer: boolean
  /** cloud version this device last synced with (null = never synced on this device) */
  knownVersion: number | null
  /** current cloud version (null = no cloud save yet) */
  cloudVersion: number | null
  /** true when the local save changed since the last successful sync */
  localDirty: boolean
}

export function decideSync(i: SyncInput): SyncAction {
  if (i.cloudVersion === null) return i.localHasCareer ? 'upload' : 'none'
  if (!i.localHasCareer) return 'download'
  if (i.knownVersion === i.cloudVersion) return i.localDirty ? 'upload' : 'none'
  // The cloud moved on (another device) or this device never synced: never overwrite silently.
  if (i.knownVersion !== null && i.knownVersion > i.cloudVersion) return 'conflict'
  return i.localDirty || i.knownVersion === null ? 'conflict' : 'download'
}

const KV = (uid: number) => `lfc_cv_${uid}`
export function loadKnownVersion(uid: number): number | null {
  try { const v = localStorage.getItem(KV(uid)); return v === null ? null : Number(v) } catch { return null }
}
export function storeKnownVersion(uid: number, v: number | null) {
  try { if (v === null) localStorage.removeItem(KV(uid)); else localStorage.setItem(KV(uid), String(v)) } catch { /* ignore */ }
}
