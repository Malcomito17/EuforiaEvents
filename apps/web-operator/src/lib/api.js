import axios from 'axios';
const API_URL = '/api';
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor para agregar token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Interceptor para manejar errores de auth
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Solo limpiar token, dejar que el authStore y ProtectedRoute manejen el redirect
        localStorage.removeItem('token');
        // Si necesitamos redirect manual, usar el basename correcto
        // window.location.href = '/operador/login'
    }
    return Promise.reject(error);
});
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    changePassword: (data) => api.post('/auth/change-password', data),
};
export const eventsApi = {
    list: (filters) => api.get('/events', { params: filters }),
    get: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.patch(`/events/${id}`, data),
    updateEventData: (id, data) => api.patch(`/events/${id}/data`, data),
    updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
    duplicate: (id, newStartDate) => api.post(`/events/${id}/duplicate`, { newStartDate }),
    delete: (id) => api.delete(`/events/${id}`),
    getQR: (id) => api.get(`/events/${id}/qr`),
};
export const venuesApi = {
    list: (filters) => api.get('/venues', { params: filters }),
    get: (id) => api.get(`/venues/${id}`),
    create: (data) => api.post('/venues', data),
    update: (id, data) => api.patch(`/venues/${id}`, data),
    delete: (id) => api.delete(`/venues/${id}`),
    reactivate: (id) => api.post(`/venues/${id}/reactivate`),
};
export const clientsApi = {
    list: (filters) => api.get('/clients', { params: filters }),
    get: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.patch(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
    reactivate: (id) => api.post(`/clients/${id}/reactivate`),
};
export const musicadjApi = {
    // Config
    getConfig: (eventId) => api.get(`/events/${eventId}/musicadj/config`),
    updateConfig: (eventId, data) => api.patch(`/events/${eventId}/musicadj/config`, data),
    // Requests
    listRequests: (eventId, filters) => api.get(`/events/${eventId}/musicadj/requests`, { params: filters }),
    getRequest: (eventId, requestId) => api.get(`/events/${eventId}/musicadj/requests/${requestId}`),
    updateRequest: (eventId, requestId, data) => api.patch(`/events/${eventId}/musicadj/requests/${requestId}`, data),
    deleteRequest: (eventId, requestId) => api.delete(`/events/${eventId}/musicadj/requests/${requestId}`),
    // Bulk operations
    updateManyRequests: (eventId, requestIds, data) => api.patch(`/events/${eventId}/musicadj/requests/bulk`, { requestIds, ...data }),
    // Reorder (drag & drop)
    reorderRequests: (eventId, orderedIds) => api.post(`/events/${eventId}/musicadj/requests/reorder`, { orderedIds }),
};
export const karaokeyaApi = {
    // Config
    getConfig: (eventId) => api.get(`/events/${eventId}/karaokeya/config`),
    updateConfig: (eventId, data) => api.patch(`/events/${eventId}/karaokeya/config`, data),
    // Stats
    getStats: (eventId) => api.get(`/events/${eventId}/karaokeya/stats`),
    // Requests
    listRequests: (eventId, filters) => api.get(`/events/${eventId}/karaokeya/requests`, { params: filters }),
    getRequest: (eventId, requestId) => api.get(`/events/${eventId}/karaokeya/requests/${requestId}`),
    updateRequest: (eventId, requestId, data) => api.patch(`/events/${eventId}/karaokeya/requests/${requestId}`, data),
    deleteRequest: (eventId, requestId) => api.delete(`/events/${eventId}/karaokeya/requests/${requestId}`),
    // Reorder (drag & drop)
    reorderQueue: (eventId, requestIds) => api.post(`/events/${eventId}/karaokeya/requests/reorder`, { requestIds }),
};
export const karaokeSongsApi = {
    list: (filters) => api.get('/karaokeya/songs', { params: filters }),
    get: (id) => api.get(`/karaokeya/songs/${id}`),
    create: (data) => api.post('/karaokeya/songs', data),
    update: (id, data) => api.patch(`/karaokeya/songs/${id}`, data),
    delete: (id) => api.delete(`/karaokeya/songs/${id}`),
    reactivate: (id) => api.post(`/karaokeya/songs/${id}/reactivate`),
    toggleLike: (songId, guestId) => api.post(`/karaokeya/songs/${songId}/like`, { guestId }),
    getLikeStatus: (songId, guestId) => api.get(`/karaokeya/songs/${songId}/like-status`, { params: { guestId } }),
    getGuestLikedSongs: (guestId, limit) => api.get(`/karaokeya/guests/${guestId}/liked-songs`, { params: { limit } }),
};
export const guestsApi = {
    listAll: () => api.get('/guests'),
    listByEvent: (eventId) => api.get(`/events/${eventId}/guests`),
    get: (guestId) => api.get(`/guests/${guestId}`),
    getRequests: (guestId, eventId) => api.get(`/guests/${guestId}/requests`, {
        params: eventId ? { eventId } : undefined
    }),
    delete: (guestId) => api.delete(`/guests/${guestId}`),
};
export const usersApi = {
    list: (filters) => api.get('/users', { params: filters }),
    get: (id) => api.get('/users/' + id),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.patch('/users/' + id, data),
    updatePermissions: (id, permissions) => api.patch('/users/' + id + '/permissions', { permissions }),
    delete: (id) => api.delete('/users/' + id),
    reactivate: (id) => api.post('/users/' + id + '/reactivate'),
    getRolePreset: (role) => api.get('/users/roles/' + role + '/preset'),
};
//# sourceMappingURL=api.js.map