import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useRoomAPI } from '../hooks/useRoomAPI'
import { useGameStore } from '../store/useGameStore'
import type { Character } from '../types'

export default function RoleAssignmentPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { getRoom, assignRole } = useRoomAPI()
  const { userId, currentRoom, players, setRoom, setPlayers } = useGameStore()

  const [characters, setCharacters] = useState<Character[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!roomId || !userId) return
    loadData()
  }, [roomId, userId])

  const loadData = async () => {
    try {
      const [roomRes, charRes]: [any, any] = await Promise.all([
        getRoom(roomId!),
        client.get('/characters'),
      ])
      setRoom(roomRes)
      setPlayers(roomRes.players)
      setCharacters(charRes.data || [])

      // Init assignments from current state
      const current: Record<string, string> = {}
      roomRes.players.forEach((p: any) => {
        if (p.character_id) current[p.user_id] = p.character_id
      })
      setAssignments(current)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (targetUserId: string, characterId: string) => {
    if (!roomId) return
    setSaving(true)
    try {
      const room = await assignRole(roomId, userId, targetUserId, characterId)
      setRoom(room)
      setPlayers(room.players)
      setAssignments((prev) => ({ ...prev, [targetUserId]: characterId }))
    } catch {
      alert('分配失败，该角色可能已被占用')
    } finally {
      setSaving(false)
    }
  }

  const isHost = currentRoom?.host_id === userId
  const nonHostPlayers = players.filter((p) => !p.is_host)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-texture">
        <div className="w-8 h-8 border-2 border-wood/30 border-t-wood rounded-full animate-spin" />
      </div>
    )
  }

  if (!isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-texture">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">只有主持人可以分配角色</p>
          <button
            onClick={() => navigate(`/room/${roomId}`)}
            className="px-4 py-2 bg-wood text-white rounded-lg text-sm"
          >
            返回房间
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center px-4 py-10">
      <div className="w-16 h-[2px] bg-wood/40 mb-6" />
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-wood tracking-wider" style={{ fontFamily: 'serif' }}>
          分配角色
        </h1>
        <p className="text-xs text-gray-400 mt-1">为每位玩家分配一个剧本角色</p>
      </header>

      <div className="w-full max-w-md space-y-4 mb-8">
        {nonHostPlayers.map((player) => (
          <div
            key={player.user_id}
            className="p-4 bg-white/80 rounded-xl ink-border flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-sm font-serif text-wood/80 shrink-0 border border-stone-200">
              {player.nickname[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink">{player.nickname}</p>
              <p className="text-[11px] text-gray-400">
                {player.character_name ? `已分配：${player.character_name}` : '未分配角色'}
              </p>
            </div>
            <select
              value={assignments[player.user_id] || ''}
              onChange={(e) => handleAssign(player.user_id, e.target.value)}
              disabled={saving}
              className="text-xs px-2 py-1.5 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:ring-1 focus:ring-wood/30"
            >
              <option value="">选择角色</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.title}
                </option>
              ))}
            </select>
          </div>
        ))}

        {nonHostPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无其他玩家加入
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/room/${roomId}`)}
        className="px-6 py-2.5 bg-wood text-white rounded-xl text-sm active:scale-95 transition-all"
      >
        完成分配，返回房间
      </button>
    </div>
  )
}
