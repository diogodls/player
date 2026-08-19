import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // necessário para enviar o cookie de refresh token
});

export async function loginRequest(email: string, senha: string): Promise<string> {
  const res = await apiClient.post<{ accessToken: string }>('/auth/login', { email, senha });
  return res.data.accessToken;
}

export async function refreshRequest(): Promise<string> {
  const res = await apiClient.post<{ accessToken: string }>('/auth/refresh');
  return res.data.accessToken;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}
