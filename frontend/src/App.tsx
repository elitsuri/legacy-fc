import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { api, ApiError, getToken, setToken, type BackupMeta, type CloudSave, type Entitlements, type GoogleInfo, type LeaderRow, type OrderRow, type PaymentsInfo, type User } from './api'
import { GameBridge } from './bridge'
import { FriendsPanel } from './FriendsPanel'
import { GoogleButton } from './GoogleButton'
import { initialLang, tr, type Key, type Lang } from './i18n'
import { useCloudSync, type SyncStatus } from './useCloudSync'

type Panel = null | 'auth' | 'board' | 'cloud' | 'account' | 'friends'

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = (k: Key) => tr(lang, k)
  const bridge = useMemo(() => new GameBridge(), [])
  const frameRef = useCallback((el: HTMLIFrameElement | null) => bridge.attach(el), [bridge])
  const [user, setUser] = useState<User | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [online, setOnline] = useState<boolean | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const sync = useCloudSync(bridge, user)
  const [pay, setPay] = useState<PaymentsInfo | null>(null)
  const [google, setGoogle] = useState<GoogleInfo | null>(null)
  const [ent, setEnt] = useState<Entitlements | null>(null)
  const [readyN, setReadyN] = useState(0)

  useEffect(() => () => bridge.dispose(), [bridge])
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    try { localStorage.setItem('lfc_lang', lang) } catch { /* ignore */ }
    if (bridge.ready) bridge.setLang(lang)
  }, [lang, bridge])
  useEffect(() => bridge.on((type, m) => {
    if (type === 'ready') bridge.setLang(lang)
    if (type === 'ready' && m.meta && (m.meta as { lang?: string }).lang && !localStorage.getItem('lfc_lang')) setLang((m.meta as { lang: Lang }).lang)
  }), [bridge, lang])
  // session restore + health check
  useEffect(() => {
    api.health().then(() => setOnline(true)).catch(() => setOnline(false))
    if (getToken()) api.me().then(setUser).catch(() => setToken(null))
  }, [])
  useEffect(() => { api.config().then((c) => { setPay(c.payments); setGoogle(c.google ?? null) }).catch(() => undefined) }, [])
  const refreshEnt = useCallback(async () => {
    if (!getToken() || !pay?.enabled) { setEnt(null); return null }
    const e = await api.entitlements(); setEnt(e); return e
  }, [pay?.enabled])
  useEffect(() => { void refreshEnt().catch(() => undefined) }, [refreshEnt, user?.id])
  // the game gets the server's own view of payments and ownership (it grants nothing by itself)
  useEffect(() => {
    if (!bridge.ready) return
    const live = !!user && !!pay?.enabled
    bridge.sendStore({ enabled: !!pay?.enabled, mode: pay?.mode ?? null, signed: !!user, ids: live ? ent?.ids : undefined, orders: live ? ent?.orders : undefined })
  }, [bridge, pay, user, ent, readyN])
  const startCheckout = useCallback(async (product: string) => {
    try {
      setToast(tr(lang, 'openingCheckout'))
      await sync.syncNow().catch(() => undefined) // the career is saved before the browser leaves for the payment page
      window.location.assign((await api.checkout(product, lang)).url)
    } catch (e) { setToast(e instanceof ApiError ? e.message : String(e)) }
  }, [lang, sync])
  useEffect(() => bridge.on((type, m) => {
    if (type === 'ready') setReadyN((n) => n + 1)
    if (type === 'need-login') setPanel('auth')
    if (type === 'buy' && typeof m.product === 'string') void startCheckout(m.product)
  }), [bridge, startCheckout])
  // coming back from the payment page: ask the server (which asks Stripe) whether it was paid
  useEffect(() => {
    if (!user) return
    const q = new URLSearchParams(window.location.search), sid = q.get('session_id'), res = q.get('checkout')
    if (!res) return
    window.history.replaceState(null, '', window.location.pathname)
    if (res === 'cancel') { setToast(tr(lang, 'payCancelled')); return }
    if (!sid) return
    let tries = 0, stop = false
    const poll = async () => {
      try {
        const r = await api.confirmPayment(sid)
        if (r.status === 'paid') { setToast(tr(lang, 'payDone')); await refreshEnt(); return }
        if (r.status !== 'pending') { setToast(tr(lang, 'statusOther')); return }
      } catch { /* retry below */ }
      setToast(tr(lang, 'payPending'))
      if (!stop && ++tries < 8) window.setTimeout(() => void poll(), 3500)
    }
    void poll()
    return () => { stop = true }
  }, [user, lang, refreshEnt])
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(null), 2600); return () => window.clearTimeout(id) }, [toast])
  const close = () => { setPanel(null); window.setTimeout(() => bridge.focus(), 50) }
  const signedIn = (tok: string, u: User) => { setToken(tok); setUser(u); close() }
  const signOut = () => { setToken(null); setUser(null); close() }

  return (
    <div className="shell">
      <header className="bar">
        <div className="brand"><img src="/icon.svg" alt="" width={26} height={26} /><span>LEGACY <b>FC</b></span></div>
        <SyncPill status={online === false ? 'offline' : sync.status} last={sync.lastSync} t={t} onClick={() => (user ? void sync.syncNow() : setPanel('auth'))} />
        <nav>
          <button onClick={() => setPanel('board')}>{t('leaderboard')}</button>
          {user && <button onClick={() => setPanel('cloud')}>{t('cloud')}</button>}
          {user && <button onClick={() => setPanel('friends')}>{t('friends')}</button>}
          {user ? <button className="acct" onClick={() => setPanel('account')}>{user.display_name}</button> : <button className="primary" onClick={() => setPanel('auth')}>{t('login')}</button>}
          <button className="lang" onClick={() => setLang(lang === 'he' ? 'en' : 'he')} aria-label="language">{lang === 'he' ? 'EN' : 'עב'}</button>
        </nav>
      </header>
      {pay?.enabled && pay.mode === 'test' && <div className="testbar">{t('payTest')}</div>}
      {online === false && <div className="banner">{t('serverDown')}</div>}
      {!user && online !== false && <div className="hintbar">{t('guest')} · <a onClick={() => setPanel('auth')}>{t('login')}</a></div>}
      <main className="stage">
        <iframe ref={frameRef} src="/game/index.html" title="LEGACY FC" allow="autoplay; fullscreen" onLoad={() => bridge.focus()} />
      </main>
      {panel === 'auth' && <AuthPanel t={t} lang={lang} google={google} onClose={close} onDone={signedIn} />}
      {panel === 'board' && <BoardPanel t={t} onClose={close} me={user?.id} />}
      {panel === 'cloud' && user && <CloudPanel t={t} onClose={close} onRestore={async (c) => { await bridge.importSave(c.data); setToast(t('restored')); close() }} />}
      {panel === 'friends' && user && <FriendsPanel t={t} Modal={Modal} onClose={close} />}
      {panel === 'account' && user && <AccountPanel t={t} orders={ent?.orders ?? []} user={user} onClose={close} onUser={setUser} onSignOut={signOut} onToken={(tok) => setToken(tok)} />}
      {sync.conflict && (
        <Modal title={t('conflictTitle')} onClose={() => undefined} t={t} noClose>
          <p className="muted">{t('conflictBody')}</p>
          <div className="cmp">
            <Card title={t('cloudVer')} rows={[[t('level'), sync.conflict.cloud.summary.level], [t('goals'), sync.conflict.cloud.summary.goals], [t('trophies'), sync.conflict.cloud.summary.trophies], [t('day'), sync.conflict.cloud.summary.day], [t('club'), sync.conflict.cloud.summary.club || '–']]} foot={new Date(sync.conflict.cloud.updated_at).toLocaleString()} />
            <Card title={t('deviceVer')} rows={[[t('level'), sync.conflict.local.lvl], [t('goals'), sync.conflict.local.goals], [t('trophies'), sync.conflict.local.trophies], [t('day'), sync.conflict.local.day], [t('club'), sync.conflict.local.club || '–']]} foot={sync.conflict.local.last ? new Date(sync.conflict.local.last).toLocaleString() : ''} />
          </div>
          <div className="row">
            <button className="primary" onClick={() => void sync.resolveConflict('cloud')}>{t('keepCloud')}</button>
            <button onClick={() => void sync.resolveConflict('device')}>{t('keepDevice')}</button>
          </div>
        </Modal>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function SyncPill({ status, last, t, onClick }: { status: SyncStatus; last: Date | null; t: (k: Key) => string; onClick: () => void }) {
  const label: Record<SyncStatus, string> = {
    guest: t('login'), idle: t('syncNow'), syncing: t('syncing'), synced: t('synced') + (last ? ' · ' + last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    pending: t('pending'), offline: t('offline'), 'no-career': t('noCareer'), conflict: t('conflictTitle'),
  }
  return <button className={`pill ${status}`} onClick={onClick} title={t('syncNow')}><i />{label[status]}</button>
}

function Modal({ title, children, onClose, t, noClose }: { title: string; children: ReactNode; onClose: () => void; t: (k: Key) => string; noClose?: boolean }) {
  useEffect(() => {
    if (noClose) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose, noClose])
  return (
    <div className="veil" onMouseDown={(e) => { if (!noClose && e.target === e.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2>{!noClose && <button className="x" onClick={onClose} aria-label={t('close')}>×</button>}</header>
        {children}
      </section>
    </div>
  )
}

function Card({ title, rows, foot }: { title: string; rows: [string, ReactNode][]; foot?: string }) {
  return <div className="card"><h3>{title}</h3>{rows.map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{v}</b></div>)}{foot && <small>{foot}</small>}</div>
}

function useErr() {
  const [err, setErr] = useState<string | null>(null)
  const run = async (fn: () => Promise<void>) => { setErr(null); try { await fn() } catch (e) { setErr(e instanceof ApiError ? (e.status === 0 ? 'Offline' : e.message) : String(e)) } }
  return { err, run }
}

function AuthPanel({ t, lang, google, onClose, onDone }: { t: (k: Key) => string; lang: Lang; google: GoogleInfo | null; onClose: () => void; onDone: (tok: string, u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [d, setD] = useState('')
  const { err, run } = useErr()
  const [busy, setBusy] = useState(false)
  const submit = (e: FormEvent) => { e.preventDefault(); setBusy(true); void run(async () => { const r = mode === 'login' ? await api.login(u, p) : await api.register(u, p, d); onDone(r.token, r.user) }).finally(() => setBusy(false)) }
  return (
    <Modal title={mode === 'login' ? t('login') : t('register')} onClose={onClose} t={t}>
      <p className="muted">{t('why')}</p>
      {google?.enabled && google.client_id && <>
        <GoogleButton clientId={google.client_id} lang={lang} unavailable={t('googleDown')} onCredential={(c) => { setBusy(true); void run(async () => { const r = await api.googleLogin(c); onDone(r.token, r.user) }).finally(() => setBusy(false)) }} />
        <div className="or"><span>{t('orWith')}</span></div>
      </>}
      {(mode === 'register' || google?.enabled) && <p className="muted small">{t('legalAgree')} <a href="/legal/terms.html" target="_blank" rel="noopener">{t('terms')}</a> · <a href="/legal/privacy.html" target="_blank" rel="noopener">{t('privacy')}</a> · <a href="/legal/refunds.html" target="_blank" rel="noopener">{t('refunds')}</a></p>}
      <form onSubmit={submit} className="form">
        <label>{t('username')}<input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required minLength={3} maxLength={32} autoFocus /></label>
        {mode === 'register' && <label>{t('displayName')}<input value={d} onChange={(e) => setD(e.target.value)} maxLength={40} /></label>}
        <label>{t('password')}<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1} maxLength={128} /></label>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="primary" disabled={busy}>{mode === 'login' ? t('login') : t('register')}</button>
        <a className="switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? t('needAccount') : t('haveAccount')}</a>
      </form>
    </Modal>
  )
}

function BoardPanel({ t, onClose, me }: { t: (k: Key) => string; onClose: () => void; me?: number }) {
  const [rows, setRows] = useState<LeaderRow[] | null>(null)
  const { err, run } = useErr()
  useEffect(() => { void run(async () => setRows((await api.leaderboard(100)).entries)) }, [])
  return (
    <Modal title={t('leaderboard')} onClose={onClose} t={t}>
      <p className="muted small">{t('formula')}</p>
      {err && <div className="err">{err}</div>}
      {!rows && !err && <p>{t('loading')}</p>}
      {rows && rows.length === 0 && <p>{t('empty')}</p>}
      {rows && rows.length > 0 && (
        <div className="tablewrap"><table>
          <thead><tr><th>{t('rank')}</th><th>{t('player')}</th><th>{t('club')}</th><th>{t('level')}</th><th>{t('goals')}</th><th>{t('trophies')}</th><th>{t('score')}</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.user_id} className={r.user_id === me ? 'me' : ''}><td>{r.rank}</td><td>{r.name}</td><td>{r.club || '–'}</td><td>{r.level}</td><td>{r.goals}</td><td>{r.trophies}</td><td><b>{r.score.toLocaleString()}</b></td></tr>)}</tbody>
        </table></div>
      )}
      <p className="muted small">{t('boardNote')}</p>
    </Modal>
  )
}

function CloudPanel({ t, onClose, onRestore }: { t: (k: Key) => string; onClose: () => void; onRestore: (c: CloudSave) => Promise<void> }) {
  const [cur, setCur] = useState<CloudSave | null | undefined>(undefined)
  const [hist, setHist] = useState<BackupMeta[]>([])
  const { err, run } = useErr()
  useEffect(() => { void run(async () => {
    try { setCur(await api.getSave(1)) } catch (e) { if (e instanceof ApiError && e.status === 404) setCur(null); else throw e }
    setHist(await api.history(1))
  }) }, [])
  return (
    <Modal title={t('cloud')} onClose={onClose} t={t}>
      {err && <div className="err">{err}</div>}
      <h3>{t('current')}</h3>
      {cur === undefined ? <p>{t('loading')}</p> : cur === null ? <p className="muted">{t('noCloud')}</p> : (
        <div className="saveRow"><div><b>v{cur.version}</b> · {t('level')} {cur.summary.level} · {t('goals')} {cur.summary.goals} · {t('day')} {cur.summary.day}</div><small>{new Date(cur.updated_at).toLocaleString()}</small></div>
      )}
      <h3>{t('history')}</h3>
      {hist.length === 0 && <p className="muted">{t('noHistory')}</p>}
      {hist.map((h) => (
        <div className="saveRow" key={h.id}>
          <div><b>v{h.version}</b> · {t('level')} {h.summary.level} · {t('goals')} {h.summary.goals} · {t('day')} {h.summary.day}<br /><small>{new Date(h.updated_at).toLocaleString()}</small></div>
          <button onClick={() => void run(async () => { const c = await api.restore(h.id); await onRestore(c) })}>{t('restore')}</button>
        </div>
      ))}
    </Modal>
  )
}

function AccountPanel({ t, user, orders, onClose, onUser, onSignOut, onToken }: { t: (k: Key) => string; user: User; orders: OrderRow[]; onClose: () => void; onUser: (u: User) => void; onSignOut: () => void; onToken: (tok: string) => void }) {
  const [name, setName] = useState(user.display_name)
  const [oldP, setOldP] = useState(''); const [newP, setNewP] = useState('')
  const [ok, setOk] = useState<string | null>(null)
  const { err, run } = useErr()
  const shown = orders.filter((o) => o.status !== 'expired' && o.status !== 'failed')
  return (
    <Modal title={t('account')} onClose={onClose} t={t}>
      <p className="muted">@{user.username}</p>
      <form className="form" onSubmit={(e) => { e.preventDefault(); void run(async () => { onUser(await api.patchMe({ display_name: name })); setOk(t('done')) }) }}>
        <label>{t('displayName')}<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required /></label>
        <label className="check"><input type="checkbox" checked={user.on_leaderboard} onChange={(e) => void run(async () => onUser(await api.patchMe({ on_leaderboard: e.target.checked })))} />{t('showOnBoard')}</label>
        <label className="check"><input type="checkbox" checked={user.discoverable} onChange={(e) => void run(async () => onUser(await api.patchMe({ discoverable: e.target.checked })))} />{t('discoverable')}</label>
        <button>{t('save')}</button>
      </form>
      <h3>{t('purchases')}</h3>
      {shown.length === 0 && <p className="muted small">{t('noPurchases')}</p>}
      {shown.slice(0, 20).map((o) => (
        <div className="saveRow" key={o.id}><div><b>{o.name}</b> · ₪{o.price}
          <span className={`badge ${o.status}`}>{o.status === 'paid' ? t('statusPaid') : o.status === 'pending' ? t('statusPending') : o.status === 'refunded' ? t('statusRefunded') : t('statusOther')}</span>
          {o.mode === 'test' && <span className="badge test">TEST</span>}<br /><small>{new Date(o.paid_at ?? o.created_at ?? '').toLocaleString()}</small></div></div>
      ))}
      <form className="form" onSubmit={(e) => { e.preventDefault(); void run(async () => { const r = await api.changePassword(oldP, newP); onToken(r.token); setOldP(''); setNewP(''); setOk(t('done')) }) }}>
        <h3>{t('changePassword')}</h3>
        <label>{t('oldPassword')}<input type="password" value={oldP} onChange={(e) => setOldP(e.target.value)} autoComplete="current-password" required /></label>
        <label>{t('newPassword')}<input type="password" value={newP} onChange={(e) => setNewP(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
        <button>{t('changePassword')}</button>
      </form>
      {err && <div className="err">{err}</div>}
      {ok && <div className="ok">{ok}</div>}
      <div className="row">
        <button onClick={onSignOut}>{t('logout')}</button>
        <button onClick={() => void run(async () => { await api.logoutAll(); onSignOut() })}>{t('logoutAll')}</button>
      </div>
      <button className="danger" onClick={() => { if (window.confirm(t('deleteConfirm'))) void run(async () => { await api.deleteAccount(); onSignOut() }) }}>{t('deleteAccount')}</button>
    </Modal>
  )
}
