import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import type { Character } from '../types'

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/characters').then((res: any) => {
      setCharacters(res.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center px-4 py-10">
      {/* 顶部装饰线 */}
      <div className="w-16 h-[2px] bg-wood/40 mb-6" />

      {/* 标题区 */}
      <header className="text-center mb-10 animate-fade-in-up">
        <div className="inline-block px-3 py-1 border border-wood/20 rounded-full text-xs text-wood/70 mb-3 tracking-widest">
          永乐十九年 · 深秋
        </div>
        <h1 className="text-4xl font-bold text-wood tracking-[0.3em] mb-2" style={{ fontFamily: 'serif' }}>
          明舟北渡
        </h1>
        <p className="text-sm text-gray-500 tracking-wide mb-5">
          运河上的幸存者，各怀心事
        </p>
        <button
          onClick={() => navigate('/lobby')}
          className="px-6 py-2.5 bg-wood text-white rounded-full text-sm tracking-wider active:scale-95 transition-all shadow-sm hover:shadow-md"
        >
          🎭 进入游戏大厅
        </button>
      </header>

      {/* 角色列表 */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-wood/30 border-t-wood rounded-full animate-spin" />
            <span className="text-sm tracking-wider">载入中……</span>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {characters.map((c, index) => (
            <button
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="w-full group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative flex items-center gap-4 p-4 bg-white/80 backdrop-blur rounded-xl ink-border group-hover:ink-border-strong transition-all duration-300 group-hover:-translate-y-0.5">
                {/* 左侧序号 */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-wood/10 rounded-full flex items-center justify-center text-[10px] text-wood/60 font-serif">
                  {index + 1}
                </div>

                {/* 头像 */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-2xl shrink-0 border border-stone-200 group-hover:border-wood/30 transition-colors">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt={c.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-wood/80 font-serif">{c.name[0]}</span>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <h2 className="text-lg font-bold text-ink group-hover:text-wood transition-colors" style={{ fontFamily: 'serif' }}>
                      {c.name}
                    </h2>
                    <span className="text-[11px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded border border-stone-200">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{c.tagline}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(c.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-paper text-wood/80 rounded-full border border-wood/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 箭头 */}
                <div className="text-stone-300 group-hover:text-wood/60 transition-colors text-lg">
                  ›
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 底部 */}
      <footer className="mt-auto pt-10 pb-4 text-center">
        <div className="w-12 h-[1px] bg-wood/20 mx-auto mb-3" />
        <p className="text-xs text-gray-400 tracking-wider">
          选择一个角色，倾听运河往事
        </p>
      </footer>
    </div>
  )
}
