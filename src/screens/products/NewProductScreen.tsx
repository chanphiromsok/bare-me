import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
  useRoute,
} from "@react-navigation/native";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";

import { getApiErrorMessage } from "../../api/errorMessage";
import { useCreateProductMutation } from "../../api/operations/mutations";
import TextController from "../../components/form/TextController";
import TaskHeader from "../../components/operations/TaskHeader";
import LiveTutorialOverlay from "../../features/tutorial/LiveTutorialOverlay";
import {
  findStaffTutorial,
  type StaffTutorialId,
} from "../../features/tutorial/staffTutorials";
import { useLiveTutorialController } from "../../features/tutorial/useLiveTutorialController";

type NewProductRoute = RouteProp<
  { NewProduct: { tutorialId?: StaffTutorialId } | undefined },
  "NewProduct"
>;

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
  const route = useRoute<NewProductRoute>();
  const scrollRef = useRef<KeyboardAwareScrollViewRef | null>(null);
  const targetLayoutsRef = useRef<Record<string, number>>({});
  const tutorial = route.params?.tutorialId
    ? findStaffTutorial(route.params.tutorialId)
    : null;
  const tutorialMode = tutorial?.id === "new-product";
  const { showStep: showTutorialStep, startOnLayout, tour } =
    useLiveTutorialController({
      enabled: tutorialMode,
      onBeforeStep: (index) => {
        const step = tutorial?.steps[index];
        const targetY = step ? (targetLayoutsRef.current[step.id] ?? 0) : 0;
        scrollRef.current?.scrollTo({
          animated: true,
          y: Math.max(targetY - 20, 0),
        });
      },
      steps: tutorial?.steps ?? [],
    });
  const createProduct = useCreateProductMutation();
  const { control, handleSubmit } = useForm<ProductFormValues>({
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    if (tutorialMode) return;

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

  const rememberTargetLayout = (id: string, event: LayoutChangeEvent) => {
    targetLayoutsRef.current[id] = event.nativeEvent.layout.y;
  };

  return (
    <View className="flex-1 bg-background" onLayout={startOnLayout}>
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle={
          tutorialMode
            ? "Practice guide · Nothing will be saved"
            : "Create a product with its first sellable variant."
        }
        title="Add product"
      />
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerClassName="gap-5 p-5 pb-safe-offset-8"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
      >
        <View
          {...(tutorialMode
            ? tour.getTargetProps("product-details")
            : undefined)}
          className="gap-5"
          onLayout={(event) => rememberTargetLayout("product-details", event)}
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
        </View>
        <View
          {...(tutorialMode
            ? tour.getTargetProps("product-variant")
            : undefined)}
          className="gap-5"
          onLayout={(event) => rememberTargetLayout("product-variant", event)}
        >
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
        </View>
        <View
          {...(tutorialMode
            ? tour.getTargetProps("product-stock")
            : undefined)}
          className="gap-5"
          onLayout={(event) => rememberTargetLayout("product-stock", event)}
        >
          <TextController
            control={control}
            keyboardType="decimal-pad"
            label="Price (USD)"
            name="price"
            placeholder="0.00"
            rules={{
              required: "Price is required",
              validate: (value) =>
                Number.parseFloat(value) > 0 ||
                "Enter a price greater than zero",
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
        </View>
        <View
          {...(tutorialMode
            ? tour.getTargetProps("product-create")
            : undefined)}
          className="gap-5"
          onLayout={(event) => rememberTargetLayout("product-create", event)}
        >
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
            className="min-h-13 items-center justify-center rounded-xl bg-primary px-4 active:bg-primary-pressed disabled:opacity-60"
            disabled={tutorialMode || createProduct.isPending}
            onPress={submit}
          >
            <Text className="text-center font-bold text-on-primary">
              {tutorialMode
                ? "Practice only · Product will not be created"
                : createProduct.isPending
                  ? "Creating product…"
                  : "Create product"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
      {tutorialMode ? (
        <LiveTutorialOverlay
          onClose={() => navigation.goBack()}
          onStepChange={showTutorialStep}
          tour={tour}
        />
      ) : null}
    </View>
  );
}
