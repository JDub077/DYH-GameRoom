import { useEffect, useRef, useState } from 'react'
import client from '../api/client'
import { useGameStore } from '../store/useGameStore'
import type { ChatMessage } from '../types'

interface AISidePanelProps {
  characterId: string
  characterName: string
  onClose: () => void
}

export default function AISidePanel({ characterId, characterName, onClose }: AISidePanelProps) {
  const { userId } = useGameStore()
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!characterId || !userId) return
    client.post('/sessions', { character_id: characterId, user_id: userId })
      .then((res: any) => {
        const sid = res.data?.session_id
        setSessionId(sid)
        return client.get(`/chat/history?session_id=${sid}&limit=50`)
      })
      .then((res: any) => {
        setMessages(res.data?.messages || [])
      })
      .catch(() => {})
  }, [characterId, userId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sending) return
    const userContent = input.trim()
    setInput('')
    setSending(true)

    const userMsg: ChatMessage = {
      message_id: `tmp-${Date.now()}`,
      role: 'user',
      content: userContent,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res: any = await client.post('/chat', {
        session_id: sessionId,
        message: userContent,
        client_timestamp: Math.floor(Date.now() / 1000),
      })
      if (res.data) {
        setMessages(prev => [...prev, res.data])
      }
    } catch {
      setMessages(prev => [...prev, {
        message_id: `err-${Date.now()}`,
        role: 'assistant',
        content: '（角色望着河水，一时陷入沉思……）',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-paper"
      style={{ animation: 'fadeInUp 0.2s ease-out' }}
    >
      {/* 顶部栏 */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-wood/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-wood hover:bg-stone-200 transition-colors text-sm"
        >
          ↓
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-sm border border-stone-200">
          <span className="text-wood/80 font-serif">{characterName[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-ink truncate" style={{ fontFamily: 'serif' }}>
            {characterName}
          </h2>
          <p className="text-[11px] text-gray-400">AI 助手 · 你的角色顾问</p>
        </div>
      </div>

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-16 animate-fade-in-up">
            <div className="w-16 h-[1px] bg-wood/20 mx-auto mb-6" />
            <p className="text-sm text-gray-400 tracking-wider mb-1">私聊助手已就绪</p>
            <p className="text-xs text-gray-300">你可以询问关于 {characterName} 的任何细节</p>
            <div className="w-16 h-[1px] bg-wood/20 mx-auto mt-6" />
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.message_id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-ink-spread`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-xs mr-2.5 shrink-0 mt-1 border border-stone-200">
                <span className="text-wood/70 font-serif">{characterName[0]}</span>
              </div>
            )}
            <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-wood text-white rounded-br-md'
                    : 'bg-white text-ink rounded-bl-md ink-border'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-300 mt-1 px-1">{formatTime(msg.created_at)}</span>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-xs mr-2.5 shrink-0 mt-1 border border-stone-200">
              <span className="text-wood/70 font-serif">{characterName[0]}</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-400 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-wood/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-wood/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-wood/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div className="h-2" />
      </div>

      {/* 输入框 */}
      <div className="shrink-0 bg-white/95 backdrop-blur border-t border-wood/10 px-4 py-3">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`询问 ${characterName}...`}
            className="flex-1 px-4 py-2.5 bg-stone-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-wood/20 focus:bg-white transition-all border border-transparent focus:border-wood/15"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0 w-10 h-10 bg-wood text-white rounded-xl disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
