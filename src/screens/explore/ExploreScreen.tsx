import { Trans } from "@lingui/react/macro";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import useQueryPetsByStatus from "../../api/query/pet/useQueryPetsByStatus";

export default function ExploreScreen() {
  const { data, isLoading, isError } = useQueryPetsByStatus();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator colorClassName="accent-primary" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">
          <Trans>Failed to load pets</Trans>
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-background"
      contentContainerClassName="p-4"
      data={data?.slice(0, 20)}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View
          className="flex-row justify-between border-b border-border py-3"
          style={styles.row}
        >
          <Text className="text-base font-semibold text-foreground">
            {item.name}
          </Text>
          <Text className="text-sm text-muted">{item.status}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
