import { io } from 'socket.io-client';
// ============================================
// SOCKET.IO CLIENT FOR OPERATOR
// ============================================
let socket = null;
export function connectSocket(config) {
    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }
    const token = localStorage.getItem('token');
    socket = io('/', {
        path: '/socket.io',
        auth: { token },
        query: { eventId: config.eventId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });
    socket.on('connect', () => {
        console.log('[Socket] Connected:', socket?.id);
        config.onConnect?.();
    });
    socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        config.onDisconnect?.();
    });
    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
        config.onError?.(error);
    });
    socket.on('error', (error) => {
        console.error('[Socket] Error:', error);
        config.onError?.(error);
    });
    return socket;
}
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
export function getSocket() {
    return socket;
}
export function subscribeMusicadj(events) {
    if (!socket) {
        console.warn('[Socket] Not connected, cannot subscribe to MUSICADJ events');
        return () => { };
    }
    // Subscribe to MUSICADJ events
    if (events.onNewRequest) {
        socket.on('musicadj:new-request', events.onNewRequest);
    }
    if (events.onRequestUpdated) {
        socket.on('musicadj:request-updated', events.onRequestUpdated);
    }
    if (events.onRequestDeleted) {
        socket.on('musicadj:request-deleted', events.onRequestDeleted);
    }
    if (events.onQueueReordered) {
        socket.on('musicadj:queue-reordered', events.onQueueReordered);
    }
    // Return cleanup function
    return () => {
        if (socket) {
            socket.off('musicadj:new-request');
            socket.off('musicadj:request-updated');
            socket.off('musicadj:request-deleted');
            socket.off('musicadj:queue-reordered');
        }
    };
}
export function subscribeKaraokeya(events) {
    if (!socket) {
        console.warn('[Socket] Not connected, cannot subscribe to KARAOKEYA events');
        return () => { };
    }
    // Subscribe to KARAOKEYA events
    if (events.onNewRequest) {
        socket.on('karaokeya:request:new', events.onNewRequest);
    }
    if (events.onRequestUpdated) {
        socket.on('karaokeya:request:updated', events.onRequestUpdated);
    }
    if (events.onRequestDeleted) {
        socket.on('karaokeya:request:deleted', events.onRequestDeleted);
    }
    if (events.onQueueReordered) {
        socket.on('karaokeya:queue:reordered', events.onQueueReordered);
    }
    // Return cleanup function
    return () => {
        if (socket) {
            socket.off('karaokeya:request:new');
            socket.off('karaokeya:request:updated');
            socket.off('karaokeya:request:deleted');
            socket.off('karaokeya:queue:reordered');
        }
    };
}
//# sourceMappingURL=socket.js.map