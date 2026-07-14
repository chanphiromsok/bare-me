import {
  LegendList,
  type LegendListRef,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Spotlight,
  type SpotlightTargetProps,
  useSpotlightTour,
} from "react-native-nitro-spotlight";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useEffect, useMemo, useRef } from "react";

import AppIcon from "../../components/icons/AppIcon";
import TaskHeader from "../../components/operations/TaskHeader";
import {
  findStaffTutorial,
  type StaffTutorialStep,
} from "../../features/tutorial/staffTutorials";
import { colors } from "../../theme/colors";

type TutorialRoute = RouteProp<
  { StaffTutorial: { tutorialId?: string } },
  "StaffTutorial"
>;

type StepCardProps = LegendListRenderItemProps<StaffTutorialStep> & {
  targetProps: SpotlightTargetProps;
};

function StepCard({ index, item, targetProps }: StepCardProps) {
  return (
    <View
      {...targetProps}
      accessibilityLabel={`Step ${index + 1}: ${item.title}. ${item.description}`}
      className="min-h-32 flex-row gap-4 rounded-2xl border border-border bg-surface p-4"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
        <Text className="text-sm font-bold text-on-primary">{index + 1}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">{item.title}</Text>
        <Text className="mt-2 text-sm leading-5 text-muted">
          {item.description}
        </Text>
      </View>
    </View>
  );
}

export default function StaffTutorialScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<TutorialRoute>();
  const listRef = useRef<LegendListRef | null>(null);
  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tutorial = findStaffTutorial(route.params?.tutorialId);
  const { height, width } = useWindowDimensions();
  const tourSteps = useMemo(
    () =>
      tutorial.steps.map((step) => ({
        ...step,
        borderRadius: 18,
        durationMs: 350,
        padding: 6,
      })),
    [tutorial],
  );
  const tour = useSpotlightTour({ steps: tourSteps });
  const targetRect = tour.spotlight.targetRect;
  const tooltipWidth = Math.min(width - 32, 420);
  const targetMidpoint = targetRect ? targetRect.y + targetRect.height / 2 : 0;
  const tooltipStyle = targetRect
    ? targetMidpoint < height / 2
      ? { left: 16, top: Math.min(targetRect.y + targetRect.height + 22, height - 290), width: tooltipWidth }
      : { bottom: Math.max(height - targetRect.y + 18, 24), left: 16, width: tooltipWidth }
    : undefined;
  const lastStep = tour.currentIndex === tour.steps.length - 1;

  useEffect(
    () => () => {
      if (spotlightTimerRef.current) {
        clearTimeout(spotlightTimerRef.current);
      }
    },
    [],
  );

  const showStep = (index: number) => {
    tour.spotlight.clear();
    if (spotlightTimerRef.current) {
      clearTimeout(spotlightTimerRef.current);
    }
    void listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5,
    });
    spotlightTimerRef.current = setTimeout(() => tour.goTo(index), 450);
  };

  const handleNext = () => {
    if (lastStep) {
      tour.stop();
      return;
    }

    showStep(tour.currentIndex + 1);
  };

  const handlePrevious = () => {
    showStep(tour.currentIndex - 1);
  };

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={navigation.goBack}
        subtitle={`${tutorial.steps.length} steps · ${tutorial.duration}`}
        title={tutorial.title}
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
        data={tutorial.steps}
        estimatedItemSize={140}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="mb-4 mt-5 flex-row items-center gap-3 rounded-2xl bg-primary-soft p-4">
            <AppIcon name={tutorial.icon} color={colors.primary} size={24} />
            <Text className="flex-1 text-sm leading-5 text-primary">
              Read the steps or start the spotlight walkthrough below.
            </Text>
          </View>
        }
        ref={listRef}
        renderItem={(props) => (
          <StepCard {...props} targetProps={tour.getTargetProps(props.item.id)} />
        )}
        showsVerticalScrollIndicator={false}
      />
      <View className="border-t border-border bg-surface px-5 pb-safe-offset-3 pt-3">
        <Pressable
          accessibilityLabel="Start guided walkthrough"
          accessibilityRole="button"
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-primary px-5 active:bg-primary-pressed"
          onPress={() => showStep(0)}
        >
          <AppIcon
            name="help-and-support"
            color={colors.textOnPrimary}
            size={20}
          />
          <Text className="text-sm font-bold text-on-primary">
            Start walkthrough
          </Text>
        </Pressable>
      </View>

      <Spotlight
        borderColor={colors.brandOrange}
        borderRadius={18}
        borderWidth={2}
        controls={tour.spotlight}
        dimOpacity={0.74}
        onBackdropPress={tour.stop}
        padding={6}
      >
        {tour.currentStep && targetRect ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityViewIsModal
            className="absolute rounded-3xl bg-surface p-5"
            style={[styles.tooltipShadow, tooltipStyle]}
          >
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-bold uppercase tracking-[0.8px] text-brand-orange">
                Step {tour.currentIndex + 1} of {tour.steps.length}
              </Text>
              <Pressable
                accessibilityLabel="Skip walkthrough"
                accessibilityRole="button"
                className="min-h-11 min-w-11 items-center justify-center px-2"
                onPress={tour.stop}
              >
                <Text className="text-sm font-semibold text-muted">Skip</Text>
              </Pressable>
            </View>
            <Text className="mt-1 text-lg font-bold text-foreground">
              {tour.currentStep.title}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-muted">
              {tour.currentStep.description}
            </Text>
            <View className="mt-5 flex-row justify-end gap-3">
              {tour.currentIndex > 0 ? (
                <Pressable
                  accessibilityLabel="Previous tutorial step"
                  accessibilityRole="button"
                  className="min-h-12 min-w-24 items-center justify-center rounded-xl border border-border px-4 active:bg-surface-muted"
                  onPress={handlePrevious}
                >
                  <Text className="text-sm font-bold text-foreground">Back</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityLabel={lastStep ? "Finish walkthrough" : "Next tutorial step"}
                accessibilityRole="button"
                className="min-h-12 min-w-24 items-center justify-center rounded-xl bg-primary px-5 active:bg-primary-pressed"
                onPress={handleNext}
              >
                <Text className="text-sm font-bold text-on-primary">
                  {lastStep ? "Done" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Spotlight>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipShadow: {
    boxShadow: `0 8px 24px ${colors.shadow}`,
  },
});
