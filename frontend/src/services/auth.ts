import { backendApi } from '../utils/api';

export async function loginRequest(email: string, senha: string): Promise<string> {
  const res = await backendApi.post<{ accessToken: string }>('/auth/login', { email, senha });
  return res.data.accessToken;
}

export async function refreshRequest(): Promise<string> {
  const res = await backendApi.post<{ accessToken: string }>('/auth/refresh');
  return res.data.accessToken;
}

export async function logoutRequest(): Promise<void> {
  await backendApi.post('/auth/logout');
}
