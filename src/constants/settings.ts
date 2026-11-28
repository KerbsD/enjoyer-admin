import { staffKeys } from "@/constants/staff";

export const settingsKeys = {
  timings: [...staffKeys.settings, "timings"] as const,
  weekly: [...staffKeys.settings, "weekly"] as const,
  holidays: [...staffKeys.settings, "holidays"] as const,
  status: [...staffKeys.settings, "status"] as const,
};

export const settingsTabs = [
  { value: "timings", label: "Session timing" },
  { value: "weekly", label: "Weekly hours" },
  { value: "holidays", label: "Holiday overrides" },
  { value: "ordering-network", label: "Ordering network" },
] as const;

export type SettingsTab = (typeof settingsTabs)[number]["value"];

export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
