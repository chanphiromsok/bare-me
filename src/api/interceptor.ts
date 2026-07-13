import type { AxiosError } from "axios";

import { client } from "./generated/client.gen";
import { AuthTokenStore } from "../storage/secureStore";

client.instance.interceptors.request.use(async (config) => {
  const accessToken = await AuthTokenStore.getAccessToken();

  config.headers.set("Accept", "application/json");

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

client.instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
