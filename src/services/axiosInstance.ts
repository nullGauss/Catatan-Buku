// src/services/axiosInstance.ts
// Satu-satunya pintu HTTP aplikasi: semua request wajib lewat sini.
import axios from 'axios';
import type { IResponseEntity } from '../types/api';
import { useAuthStore } from '../store/authStore';
import { mockAdapter } from './mockAdapter';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Selama backend belum ada, arahkan ke mock lokal.
if (import.meta.env.VITE_USE_MOCK === 'true') {
  axiosInstance.defaults.adapter = mockAdapter;
}

// Request: lampirkan token JWT dari Zustand.
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: semua error dipaksa menjadi Error biasa dengan pesan dari
// field `message` IResponseEntity — UI tidak pernah menebak bentuk response.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      const body = error.response?.data as
        Partial<IResponseEntity<unknown>> | undefined;
      const raw = body?.message;
      const message = Array.isArray(raw)
        ? raw.join(', ')
        : typeof raw === 'string'
          ? raw
          : 'Terjadi kesalahan. Silakan coba lagi.';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Tidak dapat terhubung ke server.'));
  },
);
