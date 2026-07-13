import type { StaticParamList } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import NewOrderScreen from "../screens/orders/NewOrderScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";

const screenOptions: NativeStackNavigationOptions = {
  animation: "slide_from_right",
  headerShown: false,
};

const OrdersStack = createNativeStackNavigator({
  screenOptions,
  screens: {
    OrderList: OrdersScreen,
    NewOrder: NewOrderScreen,
  },
});

export type OrdersStackParamList = StaticParamList<typeof OrdersStack>;
export default OrdersStack;
