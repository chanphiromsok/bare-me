import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import NewOrderScreen from "../screens/orders/NewOrderScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";

const screenOptions: NativeStackNavigationOptions = {
  animation: "slide_from_right",
  headerShown: false,
};

const OrdersStack = createNativeStackNavigator({
  screenOptions,
  screens: {
    OrderList: OrdersScreen,
    OrderDetail: {
      screen: OrderDetailScreen,
      linking: "orders/:orderId",
    },
    NewOrder: NewOrderScreen,
  },
});

export type OrdersStackParamList = {
  NewOrder: undefined;
  OrderDetail: { orderId: string };
  OrderList: undefined;
};
export default OrdersStack;
