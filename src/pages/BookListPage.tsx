// src/pages/BookListPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '../services/bookService';
import { NoticeBanner } from '../components/NoticeBanner';
import type { ImetaPagination } from '../types/api';

const PAGE_SIZE = 5;

const BookListPage = () => {
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['books', page, PAGE_SIZE],
    queryFn: () => fetchBooks(page, PAGE_SIZE),
    placeholderData: (previousData) => previousData,
  });

  const meta: ImetaPagination | undefined = data?.meta;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Daftar Catatan Buku</h1>
        <Link
          to="/books/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tambah
        </Link>
      </div>

      {isError && <NoticeBanner tone="error" message={error.message} />}

      {isPending ? (
        <p className="text-sm text-gray-500">Memuat data...</p>
      ) : (
        <>
          {/* Mobile: kartu per baris / Desktop: tabel */}
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Judul</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Penulis
                  </th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">
                    Tahun
                  </th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data?.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        {book.title}
                      </span>
                      <span className="block text-xs text-gray-500 sm:hidden">
                        {book.author} · {book.year} · {book.category}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                      {book.author}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                      {book.year}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                      {book.category}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/books/${book.id}/edit`}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {data?.data?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Belum ada catatan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination sederhana dari meta IResponseEntity */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-500">
              Halaman {meta?.page ?? page} dari {meta?.totalPages ?? 1} · Total{' '}
              {meta?.totalData ?? 0} data
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="rounded-md border bg-white px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= (meta?.totalPages ?? 1) || isPlaceholderData}
                className="rounded-md border bg-white px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookListPage;
