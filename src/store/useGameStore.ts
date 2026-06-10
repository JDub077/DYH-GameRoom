import { create } from 'zustand'
import type { GameState, Room, Player, RoomMessage, Clue, GamePhase } from '../types/game'

interface GameStore extends GameState {
  setUser: (userId: string, nickname: string) => void
  setRoom: (room: Room | null) => void
  setPlayers: (players: Player[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (userId: string) => void
  setMessages: (messages: RoomMessage[]) => void
  addMessage: (message: RoomMessage) => void
  setClues: (clues: Clue[]) => void
  addClue: (clue: Clue) => void
  updateClue: (clueId: string, updates: Partial<Clue>) => void
  updatePlayerReady: (userId: string, isReady: boolean) => void
  setPhase: (phase: GamePhase) => void
  setWs: (ws: WebSocket | null) => void
  setWsStatus: (status: GameState['wsStatus']) => void
  reset: () => void
}

const initialState: GameState = {
  userId: localStorage.getItem('dyh_user_id') || '',
  nickname: localStorage.getItem('dyh_nickname') || '',
  currentRoom: null,
  players: [],
  messages: [],
  clues: [],
  currentPhase: 'waiting',
  ws: null,
  wsStatus: 'idle',
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setUser: (userId, nickname) => {
    localStorage.setItem('dyh_user_id', userId)
    localStorage.setItem('dyh_nickname', nickname)
    set({ userId, nickname })
  },

  setRoom: (room) => set({ currentRoom: room }),

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players.filter((p) => p.user_id !== player.user_id), player],
    })),

  removePlayer: (userId) =>
    set((state) => ({
      players: state.players.filter((p) => p.user_id !== userId),
    })),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setClues: (clues) => set({ clues }),

  addClue: (clue) =>
    set((state) => ({
      clues: [...state.clues, clue],
    })),

  updateClue: (clueId, updates) =>
    set((state) => ({
      clues: state.clues.map((c) => (c.id === clueId ? { ...c, ...updates } : c)),
    })),

  updatePlayerReady: (userId, isReady) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.user_id === userId ? { ...p, is_ready: isReady } : p
      ),
    })),

  setPhase: (phase) => set({ currentPhase: phase }),

  setWs: (ws) => set({ ws }),

  setWsStatus: (wsStatus) => set({ wsStatus }),

  reset: () => set({ ...initialState, userId: initialState.userId, nickname: initialState.nickname }),
}))
