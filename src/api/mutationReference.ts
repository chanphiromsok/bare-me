import { isAxiosError } from "axios";

type CryptoWithRandomUuid = {
  randomUUID?: () => string;
};

type JsonApiErrorDocument = {
  errors?: { detail?: string }[];
};

function fallbackUuid(): string {
  const bytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256),
  );
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export function createMutationUuid(): string {
  const crypto = globalThis.crypto as CryptoWithRandomUuid | undefined;
  return crypto?.randomUUID?.() ?? fallbackUuid();
}

export function createExternalReference(kind: string, uuid: string): string {
  return `mobile-${kind}-${uuid}`;
}

export function isDuplicateMutationError(error: unknown): boolean {
  if (!isAxiosError<JsonApiErrorDocument>(error)) return false;

  return Boolean(
    error.response?.data?.errors?.some((item) =>
      item.detail?.includes("has already been taken"),
    ),
  );
}
