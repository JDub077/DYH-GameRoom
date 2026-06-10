import { useCallback } from 'react'
import client from '../api/client'
import type { Room, RoomMessage, Clue } from '../types/game'

interface CreateRoomData {
  name: string
  password?: string
  host_id: string
  host_nickname: string
}

interface JoinRoomData {
  code: string
  password?: string
  user_id: string
  nickname: string
}

export function useRoomAPI() {
  const createRoom = useCallback(async (data: CreateRoomData): Promise<Room> => {
    const res: any = await client.post('/rooms', data)
    return res
  }, [])

  const listRooms = useCallback(async (): Promise<Room[]> => {
    const res: any = await client.get('/rooms')
    return res || []
  }, [])

  const getRoom = useCallback(async (roomId: string): Promise<Room> => {
    const res: any = await client.get(`/rooms/${roomId}`)
    return res
  }, [])

  const joinRoom = useCallback(async (data: JoinRoomData): Promise<Room> => {
    const res: any = await client.post('/rooms/join', data)
    return res
  }, [])

  const leaveRoom = useCallback(async (roomId: string, userId: string): Promise<void> => {
    await client.post(`/rooms/${roomId}/leave?user_id=${userId}`)
  }, [])

  const updatePhase = useCallback(async (roomId: string, userId: string, phase: string): Promise<Room> => {
    const res: any = await client.patch(`/rooms/${roomId}/phase?user_id=${userId}`, { phase })
    return res
  }, [])

  const createClue = useCallback(async (roomId: string, userId: string, data: { title: string; content: string; phase: string; image_url?: string }): Promise<Clue> => {
    const res: any = await client.post(`/rooms/${roomId}/clues?user_id=${userId}`, data)
    return res
  }, [])

  const listClues = useCallback(async (roomId: string): Promise<Clue[]> => {
    const res: any = await client.get(`/rooms/${roomId}/clues`)
    return res || []
  }, [])

  const issueClue = useCallback(async (roomId: string, clueId: string, userId: string): Promise<Clue> => {
    const res: any = await client.post(`/rooms/${roomId}/clues/${clueId}/issue?user_id=${userId}`)
    return res
  }, [])

  const assignRole = useCallback(async (roomId: string, userId: string, targetUserId: string, characterId: string): Promise<Room> => {
    const res: any = await client.post(`/rooms/${roomId}/assign-role?user_id=${userId}`, {
      user_id: targetUserId,
      character_id: characterId,
    })
    return res
  }, [])

  const getMessages = useCallback(async (roomId: string, limit = 100): Promise<RoomMessage[]> => {
    const res: any = await client.get(`/rooms/${roomId}/messages?limit=${limit}`)
    return res || []
  }, [])

  const toggleReady = useCallback(async (roomId: string, userId: string): Promise<Room> => {
    const res: any = await client.post(`/rooms/${roomId}/ready?user_id=${userId}`)
    return res
  }, [])

  return {
    createRoom,
    listRooms,
    getRoom,
    joinRoom,
    leaveRoom,
    updatePhase,
    createClue,
    listClues,
    issueClue,
    assignRole,
    getMessages,
    toggleReady,
  }
}
