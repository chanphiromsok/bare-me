import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getApiErrorMessage } from "../../api/errorMessage";
import { useCreateCustomerMutation } from "../../api/operations/mutations";
import TextController from "../../components/form/TextController";
import TaskHeader from "../../components/operations/TaskHeader";

type CustomerFormValues = {
  businessName: string;
  email: string;
  name: string;
  phone: string;
};

const defaultValues: CustomerFormValues = {
  businessName: "",
  email: "",
  name: "",
  phone: "",
};

export default function NewCustomerScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const createCustomer = useCreateCustomerMutation();
  const [customerType, setCustomerType] = useState<"retail" | "wholesale">(
    "retail",
  );
  const { control, handleSubmit } = useForm<CustomerFormValues>({
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await createCustomer.mutateAsync({
        businessName: values.businessName.trim(),
        customerType,
        email: values.email.trim(),
        name: values.name.trim(),
        phone: values.phone.trim(),
      });
      navigation.goBack();
    } catch {
      // Mutation state renders the API error below.
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Create a profile for orders and customer history."
        title="Add customer"
      />
      <ScrollView
        contentContainerClassName="gap-5 p-5 pb-safe-offset-8"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">
            Customer type
          </Text>
          <View className="flex-row gap-2">
            {(["retail", "wholesale"] as const).map((type) => (
              <Pressable
                accessibilityRole="button"
                className={
                  customerType === type
                    ? "min-h-11 flex-1 items-center justify-center rounded-xl bg-primary"
                    : "min-h-11 flex-1 items-center justify-center rounded-xl border border-border bg-surface"
                }
                key={type}
                onPress={() => setCustomerType(type)}
              >
                <Text
                  className={
                    customerType === type
                      ? "font-semibold capitalize text-on-primary"
                      : "font-semibold capitalize text-subtle"
                  }
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <TextController
          autoCapitalize="words"
          control={control}
          label="Contact name"
          name="name"
          placeholder="Dara Sok"
          rules={{ required: "Contact name is required" }}
        />
        <TextController
          autoCapitalize="words"
          control={control}
          label="Business name (optional)"
          name="businessName"
          placeholder="Dara Retail"
        />
        <TextController
          autoCapitalize="none"
          control={control}
          keyboardType="email-address"
          label="Email (optional)"
          name="email"
          placeholder="customer@example.com"
        />
        <TextController
          control={control}
          keyboardType="phone-pad"
          label="Phone (optional)"
          name="phone"
          placeholder="+855 12 345 678"
        />
        {createCustomer.isError ? (
          <Text accessibilityRole="alert" className="text-sm text-danger">
            {getApiErrorMessage(
              createCustomer.error,
              "Customer could not be created.",
            )}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          className="min-h-13 items-center justify-center rounded-xl bg-primary active:bg-primary-pressed disabled:opacity-60"
          disabled={createCustomer.isPending}
          onPress={submit}
        >
          <Text className="font-bold text-on-primary">
            {createCustomer.isPending
              ? "Creating customer…"
              : "Create customer"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
