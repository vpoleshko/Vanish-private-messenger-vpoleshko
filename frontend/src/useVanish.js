import { useReducer, useRef, useCallback, useEffect } from 'react'
import { createRoom as apiCreateRoom } from './api'
import { closeTab } from './closeTab'
import { E2EERatchet, fromBase64 } from './crypto.js'

const PANIC_URL = 'https://google.com'

const INIT = {
  screen:      'landing',
  roomCode:    null,
  myToken:     null,
  peerUrl:     null,
  peerId:      null,
  peerPeerId:  null,
  expiresAt:   null,
  roomType:    'text',
  messages:    [],
  errorMsg:    '',
  ttlMinutes:  60,
  safetyCode:  null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET':        return { ...state, ...action.payload }
    case 'APPEND_MSG': return { ...state, messages: [...state.messages, action.msg] }
    case 'RESET':      return { ...INIT }
    default:           return state
  }
}

export function useVanish() {
  const [state, dispatch] = useReducer(reducer, INIT)
  const wsRef      = useRef(null)
  const stateRef   = useRef(state)
  const voiceRef   = useRef(null)
  const keyPairRef = useRef(null)   // X25519 keypair, generated once
  const ratchetRef = useRef(null)   // E2EERatchet, created when peer joins
  stateRef.current = state

  // Init libsodium + generate keypair on mount
  useEffect(() => {
    E2EERatchet.init().then(() => {
      keyPairRef.current = E2EERatchet.generateX25519KeyPair()
    })
    return () => { ratchetRef.current?.destroy() }
  }, [])

  // Client-side expiry safety net
  useEffect(() => {
    if (!state.expiresAt) return
    const ms = state.expiresAt - Date.now()
    if (ms <= 0) { closeTab(PANIC_URL); return }
    const id = setTimeout(() => closeTab(PANIC_URL), ms)
    return () => clearTimeout(id)
  }, [state.expiresAt]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback(payload => dispatch({ type: 'SET', payload }), [])

  // Creates ratchet from peer's public key — destroys room for both if key exchange fails
  const initRatchet = useCallback(async (myPeerId, theirPeerId, theirPublicKeyB64) => {
    try {
      if (!keyPairRef.current) throw new Error('keypair not ready')
      const ratchet = await E2EERatchet.create({
        roomId:         stateRef.current.roomCode,
        myPeerId,
        theirPeerId,
        myKeyPair:      keyPairRef.current,
        theirPublicKey: fromBase64(theirPublicKeyB64),
      })
      ratchetRef.current = ratchet
      set({ safetyCode: ratchet.safetyCode })
    } catch {
      // key exchange failed — no unencrypted fallback, destroy room for both
      const ws = wsRef.current
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'destroy_room' }))
      ratchetRef.current?.destroy()
      closeTab(PANIC_URL)
    }
  }, [set])

  const handleWsMsg = useCallback(raw => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    const s = stateRef.current

    switch (msg.type) {
      case 'join_room_ack':
        if (msg.status === 'waiting_for_peer') {
          set({ screen: 'waiting', roomType: msg.room_type, expiresAt: new Date(msg.room_expires_at), peerId: msg.peer_id })
        } else {
          set({ screen: 'chat', peerId: msg.peer_id, peerPeerId: msg.peer?.peer_id,
                roomType: msg.room_type, expiresAt: new Date(msg.room_expires_at) })
          dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Peer connected.', time: new Date() } })
          // Invitee: peer key is already in ack
          if (msg.peer?.public_key) initRatchet(msg.peer_id, msg.peer.peer_id, msg.peer.public_key)
        }
        break

      case 'peer_joined':
        set({ screen: 'chat', peerPeerId: msg.peer_id })
        dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Peer connected.', time: new Date() } })
        // Creator: peer key arrives here
        if (msg.public_key) initRatchet(stateRef.current.peerId, msg.peer_id, msg.public_key)
        break

      case 'peer_left':
        set({ peerPeerId: null })
        dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Peer disconnected.', time: new Date() } })
        break

      case 'room_destroyed':
        closeTab(PANIC_URL)
        break

      case 'error':
        if (s.screen !== 'chat') set({ screen: 'error', errorMsg: msg.message || msg.code })
        else dispatch({ type: 'APPEND_MSG', msg: { system: true, text: `Error: ${msg.message}`, time: new Date() } })
        break

      default: break
    }
  }, [set, initRatchet])

  const connectWS = useCallback((roomCode, myToken) => {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${location.host}/ws`)
    ws.binaryType = 'arraybuffer'
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({
      type:         'join_room',
      room_code:    roomCode,
      invite_token: myToken,
      public_key:   keyPairRef.current?.publicKeyBase64,
    }))

    ws.onmessage = async ({ data }) => {
      if (data instanceof ArrayBuffer) {
        const view = new Uint8Array(data)
        const type = view[0]

        if (type === 0x01) {
          if (!ratchetRef.current) return
          const raw = new TextDecoder().decode(view.slice(1))
          let text
          try {
            const packet = JSON.parse(raw)
            text = await ratchetRef.current.decryptText(packet)
          } catch {
            text = '[decryption failed]'
          }
          dispatch({ type: 'APPEND_MSG', msg: { mine: false, text, time: new Date() } })

        } else if (type === 0x02) {
          if (!ratchetRef.current) return
          let chunk
          try { chunk = ratchetRef.current.decryptVoice(data.slice(1)) } catch { return }
          voiceRef.current?.(chunk)
        }
      } else {
        handleWsMsg(data)
      }
    }

    ws.onclose = () => {
      if (stateRef.current.screen === 'chat')
        dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Connection closed.', time: new Date() } })
    }

    ws.onerror = () => {
      if (stateRef.current.screen !== 'chat')
        set({ screen: 'error', errorMsg: 'WebSocket error. Is the server running?' })
    }
  }, [handleWsMsg, set])

  const createRoom = useCallback(async () => {
    const { roomType, ttlMinutes } = stateRef.current
    set({ screen: 'creating' })
    try {
      const data = await apiCreateRoom(roomType, ttlMinutes * 60)
      const myUrl = new URL(data.my_url, location.origin)
      const rm    = myUrl.pathname.match(/\/r\/([^/?#]+)/)
      const inv   = myUrl.hash.match(/invite=([^&]+)/)

      const roomCode = rm[1]
      const myToken  = decodeURIComponent(inv[1])

      history.replaceState(null, '', '/')
      set({ roomCode, myToken, peerUrl: data.invite_url, screen: 'waiting' })
      connectWS(roomCode, myToken)
    } catch {
      set({ screen: 'error', errorMsg: 'Could not create room. Is the server running?' })
    }
  }, [connectWS, set])

  const sendMsg = useCallback(async text => {
    const ws = wsRef.current
    if (!text.trim() || !ws || ws.readyState !== WebSocket.OPEN) return

    if (!ratchetRef.current) return
    const packet = await ratchetRef.current.encryptText(text)
    const payload = new TextEncoder().encode(JSON.stringify(packet))

    const buf = new Uint8Array(1 + payload.length)
    buf[0] = 0x01
    buf.set(payload, 1)
    ws.send(buf)
    dispatch({ type: 'APPEND_MSG', msg: { mine: true, text, time: new Date() } })
  }, [])

  const sendVoice = useCallback(audioBuffer => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    if (!ratchetRef.current) return
    const payload = ratchetRef.current.encryptVoice(new Uint8Array(audioBuffer))

    const buf = new Uint8Array(1 + payload.length)
    buf[0] = 0x02
    buf.set(payload, 1)
    ws.send(buf)
  }, [])

  const destroyRoom = useCallback(() => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'destroy_room' }))
    ratchetRef.current?.destroy()
    closeTab(PANIC_URL)
  }, [])

  const leaveRoom = useCallback(() => {
    wsRef.current?.close()
    ratchetRef.current?.destroy()
    ratchetRef.current = null
    dispatch({ type: 'RESET' })
    history.pushState(null, '', '/')
  }, [])

  return { state, set, createRoom, sendMsg, sendVoice, voiceRef, destroyRoom, leaveRoom, connectWS }
}
