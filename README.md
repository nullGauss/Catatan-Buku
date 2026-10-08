# Catatan Buku — Frontend

Aplikasi CRUD catatan buku untuk latihan PKL di PT. LSKK. Frontend React + TypeScript yang berjalan penuh tanpa backend memakai **mock adapter** lokal.

## Fitur

- Login (mock) dengan proteksi route
- Tambah, edit, hapus, dan daftar catatan buku
- Pagination server side (React Data Grid + tombol halaman)
- Validasi form dengan Zod (pesan error berbahasa Indonesia)
- Cache data dengan React Query (staleTime 30 detik)
- UI Ant Design + Tailwind CSS

## Stack

React 19 · TypeScript · Vite · Ant Design · MUI X Data Grid · TanStack React Query · Zustand · React Hook Form · Zod · Axios · Tailwind CSS

## Setup

1. Clone repo dan install dependency:

   ```bash
   git clone https://github.com/nullGauss/Catatan-Buku.git
   cd Catatan-Buku
   npm install
   ```

2. Salin file env lalu sesuaikan bila perlu:

   ```bash
   copy .env.example .env
   ```

   | Variabel            | Keterangan                                    | Default                      |
   | ------------------- | --------------------------------------------- | ---------------------------- |
   | `VITE_API_BASE_URL` | Base URL API backend                          | `http://localhost:8000/api/v1` |
   | `VITE_APP_NAME`     | Nama aplikasi (ditampilkan di header)         | `Catatan Buku`               |
   | `VITE_USE_MOCK`     | `true` = pakai mock lokal, `false` = ke backend | `true`                     |

3. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:5173`.

## Mode Mock

Selama `VITE_USE_MOCK=true`, seluruh request diarahkan ke mock adapter lokal di `src/services/mockAdapter.ts` — tidak perlu backend berjalan. Akun demo **hanya ditampilkan di halaman login** saat mode mock aktif:

```
Email    : admin@gmail.com
Password : rahasia123
```

Untuk memakai backend sungguhan, set `VITE_USE_MOCK=false` dan isi `VITE_API_BASE_URL` dengan alamat backend yang benar.

## Scripts

| Perintah             | Fungsi                                    |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Jalankan dev server (Vite)                |
| `npm run build`      | Type check (`tsc -b`) lalu build produksi |
| `npm run preview`    | Pratinjau hasil build                     |
| `npm run lint`       | Jalankan ESLint                           |
| `npm run format`     | Format kode dengan Prettier              |
| `npm run format:check` | Cek format tanpa menulis file           |
