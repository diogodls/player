import axios from "axios";

export const mockApi = axios.create({ baseURL: "http://localhost:3001" });
export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000",
});
