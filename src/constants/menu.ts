import type { GroupBody, OptionBody } from "@/api/menu";

export const menuKeys = {
  categories: ["menu", "categories"] as const,
  items: ["menu", "items"] as const,
  groups: ["menu", "groups"] as const,
  visible: ["menu", "visible"] as const,
  assigned: (id: number) => ["menu", "assigned", id] as const,
};

export const menuTabs = [
  { value: "items", label: "Items" },
  { value: "categories", label: "Categories" },
  { value: "groups", label: "Option groups" },
] as const;

export type MenuTab = (typeof menuTabs)[number]["value"];

export const blankGroup: GroupBody = {
  name: "",
  minSelections: 0,
  maxSelections: 1,
  sortOrder: 0,
};

export const blankOption: OptionBody = {
  name: "",
  priceDelta: "0.00",
  isAvailable: true,
  sortOrder: 0,
};
