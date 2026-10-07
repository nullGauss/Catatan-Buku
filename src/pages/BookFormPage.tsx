// src/pages/BookFormPage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBook, fetchBookById, updateBook } from '../services/bookService';
import { NoticeBanner } from '../components/NoticeBanner';

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
  const [notice, setNotice] = useState<string | null>(null);

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
      setNotice(response.message);
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      if (!isEdit) {
        // Setelah tambah, kembali ke list
        navigate('/', { replace: true });
      }
    },
  });

  const onSubmit = (values: BookFormValues) => mutation.mutate(values);

  if (isEdit && isLoadingDetail) {
    return <p className="text-sm text-gray-500">Memuat data catatan...</p>;
  }

  const inputClass =
    'w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';

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

      <div className="mb-4 space-y-2">
        {notice && <NoticeBanner tone="success" message={notice} />}
        {mutation.isError && (
          <NoticeBanner tone="error" message={mutation.error.message} />
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg border bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-gray-700">
            Judul
          </label>
          <input
            id="title"
            type="text"
            className={inputClass}
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="author" className="mb-1 block text-sm text-gray-700">
            Penulis
          </label>
          <input
            id="author"
            type="text"
            className={inputClass}
            {...register('author')}
          />
          {errors.author && (
            <p className="mt-1 text-xs text-red-600">{errors.author.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="year" className="mb-1 block text-sm text-gray-700">
            Tahun
          </label>
          <input
            id="year"
            type="number"
            className={inputClass}
            {...register('year', { valueAsNumber: true })}
          />
          {errors.year && (
            <p className="mt-1 text-xs text-red-600">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm text-gray-700"
          >
            Kategori
          </label>
          <input
            id="category"
            type="text"
            placeholder="Contoh: Teknologi"
            className={inputClass}
            {...register('category')}
          />
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending
            ? 'Menyimpan...'
            : isEdit
              ? 'Simpan Perubahan'
              : 'Tambah Catatan'}
        </button>
      </form>
    </div>
  );
};

export default BookFormPage;
