import { atom } from "jotai";

export type OrderFilter =
  "all" | "cancelled" | "draft" | "fulfilled" | "pending";

export const orderFilterAtom = atom<OrderFilter>("all");
