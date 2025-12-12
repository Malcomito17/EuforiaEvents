import { create } from 'zustand';
import { authApi } from '@/lib/api';
export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    isAuthenticated: false,
    login: async (username, password) => {
        const { data } = await authApi.login({ username, password });
        localStorage.setItem('token', data.token);
        set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false
        });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({
            token: null,
            user: null,
            isAuthenticated: false
        });
    },
    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }
        try {
            const { data } = await authApi.me();
            set({
                user: data,
                isAuthenticated: true,
                isLoading: false
            });
        }
        catch {
            localStorage.removeItem('token');
            set({
                token: null,
                user: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },
}));
//# sourceMappingURL=authStore.js.map