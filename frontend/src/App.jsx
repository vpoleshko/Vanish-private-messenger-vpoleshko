import { useEffect, useState } from 'react'
import { useVanish } from './useVanish'
import Landing    from './screens/Landing'
import Creating   from './screens/Creating'
import Waiting    from './screens/Waiting'
import Connecting from './screens/Connecting'
import Chat       from './screens/Chat'
import Error      from './screens/Error'
import NotFound   from './screens/NotFound'

const KNOWN_PATHS = /^\/($|r\/[^/?#]+)/

export default function App() {
  const vanish = useVanish()
  const { state, set, connectWS } = vanish
  const [notFound, setNotFound] = useState(() => !KNOWN_PATHS.test(location.pathname))

  // Handle invite URL on first load
  useEffect(() => {
    if (notFound) return
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

  if (notFound) return <NotFound />

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
