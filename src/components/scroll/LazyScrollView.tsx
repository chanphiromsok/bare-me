import React, { type ForwardedRef, type JSX } from "react";
import {
  LegendList,
  type LegendListProps,
  type LegendListRef,
} from "@legendapp/list/react-native";

type LazyScrollViewProps = {
  ref?: ForwardedRef<LegendListRef>;
  children: React.ReactNode;
  drawDistance?: number;
} & Omit<
  LegendListProps<React.ReactNode>,
  "children" | "data" | "renderItem" | "getItemType" | "drawDistance"
>;

export const LazyScrollView = ({
  ref,
  children,
  drawDistance = 1000,
  ...props
}: LazyScrollViewProps): JSX.Element => {
  return (
    <LegendList ref={ref} {...props} drawDistance={drawDistance}>
      {children}
    </LegendList>
  );
};
