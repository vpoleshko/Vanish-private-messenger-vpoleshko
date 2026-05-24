import { useReducer, useRef, useCallback } from 'react'
import { createRoom as apiCreateRoom } from './api'
import { closeTab } from './closeTab'

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
  panicUrl:    'https://google.com',
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
  const wsRef    = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const set = useCallback(payload => dispatch({ type: 'SET', payload }), [])

  const appendMsg = useCallback(msg => dispatch({ type: 'APPEND_MSG', msg }), [])

  const sysMsg = useCallback(text =>
    dispatch({ type: 'APPEND_MSG', msg: { system: true, text, time: new Date() } }), [])

  const handleWsMsg = useCallback(raw => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    const s = stateRef.current

    switch (msg.type) {
      case 'join_room_ack':
        if (msg.status === 'waiting_for_peer') {
          set({ screen: 'waiting' })
        } else {
          set({ screen: 'chat', peerId: msg.peer_id, peerPeerId: msg.peer?.peer_id,
                expiresAt: new Date(msg.room_expires_at) })
          dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Peer connected.', time: new Date() } })
        }
        if (!s.expiresAt) set({ expiresAt: new Date(msg.room_expires_at), peerId: msg.peer_id })
        break

      case 'peer_joined':
        set({ screen: 'chat', peerPeerId: msg.peer_id })
        dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Peer connected.', time: new Date() } })
        break

      case 'message':
        dispatch({ type: 'APPEND_MSG', msg: { mine: false, text: msg.text, time: new Date() } })
        break

      case 'peer_left':
        dispatch({ type: 'APPEND_MSG', msg: { system: true, text: 'Peer disconnected.', time: new Date() } })
        break

      case 'room_destroyed':
        closeTab(stateRef.current.panicUrl)
        break

      case 'error':
        if (s.screen !== 'chat') set({ screen: 'error', errorMsg: msg.message || msg.code })
        else dispatch({ type: 'APPEND_MSG', msg: { system: true, text: `Error: ${msg.message}`, time: new Date() } })
        break

      default: break
    }
  }, [set])

  const connectWS = useCallback((roomCode, myToken) => {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${location.host}/ws`)
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({
      type:         'join_room',
      room_code:    roomCode,
      invite_token: myToken,
      public_key:   'placeholder',
    }))

    ws.onmessage = ({ data }) => handleWsMsg(data)

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

      set({
        roomCode,
        myToken,
        peerUrl:   data.invite_url,
        expiresAt: new Date(data.expires_at),
        screen:    'waiting',
      })

      connectWS(roomCode, myToken)
    } catch {
      set({ screen: 'error', errorMsg: 'Could not create room. Is the server running?' })
    }
  }, [connectWS, set])

  const sendMsg = useCallback(text => {
    const ws = wsRef.current
    if (!text.trim() || !ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'send_message', text }))
    dispatch({ type: 'APPEND_MSG', msg: { mine: true, text, time: new Date() } })
  }, [])

  const destroyRoom = useCallback(() => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'destroy_room' }))
    closeTab(stateRef.current.panicUrl)
  }, [])

  const leaveRoom = useCallback(() => {
    wsRef.current?.close()
    dispatch({ type: 'RESET' })
    history.pushState(null, '', '/')
  }, [])

  return { state, set, createRoom, sendMsg, destroyRoom, leaveRoom, connectWS }
}
