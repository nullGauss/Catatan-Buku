// src/types/book.ts

/** Satu catatan buku */
export interface IBook {
  id: number;
  title: string;
  author: string;
  year: number;
  category: string;
}

/** Payload create/update buku (tanpa id) */
export type IBookPayload = Omit<IBook, 'id'>;

/** Query param list buku */
export interface IBookListParams {
  page: number;
  limit: number;
  search?: string;
}
