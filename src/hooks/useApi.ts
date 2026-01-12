import useSWR from "swr";
import { fetcher } from "../utils/api.ts";

export function useApi<T>(endpoint: string | null) {
  const { data, error, isLoading } = useSWR<T>(
    endpoint,
    endpoint ? fetcher : null
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
