import { useState } from 'react'
import { clearActiveMatch } from '../services/activeMatch'

export function StopMatchControl({ className = '' }) {
  const [open, setOpen] = useState(false)
  function stop() { clearActiveMatch(); setOpen(false) }
  return <><button className={`stop-match-button ${className}`} onClick={() => setOpen(true)}>Stop Match</button>{open && <div className="stop-modal-backdrop" role="presentation"><div className="stop-modal" role="dialog" aria-modal="true" aria-labelledby="stop-match-title"><p className="eyebrow">Active match</p><h2 id="stop-match-title">Stop this match?</h2><p>You will no longer see this match as an active match on this device.</p><div className="stop-modal-actions"><button className="button button-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="button button-danger" onClick={stop}>Stop Match</button></div></div></div>}</>
}
