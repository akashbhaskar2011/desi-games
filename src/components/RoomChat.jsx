import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'

function ChatPanel({ messages, playerId, disabled, error, onSend, onClose, drawer = false }) {
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [messages])
  function submit(event) { event.preventDefault(); const message = draft.trim(); if (!message || disabled) return; onSend(message); setDraft('') }
  return <section className={`room-chat ${drawer ? 'room-chat-drawer' : ''}`} aria-label="Room chat"><header className="room-chat-header"><div><MessageCircle size={17} /><strong>Room Chat</strong></div>{onClose && <button onClick={onClose} aria-label="Close chat"><X size={18} /></button>}</header><div className="room-chat-messages" aria-live="polite">{messages.length === 0 && <p className="room-chat-empty">Say hello to your opponent.</p>}{messages.map((item) => <article className={`chat-message ${item.playerId === playerId ? 'chat-message-own' : ''}`} key={item.id}><strong>{item.playerId === playerId ? 'You' : item.playerName}</strong><p>{item.message}</p><time>{new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></article>)}<div ref={endRef} /></div>{error && <p className="room-chat-error">{error}</p>}<form className="room-chat-form" onSubmit={submit}><input aria-label="Message" value={draft} maxLength="200" disabled={disabled} onChange={(event) => setDraft(event.target.value)} placeholder={disabled ? 'Chat is unavailable' : 'Message…'} /><button type="submit" disabled={disabled || !draft.trim()} aria-label="Send message"><Send size={16} /></button></form></section>
}

export function RoomChat({ messages, playerId, disabled, error, onSend }) {
  const [open, setOpen] = useState(false)
  return <><div className="room-chat-desktop"><ChatPanel messages={messages} playerId={playerId} disabled={disabled} error={error} onSend={onSend} /></div><button className="room-chat-toggle" onClick={() => setOpen(true)}><MessageCircle size={17} /> Chat{messages.length ? <span>{messages.length}</span> : null}</button>{open && <div className="room-chat-backdrop"><ChatPanel drawer messages={messages} playerId={playerId} disabled={disabled} error={error} onSend={onSend} onClose={() => setOpen(false)} /></div>}</>
}
