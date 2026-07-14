import type { AppIconName } from "../../components/icons/AppIcon";

export type StaffTutorialId =
  | "sale-order"
  | "preorder"
  | "restock"
  | "cancel-return";

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
        id: "sale-customer",
        title: "Choose the customer",
        description:
          "Open New order and select the customer. Add them first if they are not in the list.",
      },
      {
        id: "sale-type",
        title: "Keep Sale selected",
        description:
          "Use Sale for items already in stock. The app checks available quantity before confirming.",
      },
      {
        id: "sale-products",
        title: "Add product variants",
        description:
          "Search for each variant, add it to the cart, and check the quantity and total.",
      },
      {
        id: "sale-confirm",
        title: "Choose payment and confirm",
        description:
          "Select the payment method, review the order once more, then confirm. Fulfilled sales deduct stock.",
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
        id: "preorder-customer",
        title: "Choose the customer",
        description:
          "Start a new order and select the customer who requested the product through chat.",
      },
      {
        id: "preorder-type",
        title: "Select Preorder",
        description:
          "Preorder allows staff to record demand even when the on-hand quantity is zero.",
      },
      {
        id: "preorder-products",
        title: "Add requested variants",
        description:
          "Add the exact variants and quantities, check the expected total, then confirm the preorder.",
      },
      {
        id: "preorder-fulfill",
        title: "Allocate and fulfill later",
        description:
          "After stock arrives, allocate it, record payment, and complete pickup or delivery. Stock is deducted when fulfilled.",
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
        id: "restock-open",
        title: "Open Restock",
        description:
          "From Home or Products, choose Restock to begin receiving inventory.",
      },
      {
        id: "restock-find",
        title: "Find the variant",
        description:
          "Search by product name or SKU and confirm the correct variant before changing stock.",
      },
      {
        id: "restock-quantity",
        title: "Enter received quantity",
        description:
          "Enter the number of units received as a positive quantity. The app handles the stock increase.",
      },
      {
        id: "restock-confirm",
        title: "Confirm and verify",
        description:
          "Submit the restock and check the updated on-hand quantity shown in the product list.",
      },
    ],
  },
  {
    id: "cancel-return",
    icon: "void-doc",
    title: "Cancel or return an order",
    summary: "Choose the safe action for the order's current status.",
    duration: "About 2 min",
    steps: [
      {
        id: "cancel-open",
        title: "Open order details",
        description:
          "Find the order in Orders and open it. Always check its status and items first.",
      },
      {
        id: "cancel-pending",
        title: "Cancel a pending order",
        description:
          "Use Cancel only before fulfillment. Any reservation or committed stock is released by the system.",
      },
      {
        id: "return-fulfilled",
        title: "Return a fulfilled order",
        description:
          "Use Return all only after the customer physically returns the products in acceptable condition.",
      },
      {
        id: "return-verify",
        title: "Verify the result",
        description:
          "Check the new order status, activity timeline, and inventory quantity before leaving the screen.",
      },
    ],
  },
];

export function findStaffTutorial(id: string | undefined) {
  return staffTutorials.find((tutorial) => tutorial.id === id) ?? staffTutorials[0];
}
