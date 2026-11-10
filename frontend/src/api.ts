// Thin typed client for the LEGACY FC API.
export interface User { id: number; username: string; display_name: string; on_leaderboard: boolean; discoverable: boolean; created_at: string | null }
export interface SaveSummary { level: number; overall: number; goals: number; matches: number; trophies: number; fans: number; season: number; day: number; money: number; club: string; archetype: string; cards: number }
export interface SaveMeta { version: number; checksum: string; summary: SaveSummary; updated_at: string }
export interface CloudSave extends SaveMeta { slot: number; data: Record<string, unknown> }
export interface BackupMeta extends SaveMeta { id: number }
export interface LeaderRow { rank: number; user_id: number; name: string; score: number; level: number; overall: number; goals: number; trophies: number; fans: number; club: string; updated_at: string | null }
export interface GoogleInfo { enabled: boolean; client_id: string | null }
export interface PublicConfig { registration: boolean; max_save_bytes: number; payments: PaymentsInfo; google?: GoogleInfo; score_formula: string }
export interface PaymentsInfo { enabled: boolean; provider: string | null; mode: 'test' | 'live' | null; currency?: string }
export interface OrderRow { id: number; product_id: string; name: string; price: number; currency: string; status: string; mode: string; created_at: string | null; paid_at: string | null }
export interface Entitlements { ids: string[]; orders: OrderRow[]; payments: PaymentsInfo }
export type Relation = 'self' | 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked' | 'blocked_by'
export interface PlayerStats { score: number; level: number; overall: number; goals: number; trophies: number; fans: number; club: string }
export interface PlayerCard { id: number; username: string; name: string; relation: Relation; since: string | null; stats: PlayerStats | null; request_id?: number; friends?: number }
export interface FriendsList { friends: PlayerCard[]; incoming: PlayerCard[]; outgoing: PlayerCard[]; blocked: { id: number; name: string; username: string }[] }
export interface FriendRow { rank: number; user_id: number; name: string; me: boolean; score: number; level: number; overall: number; goals: number; trophies: number; club: string }

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) { super(message) }
}

const TOKEN_KEY = 'lfc_token'
let token: string | null = (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()

export function getToken() { return token }
export function setToken(t: string | null) {
  token = t
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY) } catch { /* storage unavailable */ }
}

async function req<T>(method: string, path: string, body?: unknown, opts: { keepalive?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  let res: Response
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), keepalive: opts.keepalive })
  } catch {
    throw new ApiError(0, 'offline')
  }
  const text = await res.text()
  const json = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null
  if (!res.ok) {
    const detail = json && typeof json === 'object' && 'detail' in json ? (json as { detail: unknown }).detail : json
    const msg = typeof detail === 'string' ? detail : detail && typeof detail === 'object' && 'message' in detail ? String((detail as { message: unknown }).message) : `HTTP ${res.status}`
    if (res.status === 401 && token && path !== '/auth/login' && path !== '/auth/google') setToken(null)
    throw new ApiError(res.status, msg, detail)
  }
  return json as T
}

export const api = {
  config: () => req<PublicConfig>('GET', '/config'),
  health: () => req<{ ok: boolean; version: string }>('GET', '/health'),
  register: (username: string, password: string, display_name?: string) => req<{ token: string; user: User }>('POST', '/auth/register', { username, password, display_name: display_name || undefined }),
  login: (username: string, password: string) => req<{ token: string; user: User }>('POST', '/auth/login', { username, password }),
  googleLogin: (credential: string) => req<{ token: string; user: User }>('POST', '/auth/google', { credential }),
  me: () => req<User>('GET', '/me'),
  patchMe: (body: Partial<Pick<User, 'display_name' | 'on_leaderboard' | 'discoverable'>>) => req<User>('PATCH', '/me', body),
  changePassword: (old_password: string, new_password: string) => req<{ ok: boolean; token: string }>('POST', '/me/password', { old_password, new_password }),
  logoutAll: () => req<{ ok: boolean }>('POST', '/auth/logout-all'),
  deleteAccount: () => req<{ ok: boolean }>('DELETE', '/me'),
  getSave: (slot = 1) => req<CloudSave>('GET', `/saves/${slot}`),
  putSave: (data: unknown, base_version: number | null, force = false, slot = 1, keepalive = false) =>
    req<SaveMeta & { unchanged?: boolean }>('PUT', `/saves/${slot}`, { data, base_version, force, device: navigator.userAgent.slice(0, 64) }, { keepalive }),
  history: (slot = 1) => req<BackupMeta[]>('GET', `/saves/${slot}/history`),
  restore: (id: number, slot = 1) => req<CloudSave>('POST', `/saves/${slot}/restore/${id}`),
  leaderboard: (limit = 50) => req<{ note: string; entries: LeaderRow[] }>('GET', `/leaderboard?limit=${limit}`),
  // store (prices and ownership live on the server; the browser only sends a product id)
  entitlements: () => req<Entitlements>('GET', '/store/entitlements'),
  checkout: (product_id: string, lang: string) => req<{ order_id: number; url: string; mode: string }>('POST', '/store/checkout', { product_id, lang }),
  confirmPayment: (session_id: string) => req<{ status: string; ids: string[]; order: OrderRow }>('POST', '/store/confirm', { session_id }),
  // players
  searchUsers: (q: string) => req<PlayerCard[]>('GET', `/users/search?q=${encodeURIComponent(q)}`),
  profile: (id: number) => req<PlayerCard>('GET', `/users/${id}/profile`),
  friends: () => req<FriendsList>('GET', '/friends'),
  addFriend: (username: string) => req<{ status: string }>('POST', '/friends/requests', { username }),
  acceptFriend: (requestId: number) => req<{ status: string }>('POST', `/friends/requests/${requestId}/accept`),
  declineFriend: (requestId: number) => req<{ status: string }>('POST', `/friends/requests/${requestId}/decline`),
  removeFriend: (id: number) => req<{ removed: number }>('DELETE', `/friends/${id}`),
  blockUser: (id: number) => req<{ status: string }>('POST', `/friends/block/${id}`),
  unblockUser: (id: number) => req<{ status: string }>('DELETE', `/friends/block/${id}`),
  friendsBoard: () => req<{ entries: FriendRow[]; without_save: number }>('GET', '/leaderboard/friends'),
}
