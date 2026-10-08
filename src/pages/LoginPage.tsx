// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Form, Input } from 'antd';
import { loginService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// Skema validasi login — pesan error dikendalikan Zod (satu sumber kebenaran)
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const response = await loginService(values);
      if (!response.data) {
        setErrorMessage(response.message);
        return;
      }
      login(response.data);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login gagal');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-800">Masuk</h1>
        <p className="mb-4 text-sm text-gray-500">
          Login demo: admin@gmail.com / rahasia123
        </p>

        {errorMessage && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message={errorMessage}
          />
        )}

        <Form layout="vertical" onFinish={() => handleSubmit(onSubmit)()}>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Email"
                validateStatus={fieldState.error ? 'error' : undefined}
                help={fieldState.error?.message}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@domain.com"
                  {...field}
                />
              </Form.Item>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Password"
                validateStatus={fieldState.error ? 'error' : undefined}
                help={fieldState.error?.message}
              >
                <Input.Password
                  id="password"
                  autoComplete="current-password"
                  placeholder="********"
                  {...field}
                />
              </Form.Item>
            )}
          />

          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
