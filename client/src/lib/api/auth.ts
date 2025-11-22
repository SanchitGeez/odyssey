/**
 * Authentication API functions
 */
import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },

  /**
   * Logout (client-side token removal)
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },
};
