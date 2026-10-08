// src/pages/BookListPage.tsx
import { useMemo, useState } from 'react';
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

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['books', page, PAGE_SIZE],
    queryFn: () => fetchBooks(page, PAGE_SIZE),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: (response) => {
      message.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err) => message.error(err.message),
  });

  const meta: ImetaPagination | undefined = data?.meta;

  const columns = useMemo<GridColDef<IBook>[]>(
    () => [
      { field: 'title', headerName: 'Judul', flex: 1, minWidth: 160 },
      { field: 'author', headerName: 'Penulis', flex: 1, minWidth: 130 },
      {
        field: 'year',
        headerName: 'Tahun',
        type: 'number',
        flex: 0.5,
        minWidth: 90,
      },
      { field: 'category', headerName: 'Kategori', flex: 0.8, minWidth: 120 },
      {
        field: 'actions',
        headerName: 'Aksi',
        sortable: false,
        filterable: false,
        flex: 0.7,
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
              onConfirm={() => deleteMutation.mutate(params.row.id)}
            >
              <Button
                type="link"
                size="small"
                danger
                disabled={deleteMutation.isPending}
              >
                Hapus
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ],
    [navigate, deleteMutation],
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
          loading={isFetching || deleteMutation.isPending}
          paginationMode="server"
          rowCount={meta?.totalData ?? 0}
          paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(model) => setPage(model.page + 1)}
          pageSizeOptions={[PAGE_SIZE]}
          autoHeight
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          localeText={{ noRowsLabel: 'Belum ada catatan.' }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Total {meta?.totalData ?? 0} data
      </p>
    </div>
  );
};

export default BookListPage;
