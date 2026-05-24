export async function createRoom(roomType, ttlSeconds) {
  const res = await fetch('/api/v1/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      privacy_mode: 'extreme',
      ttl_seconds: ttlSeconds,
      room_type: roomType,
    }),
  })
  if (!res.ok) throw new Error('Failed to create room')
  return res.json()
}
