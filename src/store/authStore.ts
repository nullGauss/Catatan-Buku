// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IAuthUser } from '../types/auth';

interface AuthState {
  user: IAuthUser | null;
  login: (user: IAuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'lskk-auth' }, // localStorage key
  ),
);
