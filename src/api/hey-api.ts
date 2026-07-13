import { Configs } from "../constant/config";
import type { CreateClientConfig } from "./generated/client.gen";

// https://heyapi.dev/openapi-ts/clients/axios#runtime-api
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseURL: Configs.API_URL,
  throwOnError: true,
});
