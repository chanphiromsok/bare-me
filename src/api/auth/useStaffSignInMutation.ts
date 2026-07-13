import { useMutation } from "@tanstack/react-query";

import type { AuthUser } from "../../storage/authUserStore";
import { postApiStaffSignIn } from "../generated/sdk.gen";
import { saveAuthSession } from "./session";

export type StaffSignInCredentials = {
  email: string;
  password: string;
};

function parseUser(
  document: Awaited<ReturnType<typeof postApiStaffSignIn>>["data"],
): {
  accessToken: string;
  user: AuthUser;
} {
  if (!document) {
    throw new Error("The sign-in response did not contain a valid session.");
  }

  const resource = document.data;
  const attributes = resource?.attributes;
  const accessToken = document.meta?.token;

  if (
    !resource ||
    !attributes ||
    typeof accessToken !== "string" ||
    typeof attributes.active !== "boolean" ||
    typeof attributes.email !== "string" ||
    typeof attributes.name !== "string" ||
    (attributes.role !== "admin" && attributes.role !== "staff")
  ) {
    throw new Error("The sign-in response did not contain a valid session.");
  }

  return {
    accessToken,
    user: {
      active: attributes.active,
      email: attributes.email,
      id: resource.id,
      name: attributes.name,
      role: attributes.role,
    },
  };
}

export function useStaffSignInMutation() {
  return useMutation({
    mutationFn: async (credentials: StaffSignInCredentials) => {
      const response = await postApiStaffSignIn({
        body: {
          data: {
            attributes: credentials,
            type: "user",
          },
        },
      });
      const session = parseUser(response.data);

      await saveAuthSession(session.user, session.accessToken);
      return session.user;
    },
  });
}
