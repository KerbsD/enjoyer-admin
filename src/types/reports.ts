import type { FormEvent } from "react";
import type { MenuItem } from "@/api/menu";
import type { DashboardData, DashboardPeriod } from "@/api/reports";
import type { Order } from "@/api/staff";
import type { ManagedTable } from "@/api/tables";

interface BarsProps {
  rows: { name: string; value: number; detail?: string }[];
  label: string;
}

interface DashboardViewProps {
  data: DashboardData;
}

type DashboardPeriodChoice = DashboardPeriod | "custom";

interface DateFieldsProps {
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
}

interface HistoricalDetailProps {
  id: string;
  onClose: () => void;
}

interface HistoryDraft {
  from: string;
  to: string;
  tableId: string;
  itemId: string;
  status: string;
  paymentStatus: string;
  q: string;
}

interface HistoryFiltersProps {
  draft: HistoryDraft;
  change: (key: keyof HistoryDraft, value: string) => void;
  apply: (event: FormEvent<HTMLFormElement>) => void;
  clear: () => void;
  tables: ManagedTable[];
  menu: MenuItem[];
}

interface HistoryRowProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onCloseDetail: () => void;
}

export type {
  BarsProps,
  DashboardPeriodChoice,
  DashboardViewProps,
  DateFieldsProps,
  HistoricalDetailProps,
  HistoryDraft,
  HistoryFiltersProps,
  HistoryRowProps,
};
