// src/services/mockAdapter.ts
// Adapter axios palsu: meniru REST API "Catatan Buku" sampai backend asli siap.
// Aktif otomatis jika VITE_USE_MOCK=true di .env — ganti ke false saat API real ada.
import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { IResponseEntity, ImetaPagination } from '../types/api';
import type { IBook, IBookPayload } from '../types/book';
import type { IAuthUser, ILoginPayload } from '../types/auth';

const DEMO_ACCOUNT: ILoginPayload & { name: string } = {
  email: 'admin@lskk.dev',
  password: 'rahasia123',
  name: 'Admin LSKK',
};

let books: IBook[] = [
  {
    id: 1,
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    year: 2008,
    category: 'Fiksi',
  },
  {
    id: 2,
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    year: 1980,
    category: 'Fiksi',
  },
  {
    id: 3,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    year: 2008,
    category: 'Teknologi',
  },
  {
    id: 4,
    title: 'Atomic Habits',
    author: 'James Clear',
    year: 2018,
    category: 'Pengembangan Diri',
  },
  {
    id: 5,
    title: 'Sejarah Bangsa Indonesia',
    author: 'Suryadi',
    year: 2015,
    category: 'Sejarah',
  },
  {
    id: 6,
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    year: 2019,
    category: 'Pengembangan Diri',
  },
  {
    id: 7,
    title: 'Sistem Operasi',
    author: 'Andrew S. Tanenbaum',
    year: 2015,
    category: 'Teknologi',
  },
  {
    id: 8,
    title: 'Negeri 5 Menara',
    author: 'Ahmad Fuadi',
    year: 2009,
    category: 'Fiksi',
  },
  {
    id: 9,
    title: 'Design Patterns',
    author: 'Erich Gamma',
    year: 1994,
    category: 'Teknologi',
  },
  {
    id: 10,
    title: 'Bisnis Modal Kecil',
    author: 'Hamzah Irfan',
    year: 2020,
    category: 'Bisnis',
  },
  {
    id: 11,
    title: 'Fisika Dasar',
    author: 'Halliday',
    year: 2013,
    category: 'Sains',
  },
  {
    id: 12,
    title: 'Mahar dan Kemenangan',
    author: 'Habiburrahman',
    year: 2007,
    category: 'Fiksi',
  },
];
let nextId = books.length + 1;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const ok = <T>(
  config: InternalAxiosRequestConfig,
  data: T,
  message: string,
  meta?: ImetaPagination,
): AxiosResponse<IResponseEntity<T>> => ({
  data: { code: 200, status: true, message, data, meta },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const fail = (
  config: InternalAxiosRequestConfig,
  code: number,
  message: string,
): never => {
  const response: AxiosResponse<IResponseEntity<undefined>> = {
    data: { code, status: false, message },
    status: code,
    statusText: 'Error',
    headers: {},
    config,
  };
  throw new AxiosError(message, String(code), config, null, response);
};

const parseBody = <T>(data: unknown): T => {
  if (typeof data === 'string') return JSON.parse(data) as T;
  return data as T;
};

export const mockAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> => {
  await sleep(400); // simulasi latensi jaringan

  const method = (config.method ?? 'get').toUpperCase();
  const url = config.url ?? '';

  // POST /auth/login
  if (method === 'POST' && url === '/auth/login') {
    const body = parseBody<ILoginPayload>(config.data);
    if (
      body.email !== DEMO_ACCOUNT.email ||
      body.password !== DEMO_ACCOUNT.password
    ) {
      return fail(config, 401, 'Email atau password salah');
    }
    const user: IAuthUser = {
      id: 1,
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
      token: `mock-jwt-${Date.now()}`,
    };
    return ok(config, user, 'Berhasil masuk');
  }

  // GET /books?page=&limit=
  if (method === 'GET' && url === '/books') {
    const { page = 1, limit = 5 } = (config.params ?? {}) as {
      page?: number;
      limit?: number;
    };
    const totalData = books.length;
    const totalPages = Math.max(1, Math.ceil(totalData / limit));
    const start = (page - 1) * limit;
    const meta: ImetaPagination = {
      totalPages,
      totalData,
      totalDataPerPage: limit,
      page,
      limit,
    };
    return ok(
      config,
      books.slice(start, start + limit),
      'Berhasil memuat catatan',
      meta,
    );
  }

  // GET /books/:id
  const idMatch = url.match(/^\/books\/(\d+)$/);
  if (method === 'GET' && idMatch) {
    const book = books.find((item) => item.id === Number(idMatch[1]));
    if (!book) return fail(config, 404, 'Catatan tidak ditemukan');
    return ok(config, book, 'Berhasil memuat detail catatan');
  }

  // POST /books
  if (method === 'POST' && url === '/books') {
    const body = parseBody<IBookPayload>(config.data);
    const created: IBook = { id: nextId++, ...body };
    books = [created, ...books];
    return ok(config, created, 'Catatan berhasil ditambahkan');
  }

  // PUT /books/:id
  if (method === 'PUT' && idMatch) {
    const index = books.findIndex((item) => item.id === Number(idMatch[1]));
    if (index === -1) return fail(config, 404, 'Catatan tidak ditemukan');
    const body = parseBody<IBookPayload>(config.data);
    const updated: IBook = { ...books[index], ...body };
    books[index] = updated;
    return ok(config, updated, 'Catatan berhasil diperbarui');
  }

  return fail(config, 404, 'Endpoint tidak ditemukan');
};
