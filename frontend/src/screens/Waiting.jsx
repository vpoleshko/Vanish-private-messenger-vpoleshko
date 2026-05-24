import { useState } from 'react'

export default function Waiting({ state }) {
  const [copied, setCopied] = useState(false)
  const url = state.peerUrl || ''

  const copy = async () => {
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="center">
      <div className="pulse" />

      <div>
        <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.02em' }}>
          Waiting for peer…
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          Share the link below. One-time use.
        </div>
      </div>

      <div className="invite-card">
        <div style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, fontFamily: 'Menlo,Consolas,monospace' }}>
          Invite link
        </div>
        <div className="invite-url">{url}</div>
        <button className={`btn-copy${copied ? ' copied' : ''}`} onClick={copy}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
