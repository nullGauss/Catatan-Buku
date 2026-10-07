/* eslint-disable react-refresh/only-export-components */
// src/router/index.tsx
import { lazy, Suspense, type ReactNode } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Lazy loading — satu-satunya tempat halaman di-import
const LoginPage = lazy(() => import('../pages/LoginPage'));
const BookListPage = lazy(() => import('../pages/BookListPage'));
const BookFormPage = lazy(() => import('../pages/BookFormPage'));

const PageFallback = () => (
  <div className="p-4 text-sm text-gray-500">Memuat halaman...</div>
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

export const router = createHashRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<BookListPage />) },
      { path: 'books/new', element: withSuspense(<BookFormPage />) },
      { path: 'books/:id/edit', element: withSuspense(<BookFormPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
