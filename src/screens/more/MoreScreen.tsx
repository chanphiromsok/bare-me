import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { Pressable, Text, View } from "react-native";

import { clearAuthSession } from "../../api/auth/session";
import { queryClient } from "../../api/queryClient";
import AppIcon, { type AppIconName } from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import { useAuthUser } from "../../storage/authUserStore";
import { colors } from "../../theme";

type MoreItem = {
  detail: string;
  icon: AppIconName;
  title: string;
};

const sections: MoreItem[] = [
  {
    icon: "parcel",
    title: "Inventory movements",
    detail: "Restocks, adjustments, and sales",
  },
  {
    icon: "notification",
    title: "Customer approvals",
    detail: "3 registrations need review",
  },
  {
    icon: "self-service",
    title: "Staff management",
    detail: "Admin-only access",
  },
  {
    icon: "setting",
    title: "Settings",
    detail: "Language, theme, and preferences",
  },
  {
    icon: "help-and-support",
    title: "Help and support",
    detail: "Guides and contact options",
  },
];

function MoreRow({ item }: LegendListRenderItemProps<MoreItem>) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-16 flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 active:bg-surface-muted"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
        <AppIcon name={item.icon} color={colors.primary} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-foreground">
          {item.title}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">{item.detail}</Text>
      </View>
      <AppIcon name="arrow-range" color={colors.iconMuted} size={17} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const [user] = useAuthUser();
  const initials = user?.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await clearAuthSession();
    queryClient.clear();
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        title="More"
        subtitle="Inventory, administration, and account settings."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={sections}
        estimatedItemSize={72}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.title}
        ListFooterComponent={
          <Pressable
            accessibilityRole="button"
            className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft active:opacity-70"
            onPress={handleSignOut}
          >
            <AppIcon name="logout" color={colors.danger} size={20} />
            <Text className="text-sm font-bold text-danger">Sign out</Text>
          </Pressable>
        }
        ListHeaderComponent={
          <View className="mb-5 flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Text className="text-base font-bold text-on-primary">
                {initials || "ST"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">
                {user?.name ?? "Staff user"}
              </Text>
              <Text className="mt-0.5 text-sm capitalize text-muted">
                {user?.role ?? "staff"}
              </Text>
            </View>
            <AppIcon name="arrow-range" color={colors.iconMuted} size={18} />
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        renderItem={(props) => <MoreRow {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
