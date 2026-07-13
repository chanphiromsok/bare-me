import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppIcon from "../components/icons/AppIcon";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import { colors } from "../theme";

const OperationTabs = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: colors.tabActive,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarLabelStyle: {
      fontSize: 12,
      lineHeight: 16,
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
    Dashboard: {
      screen: DashboardScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="dashboard" color={color} size={size} />
        ),
      },
    },
    Operation: {
      screen: () => <PlaceholderScreen title="Operation" />,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="operation" color={color} size={size} />
        ),
      },
    },
    Notifications: {
      screen: () => <PlaceholderScreen title="Notifications" />,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="notification" color={color} size={size} />
        ),
      },
    },
    Account: {
      screen: () => <PlaceholderScreen title="Account" />,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="profile" color={color} size={size} />
        ),
      },
    },
  },
});

export default OperationTabs;
