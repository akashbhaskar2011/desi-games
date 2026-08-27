import { Check, Copy, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export function ShareButtons({ roomCode, gameName }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/join/${roomCode}`
  async function copy() { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  const message = `🎮 Join my Desi Games room!\n\nGame: ${gameName}\n\nJoin here:\n${url}\n\nNo login required.`
  return <div className="share-buttons"><button className="button button-secondary" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy link'}</button><a className="button button-whatsapp" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a></div>
}