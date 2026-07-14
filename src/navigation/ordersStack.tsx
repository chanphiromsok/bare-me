import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import NewOrderScreen from "../screens/orders/NewOrderScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import OrderFiltersScreen from "../screens/orders/OrderFiltersScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import { colors } from "../theme/colors";

const screenOptions: NativeStackNavigationOptions = {
  animation: "slide_from_right",
  headerShown: false,
};

const OrdersStack = createNativeStackNavigator({
  screenOptions,
  screens: {
    OrderList: OrdersScreen,
    OrderFilters: {
      screen: OrderFiltersScreen,
      options: {
        contentStyle: { backgroundColor: colors.surface },
        presentation: "formSheet",
        sheetAllowedDetents: "fitToContents",
        sheetCornerRadius: 28,
        sheetGrabberVisible: true,
      },
    },
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
  OrderFilters: undefined;
  OrderList: undefined;
};
export default OrdersStack;
