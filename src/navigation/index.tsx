import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";

import { initializeApiClient } from "../api/configureClient";
import { queryClient } from "../api/queryClient";
import LoginScreen from "../screens/login/LoginScreen";
import NewOrderScreen from "../screens/orders/NewOrderScreen";
import NewProductScreen from "../screens/products/NewProductScreen";
import RestockScreen from "../screens/products/RestockScreen";
import StaffGuideScreen from "../screens/tutorial/StaffGuideScreen";
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
    NewOrder: {
      if: useIsSignedIn,
      screen: NewOrderScreen,
      options: { headerShown: false },
    },
    NewProduct: {
      if: useIsSignedIn,
      screen: NewProductScreen,
      options: { headerShown: false },
    },
    Restock: {
      if: useIsSignedIn,
      screen: RestockScreen,
      options: { headerShown: false },
    },
    StaffGuide: {
      if: useIsSignedIn,
      screen: StaffGuideScreen,
      options: { headerShown: false },
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
    void initializeApiClient().then((signedIn) => {
      if (signedIn) {
        void queryClient.invalidateQueries();
      }
    });
  };

  return <StaticNavigation {...props} onReady={handleReady} />;
}
