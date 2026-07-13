import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import HomeBanner from "./components/HomeBanner";
import HomeHeader from "./components/HomeHeader";
import MoiCard, { type MoiServiceItem } from "./components/MoiCard";
import SectionTitle from "./components/SectionTitle";
import ServiceCard, { type ServiceItem } from "./components/ServiceCard";
import { BANNERS } from "./components/tinified/banners";
import { LazyScrollView } from "../../components/scroll/LazyScrollView";

const OUR_SERVICES: ServiceItem[] = [
  {
    title: "Self Service",
    description: "Drop off your parcel",
    icon: "self-service",
  },
  {
    title: "Delivery",
    description: "Fast & reliable delivery",
    icon: "delivery",
  },
  { title: "Bus", description: "Parcel vai bus service", icon: "bus" },
  { title: "Wallet", description: "Manage your balance", icon: "wallet" },
];

const MOI_SERVICES: MoiServiceItem[] = [
  { title: "E- Arrival", description: "Cambodia E-Arrival", mark: "EA" },
  {
    title: "G.D.I",
    description: "General Dept. of Immigration",
    mark: "GDI",
  },
  { title: "O.W.S", description: "One Window Service", mark: "OWS" },
];

const PROMO_ASPECT_RATIO = 366 / 202;
const SCREEN_HORIZONTAL_PADDING = 20;
const SCREEN_WIDTH = Dimensions.get("window").width;
const PROMO_HEIGHT =
  (SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2) / PROMO_ASPECT_RATIO;

export default function HomeScreen() {
  return (
    <View className="flex-1 pt-safe">
      <HomeHeader />
      <LazyScrollView
        className="flex-1"
        contentContainerClassName="gap-6 pb-32"
        showsVerticalScrollIndicator={false}
        recycleItems
      >
        <HomeBanner />
        <View className="gap-2.5 px-5 pt-3">
          <SectionTitle>OUR SERVICE</SectionTitle>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <ServiceCard item={OUR_SERVICES[0]} />
              <ServiceCard item={OUR_SERVICES[1]} />
            </View>
            <View className="flex-row gap-3">
              <ServiceCard item={OUR_SERVICES[2]} />
              <ServiceCard item={OUR_SERVICES[3]} />
            </View>
          </View>
        </View>

        <View className="gap-2.5 px-5 pt-3">
          <SectionTitle>MOI SERVICE</SectionTitle>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <MoiCard item={MOI_SERVICES[0]} />
              <MoiCard item={MOI_SERVICES[1]} />
            </View>
            <View className="flex-row gap-3">
              <MoiCard item={MOI_SERVICES[2]} />
              <View className="flex-1" />
            </View>
          </View>
        </View>

        <View className="gap-2.5 px-5 pt-3">
          <View className="flex-row items-center justify-between">
            <SectionTitle>NEWS & PROMOTION</SectionTitle>
            <Pressable
              accessibilityRole="button"
              className="min-h-11 flex-row items-center px-1 active:opacity-70"
            >
              <Text className="text-[13px] font-medium text-primary">
                View all ›
              </Text>
            </Pressable>
          </View>
          <Image
            style={styles.promoImage}
            source={BANNERS[1]?.source ?? BANNERS[0].source}
            contentFit="cover"
            transition={150}
          />
        </View>
      </LazyScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  promoImage: {
    borderRadius: 12,
    height: PROMO_HEIGHT,
    width: "100%",
  },
});
