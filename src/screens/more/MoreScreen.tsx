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
    detail: "Coming soon",
  },
  {
    icon: "notification",
    title: "Customer approvals",
    detail: "Coming soon",
  },
  {
    icon: "self-service",
    title: "Staff management",
    detail: "Unavailable for staff",
  },
  {
    icon: "setting",
    title: "Settings",
    detail: "Coming soon",
  },
  {
    icon: "help-and-support",
    title: "Help and support",
    detail: "Coming soon",
  },
];

function MoreRow({ item }: LegendListRenderItemProps<MoreItem>) {
  return (
    <View
      accessibilityLabel={`${item.title}, ${item.detail}`}
      className="min-h-16 flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 opacity-70"
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
      <Text className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-subtle">
        Unavailable
      </Text>
    </View>
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
