// postMessage bridge between the React shell and the game page in the iframe (same origin only).
export interface GameMeta { version: string; hasCareer: boolean; lvl: number; ovr: number; goals: number; trophies: number; fans: number; day: number; season: number; club: string; last: number; lang: string; cards: number }

type Listener = (type: string, msg: Record<string, unknown>) => void

export class GameBridge {
  private frame: HTMLIFrameElement | null = null
  private seq = 0
  private waiting = new Map<number, (m: Record<string, unknown>) => void>()
  private listeners = new Set<Listener>()
  ready = false
  meta: GameMeta | null = null

  constructor() { window.addEventListener('message', this.onMessage) }
  dispose() { window.removeEventListener('message', this.onMessage) }
  attach(frame: HTMLIFrameElement | null) {
    if (!frame || frame === this.frame) return // React calls ref callbacks with null between renders
    this.frame = frame
    this.ready = false
  }
  /** the iframe navigated (e.g. the game reloads after importing a save) */
  reloading() { this.ready = false }
  on(fn: Listener) { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }

  private onMessage = (e: MessageEvent) => {
    if (e.origin !== window.location.origin || !this.frame || e.source !== this.frame.contentWindow) return
    const m = e.data as Record<string, unknown>
    if (!m || m.src !== 'lfc-game' || typeof m.type !== 'string') return
    if (m.meta) this.meta = m.meta as GameMeta
    if (m.type === 'ready') this.ready = true
    const rid = typeof m.rid === 'number' ? m.rid : -1
    const w = this.waiting.get(rid)
    if (w) { this.waiting.delete(rid); w(m) }
    this.listeners.forEach((fn) => fn(m.type as string, m))
  }

  private send(type: string, extra: Record<string, unknown> = {}, expect = true, timeout = 5000): Promise<Record<string, unknown>> {
    const win = this.frame?.contentWindow
    if (!win) return Promise.reject(new Error('game not loaded'))
    const rid = ++this.seq
    win.postMessage({ src: 'lfc-shell', type, rid, ...extra }, window.location.origin)
    if (!expect) return Promise.resolve({})
    return new Promise((resolve, reject) => {
      const t = window.setTimeout(() => { this.waiting.delete(rid); reject(new Error('game did not answer')) }, timeout)
      this.waiting.set(rid, (m) => { window.clearTimeout(t); m.type === 'error' ? reject(new Error(String(m.message))) : resolve(m) })
    })
  }

  async exportSave(): Promise<{ data: Record<string, unknown>; meta: GameMeta }> {
    const m = await this.send('export')
    return { data: m.data as Record<string, unknown>, meta: m.meta as GameMeta }
  }
  async importSave(data: Record<string, unknown>) { await this.send('import', { data }); this.ready = false }
  setLang(lang: 'he' | 'en') { void this.send('lang', { lang }, false) }
  /** what the server says about payments and ownership; the game replaces its owned items with this list */
  sendStore(state: { enabled: boolean; mode: string | null; signed: boolean; ids?: string[]; orders?: unknown[] }) { void this.send('store', state, false).catch(() => undefined) }
  focus() { this.frame?.focus(); void this.send('focus', {}, false).catch(() => undefined) }
}
