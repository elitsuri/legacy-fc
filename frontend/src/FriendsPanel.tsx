import { useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, type FriendRow, type FriendsList, type PlayerCard } from './api'
import type { Key } from './i18n'

type T = (k: Key) => string

function useErr() {
  const [err, setErr] = useState<string | null>(null)
  const run = async (fn: () => Promise<void>) => { setErr(null); try { await fn() } catch (e) { setErr(e instanceof ApiError ? (e.status === 0 ? 'Offline' : e.message) : String(e)) } }
  return { err, run }
}

/** Players linked to players: friends and requests, finding people, public profiles, and a ranking among friends. */
export function FriendsPanel({ t, Modal, onClose }: { t: T; Modal: (p: { title: string; children: ReactNode; onClose: () => void; t: T }) => ReactNode; onClose: () => void }) {
  const [tab, setTab] = useState<'list' | 'find' | 'board'>('list')
  const [list, setList] = useState<FriendsList | null>(null)
  const [q, setQ] = useState('')
  const [found, setFound] = useState<PlayerCard[] | null>(null)
  const [board, setBoard] = useState<FriendRow[] | null>(null)
  const [sel, setSel] = useState<PlayerCard | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const { err, run } = useErr()
  const reload = () => run(async () => { setList(await api.friends()) })
  useEffect(() => { if (tab === 'list') void reload() }, [tab]) // the list is refetched every time it is opened: requests may have been answered meanwhile
  useEffect(() => { if (tab === 'board') void run(async () => setBoard((await api.friendsBoard()).entries)) }, [tab])
  const act = (fn: () => Promise<unknown>, msg?: string) => void run(async () => {
    await fn(); setNote(msg ?? null); setList(await api.friends())
    if (found && q.trim().length >= 2) setFound(await api.searchUsers(q.trim()))
  })
  const stats = (c: PlayerCard) => c.stats ? `${t('level')} ${c.stats.level} · ${c.stats.goals} ${t('goals')} · ${c.stats.trophies} ${t('trophies')}${c.stats.club ? ' · ' + c.stats.club : ''}` : t('statsHidden')
  const open = (c: PlayerCard) => void run(async () => setSel(await api.profile(c.id)))
  const who = (c: PlayerCard) => <div className="who"><b><a onClick={() => open(c)}>{c.name}</a></b><small>@{c.username} · {stats(c)}</small></div>
  return (
    <Modal title={t('friends')} onClose={onClose} t={t}>
      <div className="tabs">
        {(['list', 'find', 'board'] as const).map((k) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setSel(null) }}>{k === 'list' ? t('friends') : k === 'find' ? t('findPlayers') : t('friendsBoard')}</button>)}
      </div>
      {err && <div className="err" role="alert">{err}</div>}
      {note && <div className="ok">{note}</div>}
      {sel && (
        <div className="card"><h3>{sel.name}</h3>
          <div className="kv"><span>@</span><b>{sel.username}</b></div>
          {sel.stats ? <>
            <div className="kv"><span>{t('level')}</span><b>{sel.stats.level}</b></div>
            <div className="kv"><span>{t('goals')}</span><b>{sel.stats.goals}</b></div>
            <div className="kv"><span>{t('trophies')}</span><b>{sel.stats.trophies}</b></div>
            <div className="kv"><span>{t('club')}</span><b>{sel.stats.club || '–'}</b></div>
            <div className="kv"><span>{t('score')}</span><b>{sel.stats.score.toLocaleString()}</b></div>
          </> : <small>{sel.relation === 'self' ? t('noSaveYet') : t('statsHidden')}</small>}
          {sel.friends != null && <div className="kv"><span>{t('friends')}</span><b>{sel.friends}</b></div>}
          <div className="row"><button onClick={() => setSel(null)}>{t('close')}</button></div>
        </div>
      )}
      {tab === 'list' && list && (<>
        {list.incoming.length > 0 && <h3>{t('incoming')}</h3>}
        {list.incoming.map((c) => (
          <div className="player" key={c.id}>{who(c)}<div className="acts">
            <button className="primary" onClick={() => act(() => api.acceptFriend(c.request_id!))}>{t('accept')}</button>
            <button onClick={() => act(() => api.declineFriend(c.request_id!))}>{t('decline')}</button>
            <button onClick={() => act(() => api.blockUser(c.id))}>{t('block')}</button>
          </div></div>
        ))}
        <h3>{t('friends')} ({list.friends.length})</h3>
        {list.friends.length === 0 && <p className="muted">{t('noFriends')}</p>}
        {list.friends.map((c) => (
          <div className="player" key={c.id}>{who(c)}<div className="acts">
            <button onClick={() => act(() => api.removeFriend(c.id))}>{t('removeFriend')}</button>
            <button onClick={() => act(() => api.blockUser(c.id))}>{t('block')}</button>
          </div></div>
        ))}
        {list.outgoing.length > 0 && <h3>{t('outgoing')}</h3>}
        {list.outgoing.map((c) => <div className="player" key={c.id}>{who(c)}<div className="acts"><button onClick={() => act(() => api.removeFriend(c.id))}>{t('cancel')}</button></div></div>)}
        {list.blocked.length > 0 && <h3>{t('blockedList')}</h3>}
        {list.blocked.map((c) => <div className="player" key={c.id}><div className="who"><b>{c.name}</b><small>@{c.username}</small></div><div className="acts"><button onClick={() => act(() => api.unblockUser(c.id))}>{t('unblock')}</button></div></div>)}
      </>)}
      {tab === 'find' && (<>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); if (q.trim().length >= 2) void run(async () => setFound(await api.searchUsers(q.trim()))) }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchHint')} maxLength={32} autoFocus /><button className="primary">{t('findPlayers')}</button>
        </form>
        {found && found.length === 0 && <p className="muted">{t('noResults')}</p>}
        {found?.map((c) => (
          <div className="player" key={c.id}>{who(c)}<div className="acts">
            {c.relation === 'none' && <button className="primary" onClick={() => act(() => api.addFriend(c.username), t('requestSent'))}>{t('addFriend')}</button>}
            {c.relation === 'friends' && <span className="badge paid">{t('friends')}</span>}
            {c.relation === 'request_sent' && <span className="badge">{t('requestSent')}</span>}
            {c.relation === 'request_received' && <button className="primary" onClick={() => act(() => api.addFriend(c.username))}>{t('accept')}</button>}
          </div></div>
        ))}
      </>)}
      {tab === 'board' && (<>
        {!board && !err && <p>{t('loading')}</p>}
        {board && board.length === 0 && <p className="muted">{t('noFriends')}</p>}
        {board && board.length > 0 && (
          <div className="tablewrap"><table>
            <thead><tr><th>{t('rank')}</th><th>{t('player')}</th><th>{t('club')}</th><th>{t('level')}</th><th>{t('goals')}</th><th>{t('score')}</th></tr></thead>
            <tbody>{board.map((r) => <tr key={r.user_id} className={r.me ? 'me' : ''}><td>{r.rank}</td><td>{r.name}{r.me ? ` (${t('you')})` : ''}</td><td>{r.club || '–'}</td><td>{r.level}</td><td>{r.goals}</td><td><b>{r.score.toLocaleString()}</b></td></tr>)}</tbody>
          </table></div>
        )}
      </>)}
    </Modal>
  )
}
