export default function Landing({ state, set, createRoom }) {
  const { roomType, ttlMinutes, panicUrl } = state

  return (
    <div className="center">
      <div className="logo">VANISH</div>

      <div className="form-card">

        {/* Room type */}
        <div>
          <div className="form-label">Room type</div>
          <div className="room-type-grid">
            <RoomTypeCard
              icon="💬"
              name="Text"
              desc="Send encrypted messages"
              value="text"
              selected={roomType === 'text'}
              onClick={() => set({ roomType: 'text' })}
            />
            <RoomTypeCard
              icon="🎤"
              name="Voice"
              desc="Encrypted voice call"
              value="voice"
              selected={roomType === 'voice'}
              soon
              onClick={() => set({ roomType: 'voice' })}
            />
          </div>
        </div>

        {/* TTL */}
        <div>
          <div className="form-label">Room duration</div>
          <div className="field-row">
            <span className="field-label">Expires after</span>
            <input
              className="field-input"
              type="number"
              min={1}
              max={10080}
              value={ttlMinutes}
              style={{ textAlign: 'right', width: 64 }}
              onChange={e => {
                const v = parseInt(e.target.value)
                if (v > 0) set({ ttlMinutes: v })
              }}
            />
            <span className="field-unit">min</span>
          </div>
        </div>

        {/* Panic URL */}
        <div>
          <div className="form-label">After destroy, redirect to</div>
          <div className="field-row">
            <input
              className="field-input"
              type="url"
              value={panicUrl}
              placeholder="https://google.com"
              onChange={e => set({ panicUrl: e.target.value.trim() || 'https://google.com' })}
            />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={createRoom}>
          Create Room
        </button>
      </div>
    </div>
  )
}

function RoomTypeCard({ icon, name, desc, value, selected, soon, onClick }) {
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
