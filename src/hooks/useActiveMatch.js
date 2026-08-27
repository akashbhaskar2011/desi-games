import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react'
import { getActiveMatch, updateActiveMatch, verifyActiveMatch } from '../services/activeMatch'

const ActiveMatchContext = createContext(null)

export function ActiveMatchProvider({ children }) {
  const [match, setMatch] = useState(() => getActiveMatch())
  useEffect(() => {
    let alive = true
    const refresh = () => { const local = getActiveMatch(); setMatch(local); if (local) verifyActiveMatch().then((verified) => { if (alive) setMatch(verified) }).catch((error) => { if (error.status === 404 && alive) setMatch(null) }) }
    refresh(); window.addEventListener('desi-active-match-change', refresh); window.addEventListener('storage', refresh)
    return () => { alive = false; window.removeEventListener('desi-active-match-change', refresh); window.removeEventListener('storage', refresh) }
  }, [])
  const value = useMemo(() => ({ match, setMatch: (patch) => setMatch(updateActiveMatch(patch)) }), [match])
  return createElement(ActiveMatchContext.Provider, { value }, children)
}

export function useActiveMatch() { return useContext(ActiveMatchContext) || { match: getActiveMatch(), setMatch: () => {} } }