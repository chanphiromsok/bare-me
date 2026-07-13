import "./global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { PortalProvider } from "react-native-teleport";
import { queryClient } from "./src/api/queryClient";
import UniwindWithSafeAreaProvider from "./src/ctx/SafeAreaUniwindProvider";
import I18nProvider from "./src/i18n/i18nProvider";
import Navigation from "./src/navigation";
import { navigationTheme } from "./src/theme";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <PortalProvider>
            <UniwindWithSafeAreaProvider>
              <I18nProvider>
                <Navigation theme={navigationTheme} />
                <StatusBar style="dark" />
              </I18nProvider>
            </UniwindWithSafeAreaProvider>
          </PortalProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: navigationTheme.colors.background,
  },
});
