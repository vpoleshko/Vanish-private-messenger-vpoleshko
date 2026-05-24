export default function Landing({ state, set, createRoom }) {
  const { roomType, ttlMinutes, panicUrl } = state

  return (
    <div className="landing-wrap">
      <div className="landing-header">
        <div className="logo">Vanish</div>
        <div className="landing-title">Private room</div>
        <div className="landing-sub">No accounts. No logs. Disappears.</div>
      </div>

      <div className="form-card">

        {/* Room type */}
        <div className="form-section">
          <div className="form-section-label">Type</div>
          <div className="room-type-grid">
            <RoomTypeCard
              icon="💬"
              name="Text"
              desc="Encrypted messages"
              selected={roomType === 'text'}
              onClick={() => set({ roomType: 'text' })}
            />
            <RoomTypeCard
              icon="🎙"
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
          <div className="field-row">
            <span className="field-label">Redirect after destroy</span>
            <input
              className="field-input"
              type="url"
              value={panicUrl}
              placeholder="https://google.com"
              style={{ width: 160, textAlign: 'right' }}
              onChange={e => set({ panicUrl: e.target.value.trim() || 'https://google.com' })}
            />
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
