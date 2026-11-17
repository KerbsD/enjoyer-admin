export const tableFilterOptions = [
  { value: "all", label: "All tables" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export type TableFilter = (typeof tableFilterOptions)[number]["value"];

export const qrSheetFilename = "enjoyer-table-qr-codes.html";
