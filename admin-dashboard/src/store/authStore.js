/**
 * Auth Store
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    // Login action
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.login(credentials);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true, loading: false });

            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    // Register action
    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.register(userData);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });

            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    // Logout action
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    // Get current user
    getCurrentUser: async () => {
        set({ loading: true });
        try {
            const response = await authAPI.getMe();
            set({ user: response.data.user, loading: false });
        } catch (error) {
            set({ loading: false });
            // If token is invalid, logout
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            }
        }
    },
}));

export default useAuthStore;
