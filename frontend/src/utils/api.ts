import axios from "axios";

const api = axios.create({ baseURL:"http://localhost:3001" });

export const fetcher = (url: string) =>
  api.get(url).then((res) => res.data);
