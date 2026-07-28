import type { AxiosInstance } from "axios";
import useSWR from "swr";
import { backendApi } from "../utils/api.ts";

type UseApiOptions = {
  client?: AxiosInstance;
  keepPreviousData?: boolean;
};

export function useApi<T>(
  endpoint: string | null,
  { client = backendApi, keepPreviousData = true }: UseApiOptions = {},
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    endpoint,
    endpoint
      ? (url: string) => client.get<T>(url).then((response) => response.data)
      : null,
    { keepPreviousData },
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}
