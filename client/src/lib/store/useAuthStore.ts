/**
 * Zustand store for authentication state
 */
import { create } from 'zustand';
import { authApi, type User } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Call login API
      const tokenResponse = await authApi.login({ email, password });

      // Store token
      localStorage.setItem('auth_token', tokenResponse.access_token);

      // Fetch user data
      const user = await authApi.getCurrentUser();

      set({
        user,
        token: tokenResponse.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      localStorage.removeItem('auth_token');
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Call register API
      await authApi.register({ email, password });

      // Auto-login after registration
      await useAuthStore.getState().login(email, password);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear token
    localStorage.removeItem('auth_token');

    // Call logout API (optional, for server-side token blacklisting in future)
    authApi.logout().catch(() => {
      // Ignore errors on logout API call
    });

    // Clear state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await authApi.getCurrentUser();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
