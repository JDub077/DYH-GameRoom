import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useRoomAPI } from '../hooks/useRoomAPI'
import { useWebSocket } from '../hooks/useWebSocket'
import AISidePanel from '../components/AISidePanel'

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { getRoom, getMessages, leaveRoom, listClues } = useRoomAPI()
  const { sendMessage, disconnect } = useWebSocket(roomId)

  const {
    userId,
    nickname,
    currentRoom,
    players,
    messages,
    clues,
    currentPhase,
    wsStatus,
    setRoom,
    setPlayers,
    setMessages,
    setClues,
    setPhase,
    reset,
  } = useGameStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [showClues, setShowClues] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roomId || !userId) return
    loadRoomData()
    return () => {
      disconnect()
    }
  }, [roomId, userId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const loadRoomData = async () => {
    try {
      const room = await getRoom(roomId!)
      setRoom(room)
      setPlayers(room.players)
      setPhase(room.current_phase)
      const [msgs, cls] = await Promise.all([
        getMessages(roomId!, 100),
        listClues(roomId!),
      ])
      setMessages(msgs)
      setClues(cls)
    } catch {
      setError('加载房间信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage('chat', { content: input.trim() })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLeave = async () => {
    if (!roomId || !userId) return
    try {
      await leaveRoom(roomId, userId)
      disconnect()
      reset()
      navigate('/lobby')
    } catch {
      setError('离开房间失败')
    }
  }

  const handlePhaseChange = (phase: string) => {
    sendMessage('phase_change', { phase })
  }

  const handleIssueClue = (clueId: string) => {
    sendMessage('issue_clue', { clue_id: clueId })
  }

  const isHost = currentRoom?.host_id === userId
  const myPlayer = players.find((p) => p.user_id === userId)
  const myCharacter = myPlayer?.character_name
  const myCharacterId = myPlayer?.character_id

  const phaseLabels: Record<string, string> = {
    waiting: '等待中',
    opening: '开场',
    search_1: '第一轮搜证',
    discuss_1: '第一轮讨论',
    search_2: '第二轮搜证',
    discuss_2: '第二轮讨论',
    final: '最终讨论',
    closed: '游戏结束',
  }

  const wsStatusLabel: Record<string, { text: string; color: string }> = {
    idle: { text: '未连接', color: 'bg-gray-300' },
    connecting: { text: '连接中', color: 'bg-yellow-400' },
    open: { text: '在线', color: 'bg-jade' },
    closed: { text: '已断开', color: 'bg-gray-300' },
    error: { text: '错误', color: 'bg-cinnabar' },
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center paper-texture">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-wood/30 border-t-wood rounded-full animate-spin" />
          <span className="text-sm tracking-wider">进入房间……</span>
        </div>
      </div>
    )
  }

  if (error || !currentRoom) {
    return (
      <div className="h-screen flex items-center justify-center paper-texture">
        <div className="text-center">
          <p className="text-sm text-cinnabar mb-4">{error || '房间不存在'}</p>
          <button
            onClick={() => navigate('/lobby')}
            className="px-4 py-2 bg-wood text-white rounded-lg text-sm"
          >
            返回大厅
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col paper-texture relative">
      {/* 顶部栏 */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-wood/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={handleLeave}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-wood hover:bg-stone-200 transition-colors text-sm"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-ink truncate" style={{ fontFamily: 'serif' }}>
              {currentRoom.name}
            </h2>
            <p className="text-[11px] text-gray-400 truncate">
              代码 {currentRoom.code} · {phaseLabels[currentPhase] || currentPhase}
              {isHost && ' · 主持人'}
              {myCharacter && ` · ${myCharacter}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${wsStatusLabel[wsStatus]?.color || 'bg-gray-300'} animate-pulse`} />
            <span className="text-[10px] text-gray-400">{wsStatusLabel[wsStatus]?.text}</span>
          </div>
        </div>
      </div>

      {/* 玩家列表 */}
      <div className="shrink-0 bg-white/60 border-b border-wood/10 px-4 py-2">
        <div className="max-w-xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {players.map((p) => (
            <div
              key={p.user_id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs whitespace-nowrap ${
                p.is_host
                  ? 'bg-wood/10 border-wood/20 text-wood'
                  : 'bg-white border-stone-200 text-gray-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-jade" />
              <span className="font-medium">{p.nickname}</span>
              {p.character_name && (
                <span className="text-[10px] text-wood/70">({p.character_name})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 主持人控制栏 */}
      {isHost && (
        <div className="shrink-0 bg-white/80 border-b border-wood/10 px-4 py-2">
          <div className="max-w-xl mx-auto flex gap-2 flex-wrap">
            {Object.entries(phaseLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handlePhaseChange(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                  currentPhase === key
                    ? 'bg-wood text-white'
                    : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setShowClues((s) => !s)}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-100 text-gray-600 hover:bg-stone-200 transition-all ml-auto"
            >
              {showClues ? '隐藏线索' : '管理线索'}
            </button>
          </div>
        </div>
      )}

      {/* 线索面板 */}
      {showClues && (
        <div className="shrink-0 bg-white/90 border-b border-wood/10 px-4 py-3 animate-fade-in-up">
          <div className="max-w-xl mx-auto">
            <h4 className="text-xs font-bold text-wood mb-2">线索卡</h4>
            {clues.length === 0 ? (
              <p className="text-[11px] text-gray-400">暂无线索</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                {clues.map((clue) => (
                  <div
                    key={clue.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      clue.is_issued
                        ? 'bg-paper border-wood/10'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{clue.title}</span>
                      {isHost && !clue.is_issued && (
                        <button
                          onClick={() => handleIssueClue(clue.id)}
                          className="px-2 py-0.5 bg-wood text-white rounded text-[10px] active:scale-95 transition-all"
                        >
                          发放
                        </button>
                      )}
                    </div>
                    <p className="text-gray-500 mt-0.5 line-clamp-2">{clue.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-16 animate-fade-in-up">
            <div className="w-16 h-[1px] bg-wood/20 mx-auto mb-6" />
            <p className="text-sm text-gray-400 tracking-wider mb-1">房间已就绪</p>
            <p className="text-xs text-gray-300">
              {isHost ? '切换阶段以开始游戏' : '等待主持人开始游戏'}
            </p>
            <div className="w-16 h-[1px] bg-wood/20 mx-auto mt-6" />
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}>
              {msg.sender_id !== userId && msg.sender_id !== 'system' && (
                <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.sender_nickname}</span>
              )}
              <div
                className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender_id === userId
                    ? 'bg-wood text-white rounded-br-md'
                    : msg.message_type === 'system'
                    ? 'bg-stone-100 text-stone-500 rounded-bl-md rounded-br-md text-xs'
                    : 'bg-white text-ink rounded-bl-md ink-border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div className="h-2" />
      </div>

      {/* 输入框 */}
      <div className="shrink-0 bg-white/95 backdrop-blur border-t border-wood/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发送消息..."
            className="flex-1 px-4 py-2.5 bg-stone-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/20 focus:bg-white transition-all border border-transparent focus:border-wood/15"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || wsStatus !== 'open'}
            className="shrink-0 w-10 h-10 bg-wood text-white rounded-xl disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-2 tracking-wider">
          {isHost ? '主持人模式' : `以 ${myCharacter || nickname} 身份参与`}
        </p>
      </div>

      {/* AI 助手浮动按钮 */}
      {myCharacterId && (
        <button
          onClick={() => setShowAI(true)}
          className="absolute bottom-20 right-4 w-12 h-12 bg-wood text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"
          title="AI 助手"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* AI 侧边面板 */}
      {showAI && myCharacterId && (
        <AISidePanel
          characterId={myCharacterId}
          characterName={myCharacter || '角色'}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
