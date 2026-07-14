import { atom } from "jotai";

export type OrderStatusFilter = "all" | "fulfilled" | "pending";
export type OrderCreatedSort = "newest" | "oldest";

export type OrderListOptions = {
  sort: OrderCreatedSort;
  status: OrderStatusFilter;
};

export const defaultOrderListOptions: OrderListOptions = {
  sort: "newest",
  status: "all",
};

export const orderListOptionsAtom = atom<OrderListOptions>(
  defaultOrderListOptions,
);
