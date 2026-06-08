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

const _AnonPaths = () => (
  <g>
    <path d="M200.663,23.767c-1.125-1.125-2.651-1.758-4.243-1.758c-0.02-0.001-0.04,0-0.06,0c-4.237,0-8.227-1.651-11.234-4.652c-3.037-3.03-4.708-7.062-4.707-11.354c0.001-1.592-0.632-3.118-1.757-4.244C177.537,0.632,176.011,0,174.419,0H31.581c-1.592,0-3.118,0.632-4.243,1.758c-1.125,1.126-1.758,2.652-1.757,4.244c0.001,4.292-1.67,8.325-4.707,11.354c-3.009,3.001-6.996,4.652-11.234,4.652c-0.02,0-0.04-0.001-0.06,0c-1.592,0-3.118,0.632-4.243,1.758c-1.129,1.13-1.762,2.663-1.757,4.26c0.06,20.19,2.938,51.081,16.305,83.586c16.012,38.936,42.908,70.387,79.94,93.479c0.972,0.606,2.073,0.909,3.175,0.909s2.203-0.303,3.175-0.909c37.032-23.092,63.929-54.542,79.94-93.479c13.367-32.505,16.245-63.396,16.305-83.586C202.425,26.429,201.792,24.896,200.663,23.767z M103,192.891C30.521,145.934,16.802,75.074,15.661,33.36c5.143-1.127,9.867-3.697,13.688-7.509c3.865-3.856,6.465-8.64,7.594-13.852h132.113c1.129,5.212,3.729,9.996,7.594,13.852c3.821,3.813,8.546,6.382,13.688,7.509C189.198,75.074,175.479,145.934,103,192.891z"/>
    <path d="M155.924,99.253c-2.903-1.597-6.553-0.537-8.148,2.366l-5.217,9.483h-16.362l-5.866-9.697c-1.087-1.797-3.034-2.895-5.134-2.895H90.804c-2.1,0-4.047,1.098-5.134,2.895l-5.866,9.697H63.441l-5.217-9.483c-1.596-2.903-5.244-3.963-8.148-2.366c-2.903,1.597-3.963,5.246-2.365,8.149l6.926,12.591c1.054,1.917,3.068,3.108,5.257,3.108h23.293c2.1,0,4.047-1.098,5.134-2.895l5.866-9.697h17.627l5.866,9.697c1.087,1.797,3.034,2.895,5.134,2.895h23.293c2.188,0,4.203-1.191,5.257-3.108l6.926-12.591C159.887,104.499,158.827,100.851,155.924,99.253z"/>
    <polygon points="103,173.097 114.647,132.805 91.353,132.805"/>
    <path d="M64.834,46.007c8.584,0,16.593,4.622,20.9,12.061c1.66,2.867,5.333,3.845,8.199,2.186c2.867-1.661,3.846-5.332,2.186-8.199c-6.447-11.132-18.435-18.047-31.285-18.047c-12.855,0-24.846,6.918-31.29,18.055c-1.659,2.868-0.68,6.539,2.188,8.199c0.946,0.547,1.979,0.808,2.999,0.808c2.071,0,4.087-1.074,5.199-2.996C48.237,50.63,56.247,46.007,64.834,46.007z"/>
    <path d="M57.395,55.071c-2.209,0-4,1.791-4,4s1.791,4,4,4h15.859c2.209,0,4-1.791,4-4s-1.791-4-4-4H57.395z"/>
    <path d="M141.17,34.007c-12.854,0-24.844,6.918-31.29,18.055c-1.659,2.868-0.68,6.539,2.188,8.198c0.946,0.548,1.98,0.808,3,0.808c2.071,0,4.087-1.074,5.199-2.996c4.308-7.442,12.317-12.066,20.903-12.066c8.584,0,16.593,4.621,20.9,12.06c1.659,2.867,5.33,3.847,8.199,2.186c2.867-1.661,3.846-5.331,2.186-8.199C166.01,40.922,154.021,34.007,141.17,34.007z"/>
    <path d="M149.591,63.071c2.209,0,4-1.791,4-4s-1.791-4-4-4h-15.86c-2.209,0-4,1.791-4,4s1.791,4,4,4H149.591z"/>
    <path d="M109.157,125.667c2.209,0,4-1.791,4-4s-1.791-4-4-4H96.843c-2.209,0-4,1.791-4,4s1.791,4,4,4H109.157z"/>
  </g>
)

const IcoMask = () => (
  <svg viewBox="0 0 206 206" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <_AnonPaths />
  </svg>
)

const IcoMaskOff = () => (
  <svg viewBox="0 0 206 206" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <_AnonPaths />
    <line x1="22" y1="22" x2="184" y2="184" stroke="currentColor" strokeWidth="18" strokeLinecap="round"/>
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
