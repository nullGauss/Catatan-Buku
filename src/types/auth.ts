// src/types/auth.ts

export interface ILoginPayload {
  email: string;
  password: string;
}

/** Data user yang dikembalikan backend setelah login */
export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  token: string;
}
