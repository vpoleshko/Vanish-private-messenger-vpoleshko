const IcoChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const IcoMic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

export default function Landing({ state, set, createRoom }) {
  const { roomType, ttlMinutes } = state

  return (
    <div className="landing-wrap">
      <div className="landing-header">
        <div className="logo-hero">Vanish</div>
        <div className="landing-sub" style={{ marginTop: 10 }}>Nothing stored. Nothing linked. Nothing left.</div>
      </div>

      <div className="form-card">

        {/* Room type */}
        <div className="form-section">
          <div className="form-section-label">Type</div>
          <div className="room-type-grid">
            <RoomTypeCard
              icon={<IcoChat />}
              name="Text"
              desc="Encrypted messages"
              selected={roomType === 'text'}
              onClick={() => set({ roomType: 'text' })}
            />
            <RoomTypeCard
              icon={<IcoMic />}
              name="Voice"
              desc="Encrypted call"
              selected={roomType === 'voice'}
              onClick={() => set({ roomType: 'voice' })}
            />
          </div>
        </div>

        {/* TTL + Panic URL */}
        <div className="form-section">
          <div className="field-row">
            <span className="field-label">Expires after</span>
            <input
              className="field-input"
              type="number"
              min={1}
              max={10080}
              value={ttlMinutes}
              style={{ width: 44 }}
              onChange={e => {
                const v = parseInt(e.target.value)
                if (v > 0) set({ ttlMinutes: v })
              }}
            />
            <span className="field-unit">min</span>
          </div>
        </div>

        <button className="btn-create" onClick={createRoom}>
          Create room
        </button>
      </div>
    </div>
  )
}

function RoomTypeCard({ icon, name, desc, selected, soon, onClick }) {
  return (
    <div
      className={`room-type-card${selected ? ' selected' : ''}${soon ? ' disabled' : ''}`}
      onClick={soon ? undefined : onClick}
    >
      {soon && <span className="badge-soon">Soon</span>}
      <div className="room-type-icon">{icon}</div>
      <div className="room-type-name">{name}</div>
      <div className="room-type-desc">{desc}</div>
    </div>
  )
}
