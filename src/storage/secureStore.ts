import * as SecureStore from "expo-secure-store";

import { Configs } from "../constant/config";

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  keychainService: "bare.auth",
};

async function setAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(
    Configs.storageKeys.accessToken,
    accessToken,
    secureStoreOptions,
  );
}

async function getAccessToken(): Promise<string | null> {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (!isAvailable) {
    return null;
  }

  return SecureStore.getItemAsync(
    Configs.storageKeys.accessToken,
    secureStoreOptions,
  );
}

async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(
    Configs.storageKeys.accessToken,
    secureStoreOptions,
  );
}

export const AuthTokenStore = {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
};
