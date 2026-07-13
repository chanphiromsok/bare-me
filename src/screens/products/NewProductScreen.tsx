import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { getApiErrorMessage } from "../../api/errorMessage";
import { useCreateProductMutation } from "../../api/operations/mutations";
import TextController from "../../components/form/TextController";
import TaskHeader from "../../components/operations/TaskHeader";

type ProductFormValues = {
  barcode: string;
  category: string;
  color: string;
  description: string;
  name: string;
  openingStock: string;
  price: string;
  size: string;
  sku: string;
};

const defaultValues: ProductFormValues = {
  barcode: "",
  category: "",
  color: "",
  description: "",
  name: "",
  openingStock: "0",
  price: "",
  size: "",
  sku: "",
};

export default function NewProductScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const createProduct = useCreateProductMutation();
  const { control, handleSubmit } = useForm<ProductFormValues>({
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await createProduct.mutateAsync({
        barcode: values.barcode.trim(),
        category: values.category.trim(),
        color: values.color.trim(),
        description: values.description.trim(),
        name: values.name.trim(),
        openingStock: Number.parseInt(values.openingStock, 10) || 0,
        priceCents: Math.round(Number.parseFloat(values.price) * 100),
        size: values.size.trim(),
        sku: values.sku.trim().toUpperCase(),
      });
      navigation.goBack();
    } catch {
      // Mutation state renders the API error below.
    }
  });

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Create a product with its first sellable variant."
        title="Add product"
      />
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerClassName="gap-5 p-5 pb-safe-offset-8"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <TextController
          autoCapitalize="words"
          control={control}
          label="Product name"
          name="name"
          placeholder="Enter product name"
          rules={{ required: "Product name is required" }}
        />
        <TextController
          autoCapitalize="words"
          control={control}
          label="Category (optional)"
          name="category"
          placeholder="e.g. Tops"
        />
        <TextController
          control={control}
          label="Description (optional)"
          multiline
          name="description"
          placeholder="Describe this product"
        />
        <Text className="pt-2 text-base font-bold text-foreground">
          First variant
        </Text>
        <TextController
          autoCapitalize="characters"
          control={control}
          label="SKU"
          name="sku"
          placeholder="e.g. CCT-8T-NAVY"
          rules={{ required: "SKU is required" }}
        />
        <TextController
          autoCapitalize="characters"
          control={control}
          label="Size"
          name="size"
          placeholder="e.g. 8T"
          rules={{ required: "Size is required" }}
        />
        <TextController
          autoCapitalize="words"
          control={control}
          label="Color"
          name="color"
          placeholder="e.g. Navy"
          rules={{ required: "Color is required" }}
        />
        <TextController
          control={control}
          keyboardType="decimal-pad"
          label="Price (USD)"
          name="price"
          placeholder="0.00"
          rules={{
            required: "Price is required",
            validate: (value) =>
              Number.parseFloat(value) > 0 || "Enter a price greater than zero",
          }}
        />
        <TextController
          control={control}
          keyboardType="number-pad"
          label="Opening stock"
          name="openingStock"
          placeholder="0"
          rules={{
            validate: (value) =>
              (Number.isInteger(Number(value)) && Number(value) >= 0) ||
              "Opening stock must be zero or more",
          }}
        />
        <TextController
          autoCapitalize="characters"
          control={control}
          label="Barcode (optional)"
          name="barcode"
          placeholder="Scan or enter barcode"
        />
        {createProduct.isError ? (
          <Text accessibilityRole="alert" className="text-sm text-danger">
            {getApiErrorMessage(
              createProduct.error,
              "Product could not be created.",
            )}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          className="min-h-13 items-center justify-center rounded-xl bg-primary active:bg-primary-pressed disabled:opacity-60"
          disabled={createProduct.isPending}
          onPress={submit}
        >
          <Text className="font-bold text-on-primary">
            {createProduct.isPending ? "Creating product…" : "Create product"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}
