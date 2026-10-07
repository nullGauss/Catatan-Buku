// src/services/authService.ts
import { axiosInstance } from './axiosInstance';
import type { IAuthUser, ILoginPayload } from '../types/auth';
import type { IResponseEntity } from '../types/api';

export const loginService = async (
  payload: ILoginPayload,
): Promise<IResponseEntity<IAuthUser>> => {
  const res = await axiosInstance.post<IResponseEntity<IAuthUser>>(
    '/auth/login',
    payload,
  );
  return res.data;
};
