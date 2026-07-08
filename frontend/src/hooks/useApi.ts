import type { AxiosInstance } from "axios";
import useSWR from "swr";
import { backendApi } from "../utils/api.ts";

type UseApiOptions = {
  client?: AxiosInstance;
};

export function useApi<T>(
  endpoint: string | null,
  { client = backendApi }: UseApiOptions = {},
) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    endpoint,
    endpoint
      ? (url: string) => client.get<T>(url).then((response) => response.data)
      : null,
  );

  return {
    data,
    error,
    isLoading,
    isError: error,
    mutate,
  };
}
