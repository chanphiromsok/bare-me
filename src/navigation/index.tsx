import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/login/LoginScreen";
import OperationTabs from "./operationTabs";
import Tabs from "./tabs";

const RootStack = createNativeStackNavigator({
  initialRouteName: "OperationTabs",
  screens: {
    Tabs: {
      screen: Tabs,
      options: {
        headerShown: false,
      },
    },
    OperationTabs: {
      screen: OperationTabs,
      options: {
        headerShown: false,
      },
    },
    Login: {
      screen: LoginScreen,
      options: {
        headerShown: false,
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default Navigation;
