import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useStaffSignInMutation } from "../../api/auth/useStaffSignInMutation";
import TextController from "../../components/form/TextController";
import { colors } from "../../theme";
import {
  loginDefaultValues,
  type LoginFormValues,
  loginResolver,
} from "./loginScreenValidation";

export default function LoginScreen() {
  const signInMutation = useStaffSignInMutation();
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<LoginFormValues>({
    defaultValues: loginDefaultValues,
    resolver: loginResolver,
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signInMutation.mutateAsync(values);
    } catch {
      // The mutation state renders a safe message without exposing server data.
    }
  };

  const submitting = isSubmitting || signInMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>STAFF ACCESS</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage orders, products, customers, and inventory.
          </Text>
        </View>

        <View style={styles.form}>
          <TextController
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            keyboardType="email-address"
            label="Email"
            name="email"
            placeholder="Enter your email"
            textContentType="emailAddress"
          />
          <TextController
            autoComplete="password"
            control={control}
            label="Password"
            name="password"
            placeholder="Enter your password"
            secureTextEntry
            textContentType="password"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.submitButton,
            pressed ? styles.submitButtonPressed : null,
            submitting ? styles.submitButtonDisabled : null,
          ]}
        >
          <Text style={styles.submitText}>
            {submitting ? "Signing in..." : "Sign in"}
          </Text>
        </Pressable>
        {signInMutation.isError ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            Sign-in failed. Check your credentials and connection, then try
            again.
          </Text>
        ) : null}
        <Text style={styles.supportingText}>
          This app is for authorized staff and administrators only.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 28,
    padding: 24,
  },
  eyebrow: {
    color: colors.brandOrange,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
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
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 340,
  },
  supportingText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
});
