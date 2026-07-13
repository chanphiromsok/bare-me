import { Configs } from "../constant/config";
import { AuthTokenStore } from "../storage/secureStore";
import { AuthUserStore } from "../storage/authUserStore";
import { client } from "./generated/client.gen";

const jsonApiMediaType = "application/vnd.api+json";

export function setApiAccessToken(accessToken: string | null): void {
  client.setConfig({
    baseURL: Configs.API_URL,
    headers: {
      Accept: jsonApiMediaType,
      Authorization: accessToken ? `Bearer ${accessToken}` : null,
    },
  });
}

export async function initializeApiClient(): Promise<boolean> {
  try {
    const [accessToken, user] = await Promise.all([
      AuthTokenStore.getAccessToken(),
      Promise.resolve(AuthUserStore.getUser()),
    ]);

    if (accessToken && user) {
      setApiAccessToken(accessToken);
      return true;
    }

    AuthUserStore.clearUser();
    await AuthTokenStore.clearAccessToken();
    setApiAccessToken(null);
    return false;
  } catch {
    AuthUserStore.clearUser();
    setApiAccessToken(null);
    return false;
  }
}
