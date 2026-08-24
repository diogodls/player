import axios from "axios";

export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000",
  withCredentials: true, // necessário para enviar o cookie de refresh token
});
