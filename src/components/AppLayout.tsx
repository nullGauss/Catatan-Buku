// src/components/AppLayout.tsx
import { memo } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useAuthStore } from '../store/authStore';

const AppLayoutComponent = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-blue-600">
            {import.meta.env.VITE_APP_NAME}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{user?.name}</span>
            <Button size="small" danger onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export const AppLayout = memo(AppLayoutComponent);
