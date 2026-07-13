import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import type { Banner } from "./tinified/banners";

type BannerItemProps = {
  banner: Banner;
};

export function BannerItem({ banner }: BannerItemProps) {
  return (
    <Image
      source={banner.source}
      style={styles.image}
      contentFit="cover"
      transition={150}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 16,
    flex: 1,
  },
});
