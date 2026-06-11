export type GamePhase =
  | 'waiting'
  | 'role_reveal'
  | 'opening'
  | 'search_1'
  | 'discuss_1'
  | 'search_2'
  | 'discuss_2'
  | 'final'
  | 'closed'

export interface Player {
  id: string
  user_id: string
  nickname: string
  character_id?: string
  character_name?: string
  is_host: boolean
  is_ready: boolean
  joined_at: string
}

export interface Room {
  id: string
  name: string
  code: string
  host_id: string
  status: 'waiting' | 'playing' | 'ended'
  current_phase: GamePhase
  max_players: number
  players: Player[]
  created_at: string
}

export interface Clue {
  id: string
  title: string
  content: string
  image_url?: string
  phase: string
  is_issued: boolean
  issued_at?: string
  created_at: string
}

export interface RoomMessage {
  id: string
  sender_id: string
  sender_nickname: string
  sender_character_name?: string
  sender_avatar_url?: string
  content: string
  message_type: 'text' | 'system' | 'phase_change' | 'clue_issued'
  created_at: string
}

export interface WSMessage {
  event: string
  payload: Record<string, any>
  timestamp: number
}

export interface GameState {
  userId: string
  nickname: string
  currentRoom: Room | null
  players: Player[]
  messages: RoomMessage[]
  clues: Clue[]
  currentPhase: GamePhase
  ws: WebSocket | null
  wsStatus: 'idle' | 'connecting' | 'open' | 'closed' | 'error'
}
