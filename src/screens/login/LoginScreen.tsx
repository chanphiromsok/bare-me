import { CommonActions, useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TextController from "../../components/form/TextController";
import { colors } from "../../theme";
import {
  loginDefaultValues,
  type LoginFormValues,
  loginResolver,
} from "./loginScreenValidation";

export default function LoginScreen() {
  const navigation = useNavigation();
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<LoginFormValues>({
    defaultValues: loginDefaultValues,
    resolver: loginResolver,
  });

  const onSubmit = (_values: LoginFormValues) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      }),
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Sign in with your account.</Text>
        </View>

        <View style={styles.form}>
          <TextController
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            keyboardType="email-address"
            label="Email"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
          />
          <TextController
            autoComplete="password"
            control={control}
            label="Password"
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="password"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.submitButton,
            pressed ? styles.submitButtonPressed : null,
            isSubmitting ? styles.submitButtonDisabled : null,
          ]}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    padding: 24,
  },
  form: {
    gap: 16,
  },
  header: {
    gap: 8,
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  submitText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
});
