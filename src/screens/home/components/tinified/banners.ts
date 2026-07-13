export type Banner = {
  id: string;
  source: number;
};

export const BANNERS: Banner[] = [
  { id: "1", source: require("./1.jpg") },
  { id: "2", source: require("./2.jpg") },
  { id: "3", source: require("./3.jpg") },
  { id: "4", source: require("./4.jpg") },
];
