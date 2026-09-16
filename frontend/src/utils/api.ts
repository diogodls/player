import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:3000" : undefined);

if (!backendUrl) {
  throw new Error("Configure VITE_BACKEND_URL para Production e Preview no Vercel e gere um novo build.");
}

export const backendApi = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // necessário para enviar o cookie de refresh token
});
