import type { FormEvent } from "react";
import type { Order, TableDetail, TableOverview } from "@/api/staff";
import type { BoardColumn } from "@/constants/staff";

type StaffTransport = "connecting" | "sse" | "polling" | "ended";
type OrderAction =
  "confirm" | "reject" | "advance" | "revert" | "cancel" | "paid";
type OrderActionPanelKind = "cancel" | "reject" | "paid";
type PaymentMethod = "cash" | "other";

interface BoardHeaderProps {
  transport: StaffTransport;
  sound: boolean;
  fetching: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
}

interface NewOrdersBannerProps {
  orders: Order[];
  onDismiss: () => void;
}

interface BoardColumnProps {
  column: BoardColumn;
  orders: Order[];
}

interface OrderCardProps {
  order: Order;
}

interface OrderDetailsProps {
  order: Order;
  pending: boolean;
  error: Error | null;
  onRetry: () => void;
}

interface OrderActionsProps {
  order: Order;
  detailed?: boolean;
}

interface OrderActionPanelProps {
  panel: OrderActionPanelKind;
  reason: string;
  method: PaymentMethod;
  pending: boolean;
  onReasonChange: (value: string) => void;
  onMethodChange: (value: PaymentMethod) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

interface TableTileProps {
  table: TableOverview;
  onOpen: () => void;
}

interface TablePanelProps {
  table: TableOverview;
  onBack: () => void;
}

interface TableSummaryProps {
  summary: TableDetail["summary"];
  unpaidCount: number;
  unpaidTotal: string;
}

interface TableClosePanelProps {
  unpaidCount: number;
  unpaidTotal: string;
  canOverride: boolean;
  confirming: boolean;
  warning: string;
  pending: boolean;
  onStart: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export type {
  BoardColumnProps,
  BoardHeaderProps,
  NewOrdersBannerProps,
  OrderAction,
  OrderActionPanelKind,
  OrderActionPanelProps,
  OrderActionsProps,
  OrderCardProps,
  OrderDetailsProps,
  PaymentMethod,
  StaffTransport,
  TableClosePanelProps,
  TablePanelProps,
  TableSummaryProps,
  TableTileProps,
};
