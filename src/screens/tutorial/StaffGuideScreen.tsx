import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  type NavigationProp,
  type ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import TaskHeader from "../../components/operations/TaskHeader";
import {
  staffTutorials,
  type StaffTutorial,
} from "../../features/tutorial/staffTutorials";
import { colors } from "../../theme/colors";

type TutorialCardProps = LegendListRenderItemProps<StaffTutorial> & {
  onOpen: (tutorial: StaffTutorial) => void;
};

function TutorialCard({ item, onOpen }: TutorialCardProps) {
  return (
    <Pressable
      accessibilityHint={`Opens a ${item.steps.length}-step guided lesson`}
      accessibilityLabel={item.title}
      accessibilityRole="button"
      className="min-h-28 flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4 active:border-primary active:bg-primary-soft"
      onPress={() => onOpen(item)}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
        <AppIcon name={item.icon} color={colors.primary} size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">{item.title}</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">{item.summary}</Text>
        <Text className="mt-2 text-xs font-semibold text-primary">
          {item.steps.length} steps · {item.duration}
        </Text>
      </View>
      <AppIcon name="arrow-range" color={colors.textMuted} size={18} />
    </Pressable>
  );
}

export default function StaffGuideScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleOpen = (tutorial: StaffTutorial) => {
    navigation.navigate("StaffTutorial", { tutorialId: tutorial.id });
  };

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={navigation.goBack}
        subtitle="Short, safe lessons for everyday store tasks."
        title="Staff guide"
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
        data={staffTutorials}
        estimatedItemSize={128}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="mb-5 mt-5 rounded-3xl bg-primary p-5">
            <View className="mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <AppIcon
                name="help-and-support"
                color={colors.textOnPrimary}
                size={23}
              />
            </View>
            <Text className="text-xl font-bold text-on-primary">
              Learn without changing store data
            </Text>
            <Text className="mt-2 text-sm leading-5 text-white/75">
              These walkthroughs explain each workflow. They never create an
              order, charge a customer, or change inventory.
            </Text>
          </View>
        }
        renderItem={(props) => (
          <TutorialCard {...props} onOpen={handleOpen} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
