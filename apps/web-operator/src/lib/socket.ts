import { io, Socket } from 'socket.io-client'

// ============================================
// SOCKET.IO CLIENT FOR OPERATOR
// ============================================

let socket: Socket | null = null

export interface SocketConfig {
  eventId: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function connectSocket(config: SocketConfig): Socket {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect()
  }

  const token = localStorage.getItem('token')
  
  socket = io('/', {
    path: '/socket.io',
    auth: { token },
    query: { eventId: config.eventId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
    config.onConnect?.()
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
    config.onDisconnect?.()
  })

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error)
    config.onError?.(error)
  })

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error)
    config.onError?.(error)
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket(): Socket | null {
  return socket
}

// ============================================
// MUSICADJ SOCKET EVENTS
// ============================================

export interface MusicadjSocketEvents {
  onNewRequest?: (request: SongRequestEvent) => void
  onRequestUpdated?: (request: SongRequestEvent) => void
  onRequestDeleted?: (data: { requestId: string }) => void
  onQueueReordered?: (data: { requests: SongRequestEvent[] }) => void
}

export interface SongRequestEvent {
  id: string
  eventId: string
  guestId: string
  spotifyId: string | null
  title: string
  artist: string
  albumArtUrl: string | null
  status: string
  priority: number
  createdAt: string
  guest: {
    id: string
    displayName: string
    email: string
  }
}

export function subscribeMusicadj(events: MusicadjSocketEvents): () => void {
  if (!socket) {
    console.warn('[Socket] Not connected, cannot subscribe to MUSICADJ events')
    return () => {}
  }

  // Subscribe to MUSICADJ events
  if (events.onNewRequest) {
    socket.on('musicadj:new-request', events.onNewRequest)
  }
  if (events.onRequestUpdated) {
    socket.on('musicadj:request-updated', events.onRequestUpdated)
  }
  if (events.onRequestDeleted) {
    socket.on('musicadj:request-deleted', events.onRequestDeleted)
  }
  if (events.onQueueReordered) {
    socket.on('musicadj:queue-reordered', events.onQueueReordered)
  }

  // Return cleanup function
  return () => {
    if (socket) {
      socket.off('musicadj:new-request')
      socket.off('musicadj:request-updated')
      socket.off('musicadj:request-deleted')
      socket.off('musicadj:queue-reordered')
    }
  }
}

// ============================================
// KARAOKEYA SOCKET EVENTS
// ============================================

export interface KaraokeyaSocketEvents {
  onNewRequest?: (request: KaraokeRequestEvent) => void
  onRequestUpdated?: (request: KaraokeRequestEvent) => void
  onRequestDeleted?: (data: { requestId: string }) => void
  onQueueReordered?: (data: { requests: KaraokeRequestEvent[] }) => void
}

export interface KaraokeRequestEvent {
  id: string
  eventId: string
  guestId: string
  songId: string | null
  title: string
  artist: string | null
  turnNumber: number
  queuePosition: number
  status: string
  createdAt: string
  calledAt: string | null
  guest: {
    id: string
    displayName: string
    email: string
    whatsapp: string | null
  }
  song: {
    id: string
    title: string
    artist: string | null
    youtubeId: string
    youtubeShareUrl: string
    thumbnailUrl: string | null
    duration: number | null
    timesRequested: number
  } | null
}

export function subscribeKaraokeya(events: KaraokeyaSocketEvents): () => void {
  if (!socket) {
    console.warn('[Socket] Not connected, cannot subscribe to KARAOKEYA events')
    return () => {}
  }

  // Subscribe to KARAOKEYA events
  if (events.onNewRequest) {
    socket.on('karaokeya:request:new', events.onNewRequest)
  }
  if (events.onRequestUpdated) {
    socket.on('karaokeya:request:updated', events.onRequestUpdated)
  }
  if (events.onRequestDeleted) {
    socket.on('karaokeya:request:deleted', events.onRequestDeleted)
  }
  if (events.onQueueReordered) {
    socket.on('karaokeya:queue:reordered', events.onQueueReordered)
  }

  // Return cleanup function
  return () => {
    if (socket) {
      socket.off('karaokeya:request:new')
      socket.off('karaokeya:request:updated')
      socket.off('karaokeya:request:deleted')
      socket.off('karaokeya:queue:reordered')
    }
  }
}
