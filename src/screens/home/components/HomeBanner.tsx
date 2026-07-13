import { Image } from "expo-image";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { BANNERS, type Banner } from "./tinified/banners";
import Carousel from "react-native-reanimated-carousel";
const BANNER_ASPECT_RATIO = 366 / 202;
const BANNER_HORIZONTAL_MARGIN = 20;
const ADJACENT_BANNER_PEEK = 48;
const AUTO_PLAY_INTERVAL = 4500;

const HomeBanner = () => {
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = screenWidth - BANNER_HORIZONTAL_MARGIN * 2;
  const bannerHeight = bannerWidth / BANNER_ASPECT_RATIO;

  const renderItem = ({ item }: { item: Banner }) => {
    return (
      <View
        className="items-center justify-center"
        style={{ width: screenWidth, height: bannerHeight }}
      >
        <Image
          source={item.source}
          style={{ width: bannerWidth, height: bannerHeight, borderRadius: 10 }}
          contentFit="cover"
          transition={150}
        />
      </View>
    );
  };

  return (
    <Carousel
      data={BANNERS}
      autoPlay
      autoPlayInterval={AUTO_PLAY_INTERVAL}
      // v5 API: dimensions live in style, not width/height props.
      style={[styles.carousel, { width: screenWidth, height: bannerHeight }]}
      loop
      width={screenWidth}
      mode="parallax"
      pagingEnabled={false}
      modeConfig={{
        parallaxAdjacentItemScale: 0.9,
        parallaxScrollingOffset: ADJACENT_BANNER_PEEK,
        parallaxScrollingScale: 1,
      }}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  carousel: {
    overflow: "visible",
  },
});

export default HomeBanner;
