import { useEffect, useRef, useState, useCallback } from 'react'

export default function Chat({ state, sendMsg, destroyRoom, leaveRoom }) {
  return state.roomType === 'voice'
    ? <VoiceChat state={state} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />
    : <TextChat  state={state} sendMsg={sendMsg} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />
}

/* ── Text chat ──────────────────────────────────────────────────────────────── */
function TextChat({ state, sendMsg, destroyRoom, leaveRoom }) {
  const msgsRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [state.messages])

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleKey = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const val = e.target.value.trim()
      if (val) { sendMsg(val); e.target.value = ''; e.target.style.height = '' }
    }
  }, [sendMsg])

  const handleInput = e => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleSend = () => {
    const val = inputRef.current?.value.trim()
    if (val) { sendMsg(val); inputRef.current.value = ''; inputRef.current.style.height = '' }
  }

  return (
    <div className="chat-wrap">
      <ChatHeader state={state} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />

      <div className="messages" ref={msgsRef}>
        {state.messages.map((m, i) =>
          m.system
            ? <div key={i} className="sys-msg"><span>{m.text}</span></div>
            : (
              <div key={i} className={`msg ${m.mine ? 'mine' : 'theirs'}`}>
                <div className="bubble">{m.text}</div>
                <div className="msg-time mono">
                  {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
        )}
      </div>

      <div className="input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Type a message…"
          rows={1}
          onKeyDown={handleKey}
          onInput={handleInput}
        />
        <button className="btn-send" onClick={handleSend}>
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  )
}

/* ── Voice chat ─────────────────────────────────────────────────────────────── */
function VoiceChat({ state, destroyRoom, leaveRoom }) {
  return (
    <div className="chat-wrap">
      <ChatHeader state={state} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />

      <div className="voice-body">
        <div className={`voice-avatar${state.peerPeerId ? ' active' : ''}`}>
          🎤
        </div>

        <div>
          <div className="voice-status">
            {state.peerPeerId ? 'Connected' : 'Waiting for peer…'}
          </div>
          <div className="voice-sub">
            {state.peerPeerId ? 'Voice session active' : 'Share the invite link'}
          </div>
        </div>

        <div className="voice-controls">
          <div className="btn-mic" title="Voice not available yet">🔇</div>
        </div>

        <div className="voice-coming-soon">
          🔒 Voice encryption is coming soon.<br />
          End-to-end encrypted calls via WebRTC.
        </div>
      </div>
    </div>
  )
}

/* ── Shared header ──────────────────────────────────────────────────────────── */
function ChatHeader({ state, destroyRoom, leaveRoom }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    const tick = () => {
      if (!state.expiresAt) return
      const diff = Math.max(0, state.expiresAt - Date.now())
      const m = Math.floor(diff / 60000)
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setLabel(`expires ${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state.expiresAt])

  const urgent = state.expiresAt && (state.expiresAt - Date.now()) < 120000

  return (
    <div className="chat-header">
      <div className="header-left">
        <div className="status-dot" />
        <div>
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Secure Room
            <span className="type-badge">{state.roomType === 'voice' ? '🎤 voice' : '💬 text'}</span>
          </div>
          <div className={`header-sub mono${urgent ? ' urgent' : ''}`}>{label}</div>
        </div>
      </div>
      <div className="header-actions">
        <button className="btn btn-ghost" onClick={leaveRoom}>Leave</button>
        <button className="btn btn-danger" onClick={destroyRoom}>Стереть всё</button>
      </div>
    </div>
  )
}
