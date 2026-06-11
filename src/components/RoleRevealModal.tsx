import { useState } from 'react'

interface RoleInfo {
  character_name: string
  title?: string
  era?: string
  avatar_url?: string
  tagline?: string
  backstory?: string
  secrets?: string[]
}

interface RoleRevealModalProps {
  open: boolean
  role: RoleInfo | null
  loading: boolean
  onConfirm: () => void
}

export default function RoleRevealModal({ open, role, loading, onConfirm }: RoleRevealModalProps) {
  const [showSecrets, setShowSecrets] = useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-md bg-paper rounded-2xl shadow-2xl border border-wood/10 overflow-hidden"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-wood/5 px-6 py-5 text-center border-b border-wood/10">
          <p className="text-[11px] text-wood/60 tracking-widest mb-2">你的身份是</p>
          {role?.avatar_url ? (
            <img
              src={role.avatar_url}
              alt=""
              className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-wood/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center mx-auto mb-3 border-2 border-wood/20">
              <span className="text-2xl text-wood font-serif">{role?.character_name?.[0] || '?'}</span>
            </div>
          )}
          <h2 className="text-xl font-bold text-ink" style={{ fontFamily: 'serif' }}>
            {role?.character_name || '未知角色'}
          </h2>
          {role?.title && (
            <p className="text-sm text-wood/70 mt-1">{role.title}</p>
          )}
          {role?.era && (
            <p className="text-[11px] text-gray-400 mt-0.5">{role.era}</p>
          )}
          {role?.tagline && (
            <p className="text-xs text-gray-500 mt-2 italic">「{role.tagline}」</p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto no-scrollbar space-y-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-gray-400">
              <div className="w-6 h-6 border-2 border-wood/30 border-t-wood rounded-full animate-spin" />
              <span className="text-sm">正在读取剧本...</span>
            </div>
          ) : (
            <>
              {/* Backstory */}
              <div>
                <h3 className="text-xs font-bold text-wood mb-2 tracking-wider">角色剧本</h3>
                <div className="bg-white rounded-xl p-4 border border-stone-200 text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {role?.backstory || '暂无剧本信息'}
                </div>
              </div>

              {/* Secrets toggle */}
              <div>
                <button
                  onClick={() => setShowSecrets((s) => !s)}
                  className="text-xs text-wood/80 hover:text-wood underline underline-offset-2 transition-colors"
                >
                  {showSecrets ? '隐藏秘密信息' : '查看秘密信息（仅限自己）'}
                </button>
                {showSecrets && (
                  <div className="mt-2 bg-cinnabar/5 rounded-xl p-4 border border-cinnabar/10">
                    <h4 className="text-[11px] font-bold text-cinnabar mb-2">秘密信息</h4>
                    {role?.secrets && role.secrets.length > 0 ? (
                      <ul className="space-y-1.5">
                        {role.secrets.map((secret, idx) => (
                          <li key={idx} className="text-sm text-ink leading-relaxed">
                            • {secret}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">暂无秘密信息</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-wood/10">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 bg-wood text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-all disabled:opacity-50"
          >
            我已了解角色
          </button>
        </div>
      </div>
    </div>
  )
}
