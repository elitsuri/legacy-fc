// Stable fingerprint of a save, ignoring fields that change on every write (timestamps).
const IGNORE = new Set(['last'])

export function canonical(v: unknown, top = true): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null'
  if (Array.isArray(v)) return '[' + v.map((x) => canonical(x, false)).join(',') + ']'
  const o = v as Record<string, unknown>
  const keys = Object.keys(o).filter((k) => o[k] !== undefined && !(top && IGNORE.has(k))).sort()
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(o[k], false)).join(',') + '}'
}

export function fingerprint(save: unknown): string {
  // FNV-1a 32-bit over the canonical form, twice with different seeds -> 64 bits of fingerprint
  const s = canonical(save)
  let a = 0x811c9dc5, b = 0x9747b28c
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a = Math.imul(a ^ c, 0x01000193)
    b = Math.imul(b ^ c, 0x5bd1e995)
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0')
}
