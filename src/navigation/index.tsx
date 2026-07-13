import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";

import { initializeApiClient } from "../api/configureClient";
import LoginScreen from "../screens/login/LoginScreen";
import { useAuthUser } from "../storage/authUserStore";
import OperationTabs from "./operationTabs";

function useIsSignedIn() {
  const [user] = useAuthUser();

  return Boolean(user);
}

function useIsSignedOut() {
  return !useIsSignedIn();
}

const RootStack = createNativeStackNavigator({
  screens: {
    OperationTabs: {
      if: useIsSignedIn,
      screen: OperationTabs,
      options: {
        headerShown: false,
      },
    },
    Login: {
      if: useIsSignedOut,
      screen: LoginScreen,
      options: {
        headerShown: false,
      },
    },
  },
});

const StaticNavigation = createStaticNavigation(RootStack);

type NavigationProps = ComponentProps<typeof StaticNavigation>;

export default function Navigation({ onReady, ...props }: NavigationProps) {
  const handleReady = () => {
    onReady?.();
    void initializeApiClient();
  };

  return <StaticNavigation {...props} onReady={handleReady} />;
}
