import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppIcon from "../components/icons/AppIcon";
import HomeScreen from "../screens/home/HomeScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import { colors } from "../theme";

const Tabs = createBottomTabNavigator({
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
    Home: {
      screen: HomeScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="home" color={color} size={size} />
        ),
      },
    },
    History: {
      screen: () => <PlaceholderScreen title="History" />,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="history" color={color} size={size} />
        ),
      },
    },
    Scan: {
      screen: () => <PlaceholderScreen title="Scan" />,
      options: {
        tabBarIcon: ({ color, focused }) => (
          <AppIcon name="scan" color={color} size={focused ? 34 : 30} />
        ),
      },
    },
    Location: {
      screen: () => <PlaceholderScreen title="Location" />,
      options: {
        tabBarIcon: ({ color, size }) => (
          <AppIcon name="location" color={color} size={size} />
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

export default Tabs;
