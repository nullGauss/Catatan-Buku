// src/pages/BookFormPage.tsx
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
  const bookId = id ? Number(id) : null;
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
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
      if (!isEdit) {
        // Setelah tambah, kembali ke list
        navigate('/', { replace: true });
      }
    },
  });

  const onSubmit = (values: BookFormValues) => mutation.mutate(values);

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
        <Form.Item
          label="Judul"
          validateStatus={errors.title ? 'error' : undefined}
          help={errors.title?.message}
        >
          <Input id="title" type="text" {...register('title')} />
        </Form.Item>

        <Form.Item
          label="Penulis"
          validateStatus={errors.author ? 'error' : undefined}
          help={errors.author?.message}
        >
          <Input id="author" type="text" {...register('author')} />
        </Form.Item>

        <Form.Item
          label="Tahun"
          validateStatus={errors.year ? 'error' : undefined}
          help={errors.year?.message}
        >
          <Input
            id="year"
            type="number"
            {...register('year', { valueAsNumber: true })}
          />
        </Form.Item>

        <Form.Item
          label="Kategori"
          validateStatus={errors.category ? 'error' : undefined}
          help={errors.category?.message}
        >
          <Input
            id="category"
            type="text"
            placeholder="Contoh: Teknologi"
            {...register('category')}
          />
        </Form.Item>

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
