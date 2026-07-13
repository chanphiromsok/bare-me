import type { PropsWithChildren } from "react";
import {
  type EdgeInsets,
  initialWindowMetrics,
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { Uniwind } from "uniwind";

const onSafeAreaChange = ({ insets }: { insets: EdgeInsets }) => {
  Uniwind.updateInsets(insets);
};

const UniwindWithSafeAreaProvider = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SafeAreaListener onChange={onSafeAreaChange}>
        {children}
      </SafeAreaListener>
    </SafeAreaProvider>
  );
};

export default UniwindWithSafeAreaProvider;
