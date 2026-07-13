import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppIcon from "../components/icons/AppIcon";
import CustomersScreen from "../screens/customers/CustomersScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import MoreScreen from "../screens/more/MoreScreen";
import ProductsScreen from "../screens/products/ProductsScreen";
import { colors } from "../theme";
import OrdersStack from "./ordersStack";

const OperationTabs = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: colors.tabActive,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "600",
      lineHeight: 15,
    },
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      height: 82,
      paddingBottom: 12,
      paddingTop: 8,
    },
  },
  screens: {
    Home: {
      screen: DashboardScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="dashboard" color={color} size={size} />
        ),
      },
    },
    Orders: {
      screen: OrdersStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="operation" color={color} size={size} />
        ),
      },
    },
    Products: {
      screen: ProductsScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="parcel" color={color} size={size} />
        ),
      },
    },
    Customers: {
      screen: CustomersScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="self-service" color={color} size={size} />
        ),
      },
    },
    More: {
      screen: MoreScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="filter-lines" color={color} size={size} />
        ),
      },
    },
  },
});

export default OperationTabs;
