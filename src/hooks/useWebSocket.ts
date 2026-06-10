import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import type { RoomMessage, Player, Clue, Room } from '../types/game'

export function useWebSocket(roomId: string | undefined) {
  const {
    userId,
    nickname,
    setMessages,
    addMessage,
    setPlayers,
    addPlayer,
    removePlayer,
    updatePlayerReady,
    setClues,
    addClue,
    updateClue,
    setPhase,
    setRoom,
    setWs,
    setWsStatus,
  } = useGameStore()

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectCount = useRef(0)

  const connect = useCallback(() => {
    if (!roomId || !userId) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/api/v1/ws/rooms/${roomId}?user_id=${encodeURIComponent(userId)}&nickname=${encodeURIComponent(nickname)}`

    setWsStatus('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    setWs(ws)

    ws.onopen = () => {
      setWsStatus('open')
      reconnectCount.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleServerMessage(data)
      } catch {
        // ignore invalid JSON
      }
    }

    ws.onclose = () => {
      setWsStatus('closed')
      setWs(null)
      wsRef.current = null
      // Exponential backoff reconnect
      const delay = Math.min(1000 * 2 ** reconnectCount.current, 30000)
      reconnectCount.current++
      reconnectTimer.current = setTimeout(() => {
        connect()
      }, delay)
    }

    ws.onerror = () => {
      setWsStatus('error')
    }
  }, [roomId, userId, nickname])

  const handleServerMessage = useCallback((data: any) => {
    const event = data.event
    const payload = data.payload || {}

    switch (event) {
      case 'room_state': {
        const state = payload
        if (state.room) {
          setRoom(state.room as Room)
          setPlayers(state.players || [])
          setMessages(state.messages || [])
          setClues(state.clues || [])
          setPhase(state.current_phase)
        }
        break
      }
      case 'player_joined': {
        if (payload.player) {
          addPlayer(payload.player as Player)
        }
        break
      }
      case 'player_left': {
        if (payload.user_id) {
          removePlayer(payload.user_id)
        }
        break
      }
      case 'chat': {
        if (payload.message) {
          addMessage(payload.message as RoomMessage)
        }
        break
      }
      case 'phase_changed': {
        if (payload.phase) {
          setPhase(payload.phase)
          if (payload.system_message) {
            addMessage(payload.system_message as RoomMessage)
          }
        }
        break
      }
      case 'clue_issued': {
        if (payload.clue) {
          const clue = payload.clue as Clue
          addClue(clue)
          updateClue(clue.id, { is_issued: true, issued_at: clue.issued_at })
          if (payload.system_message) {
            addMessage(payload.system_message as RoomMessage)
          }
        }
        break
      }
      case 'player_ready': {
        updatePlayerReady(payload.user_id, payload.is_ready)
        break
      }
      case 'error': {
        console.error('WS error:', payload)
        break
      }
      default:
        break
    }
  }, [setRoom, setPlayers, setMessages, setClues, setPhase, addPlayer, removePlayer, addMessage, addClue, updateClue, updatePlayerReady])

  const sendMessage = useCallback((event: string, payload: Record<string, any> = {}) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, payload, timestamp: Math.floor(Date.now() / 1000) }))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setWs(null)
    setWsStatus('idle')
  }, [setWs, setWsStatus])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    sendMessage,
    disconnect,
    ws: wsRef.current,
  }
}
