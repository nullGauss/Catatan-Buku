// src/types/api.ts

// 1. Interface Amplop Utama dari Backend LSKK
export interface IResponseEntity<T> {
  code: number; // HTTP Status Code (contoh: 200, 400, 500)
  status: boolean; // true jika sukses, false jika gagal
  message: string; // Pesan penjelasan dari server
  data?: T; // Data utama (opsional & berbentuk generik 'T')
  meta?: ImetaPagination; // Informasi paginasi (opsional)
}

// 2. Interface Metadata Paginasi
export interface ImetaPagination {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}
