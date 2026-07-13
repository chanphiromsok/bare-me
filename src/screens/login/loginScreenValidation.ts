import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import type { Resolver } from "react-hook-form";

export const loginSchema = type({
  email: "string.email",
  password: "string >= 8",
});

export type LoginFormValues = typeof loginSchema.infer;

export const loginDefaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export const loginResolver: Resolver<
  LoginFormValues,
  unknown,
  LoginFormValues
> = arktypeResolver(loginSchema);
