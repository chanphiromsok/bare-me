import { memo } from "react";
import { Text } from "react-native";

const SectionTitle = memo(function SectionTitle({
  children,
}: {
  children: string;
}) {
  return (
    <Text className="text-[14px] font-bold uppercase tracking-[0.5px] text-primary">
      {children}
    </Text>
  );
});

export default SectionTitle;
