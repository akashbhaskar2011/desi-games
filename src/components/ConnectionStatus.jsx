import { Wifi, WifiOff } from 'lucide-react'

export function ConnectionStatus({ state }) {
  const connected = state === 'connected'
  return <span className={`connection-status ${connected ? 'connection-good' : ''}`}>{connected ? <Wifi size={14} /> : <WifiOff size={14} />}{connected ? 'Connected' : 'Reconnecting…'}</span>
}