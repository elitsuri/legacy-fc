import { useEffect, useRef, useState } from 'react'

interface GsiId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void
}
declare global { interface Window { google?: { accounts: { id: GsiId } } } }

let gsi: Promise<void> | null = null
/** Loads Google's sign-in script once. It is only requested when the server says Google sign-in is configured. */
function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!gsi) {
    gsi = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.onload = () => (window.google?.accounts?.id ? resolve() : reject(new Error('gsi')))
      s.onerror = () => { gsi = null; reject(new Error('gsi')) }
      document.head.appendChild(s)
    })
  }
  return gsi
}

/** Google's own button; the credential it hands back is verified by OUR server (/api/auth/google), never trusted here. */
export function GoogleButton({ clientId, lang, onCredential, unavailable }: { clientId: string; lang: string; onCredential: (c: string) => void; unavailable: string }) {
  const box = useRef<HTMLDivElement>(null)
  const cb = useRef(onCredential)
  cb.current = onCredential
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let dead = false
    loadGsi().then(() => {
      const el = box.current
      if (dead || !el || !window.google) return
      el.innerHTML = ''
      window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => cb.current(r.credential) })
      window.google.accounts.id.renderButton(el, { type: 'standard', theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'pill', width: 260, locale: lang })
    }).catch(() => { if (!dead) setFailed(true) })
    return () => { dead = true }
  }, [clientId, lang])
  return failed ? <p className="muted small">{unavailable}</p> : <div className="gbtn" ref={box} data-testid="google-button" />
}
