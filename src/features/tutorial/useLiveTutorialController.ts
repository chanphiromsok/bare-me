import { useEffect, useRef } from "react";
import {
  type SpotlightTourStep,
  useSpotlightTour,
} from "react-native-nitro-spotlight";

type LiveTutorialControllerOptions = {
  enabled: boolean;
  highlightDelay?: number;
  onBeforeStep?: (index: number) => void;
  startDelay?: number;
  steps: SpotlightTourStep[];
};

export function useLiveTutorialController({
  enabled,
  highlightDelay = 450,
  onBeforeStep,
  startDelay = 650,
  steps,
}: LiveTutorialControllerOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const tour = useSpotlightTour({ steps: enabled ? steps : [] });

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const showStep = (index: number) => {
    if (!enabled) return;

    tour.spotlight.clear();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onBeforeStep?.(index);
    timerRef.current = setTimeout(() => tour.goTo(index), highlightDelay);
  };

  const startOnLayout = () => {
    if (!enabled || startedRef.current) return;

    startedRef.current = true;
    timerRef.current = setTimeout(() => showStep(0), startDelay);
  };

  return { showStep, startOnLayout, tour };
}
