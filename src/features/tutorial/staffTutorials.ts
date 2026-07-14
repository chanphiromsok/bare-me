import type { AppIconName } from "../../components/icons/AppIcon";

export type StaffTutorialId =
  | "sale-order"
  | "preorder"
  | "new-product"
  | "restock";

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
        title: "Use an in-stock sale",
        description:
          "This is the real order type control. Keep In-stock sale selected when the products are already available.",
      },
      {
        id: "order-customer",
        title: "Choose the customer",
        description:
          "Select the customer who is buying. If they are missing, leave this screen and create the customer first.",
      },
      {
        id: "order-products",
        title: "Add product variants",
        description:
          "Search the real catalog, then use the plus button on the correct size and color. Check available stock and quantity.",
      },
      {
        id: "order-complete",
        title: "Review payment and complete",
        description:
          "Choose the payment method and review the item count and total. In normal mode, Complete sale creates the order and deducts stock. It is disabled in this guide.",
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
        title: "Use Preorder",
        description:
          "This real order screen starts with Preorder selected. Use it for chat requests even when stock is zero.",
      },
      {
        id: "order-customer",
        title: "Choose the customer",
        description:
          "Select the customer who requested the products so staff can follow up when stock arrives.",
      },
      {
        id: "order-products",
        title: "Add requested variants",
        description:
          "Search the catalog and add the exact size, color, and quantity requested. Preorders can exceed current stock.",
      },
      {
        id: "order-complete",
        title: "Review and confirm later",
        description:
          "In normal mode, confirm the expected total here. When stock arrives, open the order to allocate, record payment, and fulfill it. This guide creates nothing.",
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
  return staffTutorials.find((tutorial) => tutorial.id === id) ?? staffTutorials[0];
}
