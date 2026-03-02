import apiClient from './client';
import { UserResponse } from '../types';

/** GET /api/users/me — returns the authenticated user's own profile */
export const getMe = (): Promise<UserResponse> =>
  apiClient.get<UserResponse>('/api/users/me').then(r => r.data);

/** GET /api/users/:id — returns any active user's public profile */
export const getUserById = (id: string): Promise<UserResponse> =>
  apiClient.get<UserResponse>(`/api/users/${id}`).then(r => r.data);
