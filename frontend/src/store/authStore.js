import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData);
          const { token, user } = response.data;

          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          const { token, user } = response.data;

          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      // Logout
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        delete axios.defaults.headers.common['Authorization'];
      },

      // Get current user
      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return { success: false };

        set({ isLoading: true });
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/auth/me`);

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true };
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired'
          });
          delete axios.defaults.headers.common['Authorization'];
          return { success: false };
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`${API_URL}/auth/change-password`, {
            current_password: currentPassword,
            new_password: newPassword
          });

          set({ isLoading: false, error: null });
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to change password';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`${API_URL}/auth/profile`, profileData);

          set({
            user: response.data.user,
            isLoading: false,
            error: null
          });

          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update profile';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      // Update avatar
      updateAvatar: async (avatarUrl) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`${API_URL}/auth/profile`, { avatar_url: avatarUrl });

          set({
            user: response.data.user,
            isLoading: false,
            error: null
          });

          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update avatar';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      // Initialize auth from stored token
      initAuth: () => {
        const { token } = get();
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
