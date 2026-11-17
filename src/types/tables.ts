import type { ManagedTable, QrFormat } from "@/api/tables";
import type { TableFilter } from "@/constants/tables";

interface TableFormProps {
  table?: ManagedTable;
  onClose: () => void;
}

interface TableCardProps {
  table: ManagedTable;
}

interface TableControlsProps {
  filter: TableFilter;
  onFilterChange: (value: TableFilter) => void;
  onCreate: () => void;
  onDownloadSheet: () => void;
  sheetPending: boolean;
}

interface TableQrActionsProps {
  active: boolean;
  downloading: QrFormat | null;
  onDownload: (format: QrFormat) => void;
}

interface TableActivationPanelProps {
  active: boolean;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export type {
  TableActivationPanelProps,
  TableCardProps,
  TableControlsProps,
  TableFormProps,
  TableQrActionsProps,
};
