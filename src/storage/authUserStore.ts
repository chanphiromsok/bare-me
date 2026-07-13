import { useMMKVObject } from "react-native-mmkv";

import { Configs } from "../constant/config";
import { appStorage } from "./mmkv";

export type AuthUser = {
  active: boolean;
  email: string;
  id: string;
  name: string;
  role: "admin" | "staff";
};

const authUserKey = Configs.storageKeys.userInfo;

function getUser(): AuthUser | null {
  const value = appStorage.getString(authUserKey);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    appStorage.remove(authUserKey);
    return null;
  }
}

function setUser(user: AuthUser): void {
  appStorage.set(authUserKey, JSON.stringify(user));
}

function clearUser(): void {
  appStorage.remove(authUserKey);
}

function hasUser(): boolean {
  return getUser() !== null;
}

export function useAuthUser() {
  return useMMKVObject<AuthUser>(authUserKey, appStorage);
}

export const AuthUserStore = {
  clearUser,
  getUser,
  hasUser,
  setUser,
};
