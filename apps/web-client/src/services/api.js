/**
 * API Service - Cliente HTTP para el backend (v1.3)
 */
import axios from 'axios';
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// ============================================
// Guest API (v1.3)
// ============================================
export async function identifyGuest(input) {
    const { data } = await api.post('/guests/identify', input);
    return data.guest;
}
export async function getGuestRequests(guestId, eventId) {
    const { data } = await api.get(`/guests/${guestId}/requests`, {
        params: eventId ? { eventId } : undefined,
    });
    return data;
}
// ============================================
// Event API
// ============================================
export async function getEventBySlug(slug) {
    const { data } = await api.get(`/events/slug/${slug}`);
    return data;
}
// ============================================
// MUSICADJ API
// ============================================
export async function getMusicadjConfig(eventId) {
    const { data } = await api.get(`/events/${eventId}/musicadj/config`);
    return data;
}
export async function searchSpotify(eventId, query, limit = 10) {
    const { data } = await api.get(`/events/${eventId}/musicadj/search`, {
        params: { q: query, limit },
    });
    return data;
}
export async function createSongRequest(eventId, input) {
    const { data } = await api.post(`/events/${eventId}/musicadj/requests`, input);
    return data;
}
// ============================================
// KARAOKEYA API
// ============================================
export async function getKaraokeyaConfig(eventId) {
    const { data } = await api.get(`/events/${eventId}/karaokeya/config`);
    return data;
}
export async function searchKaraoke(eventId, query) {
    const { data } = await api.get(`/events/${eventId}/karaokeya/search`, {
        params: { q: query },
    });
    return data;
}
export async function createKaraokeRequest(eventId, input) {
    const { data } = await api.post(`/events/${eventId}/karaokeya/requests`, input);
    return data;
}
export async function deleteKaraokeRequest(eventId, requestId) {
    await api.delete(`/events/${eventId}/karaokeya/requests/${requestId}`);
}
export async function getGuestKaraokeQueue(eventId, guestId) {
    const { data } = await api.get(`/events/${eventId}/karaokeya/guests/${guestId}/requests`);
    return data;
}
export async function getPublicKaraokeQueue(eventId) {
    const { data } = await api.get(`/events/${eventId}/karaokeya/queue`);
    return data;
}
export async function getPopularSongs(eventId, limit = 10) {
    const { data } = await api.get(`/events/${eventId}/karaokeya/popular`, {
        params: { limit },
    });
    return data;
}
export async function getSmartSuggestions(eventId, guestId, limit = 5) {
    const { data } = await api.get(`/events/${eventId}/karaokeya/suggestions`, {
        params: { guestId, limit },
    });
    return data;
}
// ============================================
// Karaoke Likes API
// ============================================
export async function toggleSongLike(songId, guestId) {
    const { data } = await api.post(`/karaokeya/songs/${songId}/like`, { guestId });
    return data;
}
export async function getSongLikeStatus(songId, guestId) {
    const { data } = await api.get(`/karaokeya/songs/${songId}/like-status`, {
        params: { guestId },
    });
    return data;
}
export async function batchGetLikeStatuses(songIds, guestId) {
    // Helper para obtener múltiples estados en paralelo
    const promises = songIds.map(songId => getSongLikeStatus(songId, guestId));
    const results = await Promise.all(promises);
    const statusMap = {};
    songIds.forEach((songId, index) => {
        statusMap[songId] = results[index].liked;
    });
    return statusMap;
}
// ============================================
// Error Handler
// ============================================
api.interceptors.response.use((response) => response, (error) => {
    const message = error.response?.data?.error || 'Error de conexión';
    return Promise.reject(new Error(message));
});
export { api };
//# sourceMappingURL=api.js.map