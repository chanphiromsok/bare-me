import type { SpotlightTourControls } from "react-native-nitro-spotlight";
import { Spotlight } from "react-native-nitro-spotlight";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { colors } from "../../theme/colors";

type LiveTutorialOverlayProps = {
  onClose: () => void;
  onStepChange: (index: number) => void;
  tour: SpotlightTourControls;
};

export default function LiveTutorialOverlay({
  onClose,
  onStepChange,
  tour,
}: LiveTutorialOverlayProps) {
  const { height, width } = useWindowDimensions();
  const targetRect = tour.spotlight.targetRect;
  const tooltipWidth = Math.min(width - 32, 420);
  const targetMidpoint = targetRect ? targetRect.y + targetRect.height / 2 : 0;
  const tooltipStyle = targetRect
    ? targetMidpoint < height / 2
      ? {
          left: 16,
          top: Math.min(
            targetRect.y + targetRect.height + 18,
            height - 286,
          ),
          width: tooltipWidth,
        }
      : {
          bottom: Math.max(height - targetRect.y + 18, 24),
          left: 16,
          width: tooltipWidth,
        }
    : undefined;
  const lastStep = tour.currentIndex === tour.steps.length - 1;

  const handleClose = () => {
    tour.stop();
    onClose();
  };

  const handleNext = () => {
    if (lastStep) {
      handleClose();
      return;
    }

    onStepChange(tour.currentIndex + 1);
  };

  return (
    <Spotlight
      borderColor={colors.brandOrange}
      borderRadius={18}
      borderWidth={2}
      controls={tour.spotlight}
      dimOpacity={0.74}
      onBackdropPress={handleClose}
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
            <View>
              <Text className="text-xs font-bold uppercase tracking-[0.8px] text-brand-orange">
                Step {tour.currentIndex + 1} of {tour.steps.length}
              </Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-success">
                Practice guide · Nothing will be saved
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Exit walkthrough"
              accessibilityRole="button"
              className="min-h-11 min-w-11 items-center justify-center px-2"
              onPress={handleClose}
            >
              <Text className="text-sm font-semibold text-muted">Skip</Text>
            </Pressable>
          </View>
          <Text className="mt-2 text-lg font-bold text-foreground">
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
                onPress={() => onStepChange(tour.currentIndex - 1)}
              >
                <Text className="text-sm font-bold text-foreground">Back</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel={
                lastStep ? "Finish walkthrough" : "Next tutorial step"
              }
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
  );
}

const styles = StyleSheet.create({
  tooltipShadow: {
    boxShadow: `0 8px 24px ${colors.shadow}`,
  },
});
