"use client";

import { useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";
import type { ApiResponse } from "@/types";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<ApiResponse<T>>,
  options?: { showErrorToast?: boolean; showSuccessToast?: boolean; successMessage?: string }
): UseApiReturn<T> {
  const { showErrorToast = true, showSuccessToast = false, successMessage } = options || {};
  const { enqueueSnackbar } = useSnackbar();

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiFn(...args);
        const data = response.data as T;
        setState({ data, loading: false, error: null });
        if (showSuccessToast && successMessage) {
          enqueueSnackbar(successMessage, { variant: "success" });
        }
        return data;
      } catch (err) {
        const axiosErr = err as AxiosError<ApiResponse>;
        const message =
          axiosErr.response?.data?.message || axiosErr.message || "Something went wrong";
        setState((prev) => ({ ...prev, loading: false, error: message }));
        if (showErrorToast) {
          enqueueSnackbar(message, { variant: "error" });
        }
        return null;
      }
    },
    [apiFn, enqueueSnackbar, showErrorToast, showSuccessToast, successMessage]
  );

  return { ...state, execute };
}
