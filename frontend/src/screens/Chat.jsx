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

const IcoMask = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4 0 3.5-2 6.5-5 7.8-.4.2-.8 1.2-5 1.2s-4.6-1-5-1.2C4 15.5 2 12.5 2 9z"/>
    <ellipse cx="8.5" cy="9" rx="2" ry="1.5"/>
    <ellipse cx="15.5" cy="9" rx="2" ry="1.5"/>
  </svg>
)

const IcoMaskOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4 0 3.5-2 6.5-5 7.8-.4.2-.8 1.2-5 1.2s-4.6-1-5-1.2C4 15.5 2 12.5 2 9z"/>
    <ellipse cx="8.5" cy="9" rx="2" ry="1.5"/>
    <ellipse cx="15.5" cy="9" rx="2" ry="1.5"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)

const IcoHeadphones = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
)

const IcoHeadphonesOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v-3a9 9 0 0 0-14.3-7.3M3.1 10A9 9 0 0 0 3 12v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)

const IcoWarn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{width:11,height:11,flexShrink:0}}>
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
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
        <div className="safety-modal-label">Safety code</div>
        <div className="safety-words">
          {words.map((w, i) => <span key={i} className="safety-word">{w}</span>)}
        </div>
        <div className="safety-modal-hint">
          If these words match on both sides, your conversation is end-to-end encrypted and completely private — no one, including Vanish servers, can read it
        </div>
        <button className="btn-ghost" style={{marginTop:16}} onClick={onClose}>Close</button>
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
function AnonWarning({ onConfirm, onCancel }) {
  return (
    <div className="safety-overlay" onClick={onCancel}>
      <div className="safety-modal" onClick={e => e.stopPropagation()}>
        <div className="safety-modal-label" style={{ color: 'var(--danger)' }}>Warning</div>
        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, textAlign: 'center' }}>
          Disabling voice anonymization will transmit your <strong>real voice</strong>.<br/>
          Your identity may become recognizable to the other party.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>Disable anyway</button>
        </div>
      </div>
    </div>
  )
}

function VoiceChat({ state, sendVoice, voiceRef, destroyRoom, leaveRoom }) {
  const [muted,        setMuted]        = useState(false)
  const [deafened,     setDeafened]     = useState(false)
  const [error,        setError]        = useState(null)
  const [active,       setActive]       = useState(false)
  const [peerWasHere,  setPeerWasHere]  = useState(false)
  const [anonymized,   setAnonymized]   = useState(true)
  const [showWarning,  setShowWarning]  = useState(false)
  const [level,        setLevel]        = useState(0)
  const levelRef  = useRef(0)
  const engineRef = useRef(null)

  useEffect(() => {
    if (state.peerPeerId) setPeerWasHere(true)
  }, [state.peerPeerId])

  // Poll level at 20 fps to avoid flooding React with raw audio callbacks
  useEffect(() => {
    const id = setInterval(() => setLevel(levelRef.current), 50)
    return () => clearInterval(id)
  }, [])

  const handleAnonToggle = () => {
    if (anonymized) {
      setShowWarning(true)
    } else {
      setAnonymized(true)
      engineRef.current?.setAnonymized(true)
    }
  }

  const confirmDisableAnon = () => {
    setAnonymized(false)
    engineRef.current?.setAnonymized(false)
    setShowWarning(false)
  }

  useEffect(() => {
    let engine
    import('../audio.js').then(({ VoiceEngine }) => {
      engine = new VoiceEngine({
        onChunk: sendVoice,
        onLevel: (v) => { levelRef.current = v },
      })
      engineRef.current = engine
      voiceRef.current  = (audio) => engine.receive(audio)
      engine.start().then(() => setActive(true)).catch((err) => {
        console.error('[VoiceChat] engine.start failed:', err?.name, err?.message)
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setError('Microphone access denied.')
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setError('No microphone found.')
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          setError('Microphone is in use by another app.')
        } else {
          setError('Could not start microphone.')
        }
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

  const toggleDeafen = () => {
    const next = !deafened
    setDeafened(next)
    engineRef.current?.setDeafened(next)
  }

  // Avatar glow/scale reacts to voice level
  const speaking = active && !muted && level > 0.04
  const avatarStyle = {
    transform:  speaking ? `scale(${(1 + level * 0.22).toFixed(3)})` : 'scale(1)',
    boxShadow:  speaking
      ? `0 0 ${Math.round(level * 28 + 6)}px rgba(167,139,250,${(0.25 + level * 0.55).toFixed(2)})`
      : undefined,
    transition: 'transform 0.09s ease-out, box-shadow 0.09s ease-out',
  }

  return (
    <div className="chat-wrap">
      <ChatHeader state={state} destroyRoom={destroyRoom} leaveRoom={leaveRoom} />

      <div className="voice-body">
        <div className={`voice-avatar${state.peerPeerId && active ? ' active' : ''}`} style={avatarStyle}>
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
                : peerWasHere ? 'Peer left the call' : 'Waiting for peer…'}
          </div>
          <div className="voice-sub">
            {error
              ? error.includes('denied') ? 'Check browser permissions' : 'Check your audio device'
              : state.peerPeerId
                ? 'Voice session active'
                : peerWasHere ? 'The session has ended' : 'Share the invite link'}
          </div>
        </div>

        <div className="voice-controls">
          {/* Mute microphone */}
          <button
            className={`btn-mic${muted ? ' muted' : ''}`}
            onClick={toggleMute}
            title={muted ? 'Unmute microphone' : 'Mute microphone'}
          >
            <span style={{width:22,height:22}}>
              {muted ? <IcoMicOff /> : <IcoMic />}
            </span>
          </button>

          {/* Deafen — mute incoming audio */}
          <button
            className={`btn-mic${deafened ? ' muted' : ''}`}
            onClick={toggleDeafen}
            title={deafened ? 'Undeafen' : 'Deafen (mute speaker)'}
          >
            <span style={{width:22,height:22}}>
              {deafened ? <IcoHeadphonesOff /> : <IcoHeadphones />}
            </span>
          </button>

          {/* Voice anonymizer */}
          <div style={{position:'relative',display:'inline-flex'}}>
            <button
              className={`btn-mic${!anonymized ? ' muted' : ''}`}
              onClick={handleAnonToggle}
              title={anonymized ? 'Voice anonymized — click to disable' : 'Real voice — click to anonymize'}
            >
              <span style={{width:22,height:22}}>
                {anonymized ? <IcoMask /> : <IcoMaskOff />}
              </span>
            </button>
            {!anonymized && (
              <span style={{
                position:'absolute', top:-5, right:-5,
                width:16, height:16, borderRadius:'50%',
                background:'var(--danger)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:800, color:'#fff',
                pointerEvents:'none', lineHeight:1,
              }}>!</span>
            )}
          </div>
        </div>

        <div className="voice-anon-status" style={!anonymized ? {color:'var(--danger)',fontWeight:600} : {}}>
          {anonymized
            ? 'Voice anonymized'
            : <span style={{display:'flex',alignItems:'center',gap:5,justifyContent:'center'}}>
                <IcoWarn /> Real voice — identity at risk
              </span>}
        </div>
      </div>

      {showWarning && (
        <AnonWarning
          onConfirm={confirmDisableAnon}
          onCancel={() => setShowWarning(false)}
        />
      )}
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
          <button className="btn btn-danger" onClick={destroyRoom}>Wipe</button>
        </div>
      </div>

      {showSafety && state.safetyCode && (
        <SafetyModal code={state.safetyCode} onClose={() => setShowSafety(false)} />
      )}
    </>
  )
}
