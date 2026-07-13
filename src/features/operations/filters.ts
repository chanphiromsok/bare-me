import { atom } from "jotai";

export type OrderFilter = "all" | "draft" | "fulfilled" | "pending";

export const orderFilterAtom = atom<OrderFilter>("all");
