import { Children, type ReactNode, useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";

const tabWidth = 112;

export type PagerStickyHeaderItem = {
  label: string;
  value: string;
};

type PagerStickyHeaderProps = {
  activeIndex: number;
  children: ReactNode;
  items: readonly PagerStickyHeaderItem[];
  onIndexChange: (index: number) => void;
  renderHeader?: () => ReactNode;
};

export default function PagerStickyHeader({
  activeIndex,
  children,
  items,
  onIndexChange,
  renderHeader,
}: PagerStickyHeaderProps) {
  const pagerRef = useRef<PagerView>(null);
  const tabsRef = useRef<ScrollView>(null);
  const currentPageRef = useRef(activeIndex);
  const { width } = useWindowDimensions();
  const pages = Children.toArray(children);

  useEffect(() => {
    if (currentPageRef.current !== activeIndex) {
      currentPageRef.current = activeIndex;
      pagerRef.current?.setPageWithoutAnimation(activeIndex);
    }
  }, [activeIndex]);

  useEffect(() => {
    const x = Math.max(0, activeIndex * tabWidth - (width - tabWidth) / 2);
    tabsRef.current?.scrollTo({ animated: true, x });
  }, [activeIndex, width]);

  const selectPage = (index: number) => {
    currentPageRef.current = index;
    onIndexChange(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    const index = event.nativeEvent.position;
    currentPageRef.current = index;
    onIndexChange(index);
  };

  return (
    <View className="flex-1">
      <View className="bg-background">
        {renderHeader?.()}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 8 }}
          horizontal
          ref={tabsRef}
          showsHorizontalScrollIndicator={false}
        >
          {items.map((item, index) => {
            const selected = activeIndex === index;

            return (
              <Pressable
                accessibilityLabel={`${item.label} orders`}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className="h-11 items-center justify-center px-3"
                key={item.value}
                onPress={() => selectPage(index)}
                style={{ width: tabWidth }}
              >
                <Text
                  className={
                    selected
                      ? "text-sm font-bold text-primary"
                      : "text-sm font-semibold text-muted"
                  }
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <View
                  className={
                    selected
                      ? "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                      : "absolute inset-x-3 bottom-0 h-0.5 bg-transparent"
                  }
                />
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="h-px bg-border" />
      </View>

      <PagerView
        initialPage={activeIndex}
        keyboardDismissMode="on-drag"
        onPageSelected={handlePageSelected}
        overdrag
        ref={pagerRef}
        style={{ flex: 1 }}
      >
        {items.map((item, index) => (
          <View collapsable={false} key={item.value} style={{ flex: 1 }}>
            {pages[index]}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
