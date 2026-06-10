import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoomAPI } from '../hooks/useRoomAPI'
import { useGameStore } from '../store/useGameStore'
import type { Room } from '../types/game'
import { v4 as uuidv4 } from 'uuid'

export default function LobbyPage() {
  const navigate = useNavigate()
  const { listRooms, createRoom, joinRoom } = useRoomAPI()
  const { userId, nickname, setUser, setRoom } = useGameStore()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [localNickname, setLocalNickname] = useState(nickname)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      setUser(uuidv4(), '')
    }
    loadRooms()
  }, [])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const data = await listRooms()
      setRooms(data)
    } catch {
      setError('加载房间列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!roomName.trim() || !localNickname.trim()) return
    setError('')
    try {
      const data = await createRoom({
        name: roomName.trim(),
        password: roomPassword.trim() || undefined,
        host_id: userId,
        host_nickname: localNickname.trim(),
      })
      setUser(userId, localNickname.trim())
      setRoom(data)
      navigate(`/room/${data.id}`)
    } catch {
      setError('创建房间失败')
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim() || !localNickname.trim()) return
    setError('')
    try {
      const data = await joinRoom({
        code: joinCode.trim().toUpperCase(),
        password: joinPassword.trim() || undefined,
        user_id: userId,
        nickname: localNickname.trim(),
      })
      setUser(userId, localNickname.trim())
      setRoom(data)
      navigate(`/room/${data.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.detail || '加入房间失败')
    }
  }

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center px-4 py-10">
      <div className="w-16 h-[2px] bg-wood/40 mb-6" />
      <header className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-wood tracking-[0.2em] mb-2" style={{ fontFamily: 'serif' }}>
          游戏大厅
        </h1>
        <p className="text-sm text-gray-500 tracking-wide">
          创建或加入一个剧本杀房间
        </p>
      </header>

      {/* 昵称输入 */}
      <div className="w-full max-w-md mb-6">
        <label className="block text-xs text-wood/70 mb-1 tracking-wider">你的昵称</label>
        <input
          type="text"
          value={localNickname}
          onChange={(e) => setLocalNickname(e.target.value)}
          placeholder="输入昵称..."
          className="w-full px-4 py-3 bg-white/80 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/30 ink-border"
          maxLength={20}
        />
      </div>

      {/* 操作按钮 */}
      <div className="w-full max-w-md flex gap-3 mb-8">
        <button
          onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
          className="flex-1 py-3 bg-wood text-white rounded-xl text-sm font-medium active:scale-95 transition-all shadow-sm"
        >
          创建房间
        </button>
        <button
          onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
          className="flex-1 py-3 bg-white text-wood rounded-xl text-sm font-medium ink-border active:scale-95 transition-all"
        >
          加入房间
        </button>
      </div>

      {error && (
        <div className="w-full max-w-md mb-4 px-4 py-2 bg-cinnabar/10 text-cinnabar text-xs rounded-lg text-center">
          {error}
        </div>
      )}

      {/* 创建房间弹窗 */}
      {showCreate && (
        <div className="w-full max-w-md space-y-3 animate-fade-in-up mb-6">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="房间名称"
            className="w-full px-4 py-3 bg-white/80 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/30 ink-border"
            maxLength={30}
          />
          <input
            type="password"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            placeholder="房间密码（可选）"
            className="w-full px-4 py-3 bg-white/80 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/30 ink-border"
            maxLength={20}
          />
          <button
            onClick={handleCreate}
            disabled={!roomName.trim() || !localNickname.trim()}
            className="w-full py-3 bg-wood text-white rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 transition-all"
          >
            确认创建
          </button>
        </div>
      )}

      {/* 加入房间弹窗 */}
      {showJoin && (
        <div className="w-full max-w-md space-y-3 animate-fade-in-up mb-6">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="房间代码（6位）"
            className="w-full px-4 py-3 bg-white/80 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/30 ink-border tracking-widest text-center font-mono"
            maxLength={6}
          />
          <input
            type="password"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            placeholder="房间密码（如有）"
            className="w-full px-4 py-3 bg-white/80 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/30 ink-border"
            maxLength={20}
          />
          <button
            onClick={handleJoin}
            disabled={!joinCode.trim() || !localNickname.trim()}
            className="w-full py-3 bg-wood text-white rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 transition-all"
          >
            确认加入
          </button>
        </div>
      )}

      {/* 房间列表 */}
      <div className="w-full max-w-md">
        <h3 className="text-xs text-wood/60 mb-3 tracking-wider">等待中的房间</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">载入中……</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">暂无等待中的房间</div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 bg-white/80 rounded-xl ink-border"
              >
                <div>
                  <h4 className="text-sm font-bold text-ink">{room.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    代码 <span className="font-mono text-wood/70">{room.code}</span> · {room.players.length}/{room.max_players} 人
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowJoin(true)
                    setShowCreate(false)
                    setJoinCode(room.code)
                    setError('')
                  }}
                  disabled={room.players.length >= room.max_players}
                  className="px-4 py-2 bg-wood text-white rounded-lg text-xs disabled:opacity-40 active:scale-95 transition-all"
                >
                  {room.players.length >= room.max_players ? '已满' : '加入'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-auto pt-10 pb-4 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-xs text-gray-400 hover:text-wood transition-colors"
        >
          ← 返回首页
        </button>
      </footer>
    </div>
  )
}
