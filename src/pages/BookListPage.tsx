// src/pages/BookListPage.tsx
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, App as AntApp, Button, Popconfirm } from 'antd';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { deleteBook, fetchBooks } from '../services/bookService';
import type { IBook } from '../types/book';
import type { ImetaPagination } from '../types/api';

const PAGE_SIZE = 5;

const BookListPage = () => {
  const [page, setPage] = useState(1);
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isFetching, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['books', page, PAGE_SIZE],
    queryFn: () => fetchBooks({ page, limit: PAGE_SIZE }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: async (response) => {
      message.success(response.message);
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      // Jika baris terakhir di halaman terakhir dihapus, mundur satu halaman
      const fresh = queryClient.getQueryData<{ meta?: ImetaPagination }>([
        'books',
        page,
        PAGE_SIZE,
      ]);
      const totalPages = fresh?.meta?.totalPages;
      if (totalPages !== undefined && page > totalPages) {
        setPage(Math.max(1, totalPages));
      }
    },
    onError: (err) => message.error(err.message),
  });

  const meta: ImetaPagination | undefined = data?.meta;

  const { mutate: mutateDelete, isPending: isDeleting } = deleteMutation;
  const handleDelete = useCallback(
    (id: number) => mutateDelete(id),
    [mutateDelete],
  );

  const columns = useMemo<GridColDef<IBook>[]>(
    () => [
      {
        field: 'title',
        headerName: 'Judul',
        sortable: true,
        flex: 1.6,
        minWidth: 180,
      },
      {
        field: 'author',
        headerName: 'Penulis',
        sortable: true,
        flex: 1.6,
        minWidth: 180,
      },
      {
        field: 'year',
        headerName: 'Tahun',
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        sortable: true,
        flex: 0.7,
        minWidth: 100,
        valueFormatter: (value) => String(value),
      },
      {
        field: 'category',
        headerName: 'Kategori',
        sortable: true,
        flex: 1.7,
        minWidth: 180,
      },
      {
        field: 'actions',
        headerName: 'Aksi',
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        filterable: false,
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <span className="flex items-center gap-2">
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/books/${params.row.id}/edit`)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Yakin hapus catatan ini?"
              okText="Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(params.row.id)}
            >
              <Button type="link" size="small" danger disabled={isDeleting}>
                Hapus
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ],
    [navigate, handleDelete, isDeleting],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Daftar Catatan Buku</h1>
        <Button type="primary" onClick={() => navigate('/books/new')}>
          + Tambah
        </Button>
      </div>

      {isError && (
        <Alert className="mb-4" type="error" showIcon message={error.message} />
      )}

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <DataGrid
          rows={data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.id}
          loading={isFetching || isDeleting}
          paginationMode="server"
          rowCount={meta?.totalData ?? 0}
          paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(model) => setPage(model.page + 1)}
          pageSizeOptions={[PAGE_SIZE]}
          autoHeight
          disableRowSelectionOnClick
          hideFooter
          localeText={{
            noRowsLabel: 'Belum ada catatan.',
            paginationRowsPerPage: 'Baris per halaman:',
            paginationDisplayedRows: ({ from, to, count }) =>
              count === null || count === -1
                ? `${from}–${to}`
                : `${from}–${to} dari ${count}`,
            paginationItemAriaLabel: (type) => {
              if (type === 'first') return 'Ke halaman pertama';
              if (type === 'last') return 'Ke halaman terakhir';
              if (type === 'next') return 'Ke halaman berikutnya';
              return 'Ke halaman sebelumnya';
            },
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-gray-500">
          Halaman {meta?.page ?? page} dari {meta?.totalPages ?? 1} · Total{' '}
          {meta?.totalData ?? 0} data
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isPlaceholderData}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= (meta?.totalPages ?? 1) || isPlaceholderData}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookListPage;
