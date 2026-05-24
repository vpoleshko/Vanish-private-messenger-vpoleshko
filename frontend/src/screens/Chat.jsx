import { useEffect, useRef, useState, useCallback } from 'react'

/* ── SVG icons ───────────────────────────────────────────────────────────── */
const IcoMic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const IcoMicOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2" x2="22" y2="22"/>
    <path d="M18.89 13.23A7 7 0 0 0 19 10"/>
    <path d="M5 10a7 7 0 0 0 12.66 3.76"/>
    <rect x="9" y="2" width="6" height="8" rx="3"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const IcoShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IcoVoice = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
  </svg>
)

const IcoText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

/* ── Safety code modal ───────────────────────────────────────────────────── */
function SafetyModal({ code, onClose }) {
  const words = code.split(' · ')
  return (
    <div className="safety-overlay" onClick={onClose}>
      <div className="safety-modal" onClick={e => e.stopPropagation()}>
        <div className="safety-modal-label">Код безопасности</div>
        <div className="safety-words">
          {words.map((w, i) => <span key={i} className="safety-word">{w}</span>)}
        </div>
        <div className="safety-modal-hint">
          Прочитайте вслух собеседнику — слова должны совпадать у обоих
        </div>
        <button className="btn-ghost" style={{marginTop:16}} onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}

export default function Chat({ state, sendMsg, sendVoice, voiceRef, destroyRoom, leaveRoom }) {
  return state.roomType === 'voice'
    ? <VoiceChat state={state} sendVoice={sendVoice} voiceRef={voiceRef} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />
    : <TextChat  state={state} sendMsg={sendMsg} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />
}

/* ── Text chat ──────────────────────────────────────────────────────────── */
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

/* ── Voice chat ─────────────────────────────────────────────────────────── */
function VoiceChat({ state, sendVoice, voiceRef, destroyRoom, leaveRoom }) {
  const [muted,   setMuted]   = useState(false)
  const [error,   setError]   = useState(null)
  const [active,  setActive]  = useState(false)
  const engineRef = useRef(null)

  useEffect(() => {
    let engine
    import('../audio.js').then(({ VoiceEngine }) => {
      engine = new VoiceEngine({ onChunk: sendVoice })
      engineRef.current = engine
      voiceRef.current  = (audio) => engine.receive(audio)
      engine.start().then(() => setActive(true)).catch(() => {
        setError('Microphone access denied.')
      })
    })
    return () => {
      engine?.stop()
      voiceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    engineRef.current?.setMuted(next)
  }

  return (
    <div className="chat-wrap">
      <ChatHeader state={state} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />

      <div className="voice-body">
        <div className={`voice-avatar${state.peerPeerId && active ? ' active' : ''}`}>
          <span style={{width:32,height:32,color:muted?'var(--danger)':'var(--accent)'}}>
            {muted ? <IcoMicOff /> : <IcoMic />}
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="voice-status">
            {error
              ? error
              : state.peerPeerId
                ? active ? 'Connected' : 'Connecting…'
                : 'Waiting for peer…'}
          </div>
          <div className="voice-sub">
            {error
              ? 'Check browser permissions'
              : state.peerPeerId
                ? 'Voice session active'
                : 'Share the invite link'}
          </div>
        </div>

        <div className="voice-controls">
          <button
            className={`btn-mic${muted ? ' muted' : ''}`}
            onClick={toggleMute}
            title={muted ? 'Unmute' : 'Mute'}
          >
            <span style={{width:22,height:22}}>
              {muted ? <IcoMicOff /> : <IcoMic />}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Shared header ──────────────────────────────────────────────────────── */
function ChatHeader({ state, destroyRoom, leaveRoom }) {
  const [label,      setLabel]      = useState('')
  const [showSafety, setShowSafety] = useState(false)

  useEffect(() => {
    const tick = () => {
      if (!state.expiresAt) return
      const diff = Math.max(0, state.expiresAt - Date.now())
      const m = Math.floor(diff / 60000)
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setLabel(`${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state.expiresAt])

  const urgent = state.expiresAt && (state.expiresAt - Date.now()) < 120000

  return (
    <>
      <div className="chat-header">
        <div className="header-left">
          <div className="status-dot" />
          <div>
            <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Secure Room
              <span className="type-badge">
                {state.roomType === 'voice' ? <IcoVoice /> : <IcoText />}
                {state.roomType === 'voice' ? ' voice' : ' text'}
              </span>
            </div>
            <div className={`header-sub mono${urgent ? ' urgent' : ''}`}>
              {label && `expires ${label}`}
            </div>
          </div>
        </div>
        <div className="header-actions">
          {state.safetyCode && (
            <button
              className={`btn-verify${showSafety ? ' active' : ''}`}
              onClick={() => setShowSafety(v => !v)}
              title="Verify connection"
            >
              <IcoShield />
            </button>
          )}
          <button className="btn btn-ghost" onClick={leaveRoom}>Leave</button>
          <button className="btn btn-danger" onClick={destroyRoom}>Стереть всё</button>
        </div>
      </div>

      {showSafety && state.safetyCode && (
        <SafetyModal code={state.safetyCode} onClose={() => setShowSafety(false)} />
      )}
    </>
  )
}
