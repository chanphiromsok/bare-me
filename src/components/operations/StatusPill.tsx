import { Text, View } from "react-native";

type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

const toneClasses: Record<StatusTone, { background: string; text: string }> = {
  danger: { background: "bg-danger-soft", text: "text-danger" },
  info: { background: "bg-info-soft", text: "text-info" },
  neutral: { background: "bg-surface-muted", text: "text-subtle" },
  success: { background: "bg-success-soft", text: "text-success" },
  warning: { background: "bg-warning-soft", text: "text-warning" },
};

export default function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: StatusTone;
}) {
  const classes = toneClasses[tone];

  return (
    <View className={`rounded-full px-2.5 py-1 ${classes.background}`}>
      <Text className={`text-xs font-semibold ${classes.text}`}>{label}</Text>
    </View>
  );
}
