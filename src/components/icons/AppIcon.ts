import { createNanoIconSet } from "react-native-nano-icons";

import glyphMap from "../../../assets/nanoicons/app-icons.glyphmap.json";

const AppIcon = createNanoIconSet(glyphMap);

export type AppIconName = keyof typeof glyphMap.i;
export default AppIcon;
