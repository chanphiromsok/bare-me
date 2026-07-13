import { AuthTokenStore } from "../../storage/secureStore";
import { AuthUserStore, type AuthUser } from "../../storage/authUserStore";
import { setApiAccessToken } from "../configureClient";

export async function saveAuthSession(
  user: AuthUser,
  accessToken: string,
): Promise<void> {
  await AuthTokenStore.setAccessToken(accessToken);

  try {
    AuthUserStore.setUser(user);
    setApiAccessToken(accessToken);
  } catch (error) {
    await AuthTokenStore.clearAccessToken();
    throw error;
  }
}

export async function clearAuthSession(): Promise<void> {
  AuthUserStore.clearUser();
  await AuthTokenStore.clearAccessToken();
  setApiAccessToken(null);
}
