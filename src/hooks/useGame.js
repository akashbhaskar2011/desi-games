import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { SERVER_URL } from '../lib/api'
import { getAnonymousPlayerId } from '../lib/identity'
import { clearActiveMatch, updateActiveMatch } from '../services/activeMatch'

export function useGame(roomCode) {
  const [state, setState] = useState(null); const [connection, setConnection] = useState('connecting'); const [error, setError] = useState(''); const [retryKey, setRetryKey] = useState(0); const playerId = getAnonymousPlayerId(); const socketRef = useRef(null)
  useEffect(() => {
    setState(null); setError(''); setConnection('connecting')
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'], reconnection: true })
    socketRef.current = socket
    socket.on('connect', () => { setConnection('connected'); updateActiveMatch({ lastConnection: 'connected', roomStatus: 'PLAYING' }); socket.emit('room:join', { roomCode, playerId }); socket.emit('game:request-state', { roomCode }) })
    socket.on('disconnect', () => { setConnection('reconnecting'); setError('Reconnecting to your match…') })
    socket.on('connect_error', () => { setConnection('disconnected'); setError('Unable to reconnect to this match.') })
    socket.on('game:state', (nextState) => { setState(nextState); updateActiveMatch({ gameId: nextState.gameId, status: nextState.status === 'finished' ? 'finished' : 'active', players: nextState.players, ...(nextState.status === 'finished' ? { finishedAt: new Date().toISOString(), winner: nextState.winner, winnerRole: nextState.winnerRole } : {}) }) })
    socket.on('room:error', (payload) => { if (payload.code === 'ROOM_NOT_FOUND') clearActiveMatch(); setError(payload.message || 'This match is no longer available.') })
    socket.on('game:error', (payload) => { if (payload.code === 'ROOM_NOT_FOUND') clearActiveMatch(); setError(payload.message || 'Unable to recover this match.') })
    return () => { socket.disconnect(); socketRef.current = null }
  }, [roomCode, playerId, retryKey])
  function move(from, to) { socketRef.current?.emit('game:move', { from, to }) }
  function rematch() { socketRef.current?.emit('game:rematch-request') }
  return { state, connection, error, playerId, move, rematch, retry: () => setRetryKey((key) => key + 1), clearError: () => setError('') }
}