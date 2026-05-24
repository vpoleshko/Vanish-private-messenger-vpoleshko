import { useEffect } from 'react'
import { useVanish } from './useVanish'
import Landing    from './screens/Landing'
import Creating   from './screens/Creating'
import Waiting    from './screens/Waiting'
import Connecting from './screens/Connecting'
import Chat       from './screens/Chat'
import Error      from './screens/Error'

export default function App() {
  const vanish = useVanish()
  const { state, set, connectWS } = vanish

  // Handle invite URL on first load
  useEffect(() => {
    const m = location.pathname.match(/^\/r\/([^/?#]+)/)
    if (!m) return
    const inv = location.hash.match(/invite=([^&]+)/)
    if (!inv) { set({ screen: 'error', errorMsg: 'Invite token missing from URL.' }); return }

    const roomCode = m[1]
    const myToken  = decodeURIComponent(inv[1])

    history.replaceState(null, '', '/')
    set({ roomCode, myToken, screen: 'connecting' })
    connectWS(roomCode, myToken)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const screens = {
    landing:    <Landing    {...vanish} />,
    creating:   <Creating />,
    waiting:    <Waiting    {...vanish} />,
    connecting: <Connecting />,
    chat:       <Chat       {...vanish} />,
    error:      <Error      {...vanish} />,
  }

  return screens[state.screen] ?? screens.landing
}
