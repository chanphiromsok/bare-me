import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PlaceholderScreenProps = {
  title: string;
};

export default function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-extrabold text-primary">{title}</Text>
        <Text className="mt-2 text-center text-sm text-muted">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
