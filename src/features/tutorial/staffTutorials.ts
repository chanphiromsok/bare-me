import type { AppIconName } from "../../components/icons/AppIcon";

export type StaffTutorialId =
  "sale-order" | "preorder" | "new-product" | "restock";

export type StaffTutorialStep = {
  description: string;
  id: string;
  title: string;
};

export type StaffTutorial = {
  duration: string;
  icon: AppIconName;
  id: StaffTutorialId;
  steps: StaffTutorialStep[];
  summary: string;
  title: string;
};

export const staffTutorials: StaffTutorial[] = [
  {
    id: "sale-order",
    icon: "dollar-circle",
    title: "Create a sale order",
    summary: "Sell in-stock items and collect payment safely.",
    duration: "About 2 min",
    steps: [
      {
        id: "order-type",
        title: "Check the order type",
        description:
          "Sale is the default when products are already available. Tap this compact control only when you need to change the order to a preorder.",
      },
      {
        id: "order-customer",
        title: "Choose the customer",
        description:
          "Open the customer sheet and select who is buying. The customer stays attached while you browse products and review the order.",
      },
      {
        id: "order-products",
        title: "Browse the product catalog",
        description:
          "Products now fill the main screen. Search or filter the catalog, then use the plus button on the correct size and color.",
      },
      {
        id: "order-complete",
        title: "Review before completing",
        description:
          "The cart bar keeps the item count and total visible. Tap Review order to check the customer, quantities, and payment before completing the sale.",
      },
    ],
  },
  {
    id: "preorder",
    icon: "calendar",
    title: "Create and fulfill a preorder",
    summary: "Reserve requested products before stock arrives.",
    duration: "About 3 min",
    steps: [
      {
        id: "order-type",
        title: "Check Preorder mode",
        description:
          "This practice order starts in Preorder mode. The compact order-type control explains when inventory will be deducted.",
      },
      {
        id: "order-customer",
        title: "Choose the customer",
        description:
          "Open the customer sheet and select who requested the products so staff can follow up when stock arrives.",
      },
      {
        id: "order-products",
        title: "Browse the full catalog",
        description:
          "Search the full-screen catalog and add the exact size, color, and quantity requested. Preorders can include zero-stock variants.",
      },
      {
        id: "order-complete",
        title: "Review the preorder",
        description:
          "The cart bar shows the expected total. Review the customer and quantities before confirming; this practice guide still creates nothing.",
      },
    ],
  },
  {
    id: "new-product",
    icon: "parcel",
    title: "Create a product",
    summary: "Learn the real product and first-variant form.",
    duration: "About 2 min",
    steps: [
      {
        id: "product-details",
        title: "Describe the product",
        description:
          "Enter the product name first. Category and description help staff find and understand the product later.",
      },
      {
        id: "product-variant",
        title: "Create the first variant",
        description:
          "Every sellable item needs a unique SKU plus its size and color. Check these carefully before saving.",
      },
      {
        id: "product-stock",
        title: "Set price and opening stock",
        description:
          "Enter the selling price. Use opening stock only for units already on hand; zero is correct for a preorder-only product.",
      },
      {
        id: "product-create",
        title: "Add barcode and review",
        description:
          "A barcode is optional. Review every field before Create product. The button is disabled here, so this guide saves nothing.",
      },
    ],
  },
  {
    id: "restock",
    icon: "shipment-box",
    title: "Restock a product",
    summary: "Receive inventory and update the available quantity.",
    duration: "About 2 min",
    steps: [
      {
        id: "restock-search",
        title: "Find the product",
        description:
          "Use this real search field to find a product by name or SKU.",
      },
      {
        id: "restock-variants",
        title: "Choose the exact variant",
        description:
          "Select the correct size, color, and SKU. Always verify the current stock before receiving more.",
      },
      {
        id: "restock-quantity",
        title: "Enter received quantity",
        description:
          "Enter the number of units received as a positive quantity. The app handles the stock increase.",
      },
      {
        id: "restock-confirm",
        title: "Review and confirm",
        description:
          "In normal mode, Confirm restock increases inventory. It is disabled in this guide, so stock will not change.",
      },
    ],
  },
];

export function findStaffTutorial(id: string | undefined) {
  return (
    staffTutorials.find((tutorial) => tutorial.id === id) ?? staffTutorials[0]
  );
}
