import { atom } from "jotai";

export type OrderFilter =
  "all" | "cancelled" | "draft" | "fulfilled" | "pending" | "returned";

export const orderFilterAtom = atom<OrderFilter>("all");
