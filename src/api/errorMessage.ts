import { isAxiosError } from "axios";

type JsonApiErrorDocument = {
  errors?: { detail?: string; title?: string }[];
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!isAxiosError<JsonApiErrorDocument>(error)) return fallback;

  const apiError = error.response?.data?.errors?.[0];
  return apiError?.detail || apiError?.title || fallback;
}
