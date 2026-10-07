// src/services/bookService.ts
import { axiosInstance } from './axiosInstance';
import type { IBook, IBookPayload } from '../types/book';
import type { IResponseEntity } from '../types/api';

export const fetchBooks = async (
  page: number,
  limit: number,
): Promise<IResponseEntity<IBook[]>> => {
  const res = await axiosInstance.get<IResponseEntity<IBook[]>>('/books', {
    params: { page, limit },
  });
  return res.data;
};

export const fetchBookById = async (
  id: number,
): Promise<IResponseEntity<IBook>> => {
  const res = await axiosInstance.get<IResponseEntity<IBook>>(`/books/${id}`);
  return res.data;
};

export const createBook = async (
  payload: IBookPayload,
): Promise<IResponseEntity<IBook>> => {
  const res = await axiosInstance.post<IResponseEntity<IBook>>(
    '/books',
    payload,
  );
  return res.data;
};

export const updateBook = async (
  id: number,
  payload: IBookPayload,
): Promise<IResponseEntity<IBook>> => {
  const res = await axiosInstance.put<IResponseEntity<IBook>>(
    `/books/${id}`,
    payload,
  );
  return res.data;
};
