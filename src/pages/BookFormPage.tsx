// src/pages/BookFormPage.tsx
import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, App as AntApp, Button, Form, Input, Spin } from 'antd';
import { createBook, fetchBookById, updateBook } from '../services/bookService';

// Skema validasi catatan — semua pesan error dikendalikan Zod
const bookSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  author: z.string().min(2, 'Penulis minimal 2 karakter'),
  year: z
    .number('Tahun wajib diisi')
    .int('Tahun harus berupa bilangan bulat')
    .min(1900, 'Tahun minimal 1900')
    .max(2100, 'Tahun maksimal 2100'),
  category: z.string().min(1, 'Kategori wajib diisi'),
});

type BookFormValues = z.infer<typeof bookSchema>;

const BookFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const rawId = id ? Number(id) : null;
  const isInvalidId =
    rawId !== null && (!Number.isInteger(rawId) || rawId <= 0);
  const bookId = isInvalidId ? null : rawId;
  const isEdit = bookId !== null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();

  // Ambil data lama saat mode edit (dinonaktifkan saat tambah)
  const { data: detail, isPending: isLoadingDetail } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBookById(Number(bookId)),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      year: new Date().getFullYear(),
      category: '',
    },
  });

  // Isi form dengan data lama setelah fetch edit selesai
  useEffect(() => {
    if (detail?.data) {
      reset(detail.data);
    }
  }, [detail, reset]);

  const mutation = useMutation({
    mutationFn: (values: BookFormValues) =>
      isEdit ? updateBook(Number(bookId), values) : createBook(values),
    onSuccess: async (response) => {
      message.success(response.message);
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      if (isEdit && bookId) {
        await queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      }
      if (!isEdit) {
        // Setelah tambah, kembali ke list
        navigate('/', { replace: true });
      }
    },
  });

  const onSubmit = (values: BookFormValues) => mutation.mutate(values);

  // Id buku bukan angka valid → lempar ke halaman utama
  if (isInvalidId) {
    return <Navigate to="/" replace />;
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          {isEdit ? 'Edit Catatan' : 'Tambah Catatan'}
        </h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          Kembali
        </Link>
      </div>

      {mutation.isError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={mutation.error.message}
        />
      )}

      <Form
        layout="vertical"
        onFinish={() => handleSubmit(onSubmit)()}
        className="rounded-lg border bg-white p-6 shadow-sm"
      >
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Judul"
              validateStatus={fieldState.error ? 'error' : undefined}
              help={fieldState.error?.message}
            >
              <Input id="title" type="text" {...field} />
            </Form.Item>
          )}
        />

        <Controller
          name="author"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Penulis"
              validateStatus={fieldState.error ? 'error' : undefined}
              help={fieldState.error?.message}
            >
              <Input id="author" type="text" {...field} />
            </Form.Item>
          )}
        />

        <Controller
          name="year"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Tahun"
              validateStatus={fieldState.error ? 'error' : undefined}
              help={fieldState.error?.message}
            >
              <Input
                id="year"
                type="number"
                {...field}
                value={
                  typeof field.value === 'number' && Number.isNaN(field.value)
                    ? ''
                    : field.value
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === '' ? NaN : Number(raw));
                }}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Kategori"
              validateStatus={fieldState.error ? 'error' : undefined}
              help={fieldState.error?.message}
            >
              <Input
                id="category"
                type="text"
                placeholder="Contoh: Teknologi"
                {...field}
              />
            </Form.Item>
          )}
        />

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={isSubmitting || mutation.isPending}
        >
          {mutation.isPending
            ? 'Menyimpan...'
            : isEdit
              ? 'Simpan Perubahan'
              : 'Tambah Catatan'}
        </Button>
      </Form>
    </div>
  );
};

export default BookFormPage;
