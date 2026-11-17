import type {
  Holiday,
  HoursInput,
  ShopSettings,
  WeeklyDay,
} from "@/api/settings";

interface HoursInitial {
  closed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

interface HoursFormProps {
  initial?: HoursInitial;
  saving: boolean;
  onSave: (input: HoursInput) => Promise<void>;
  onCancel: () => void;
  acknowledge?: string;
}

interface TimingsFormProps {
  settings: ShopSettings;
}

interface HolidayEditorProps {
  holiday?: Holiday;
  onClose: () => void;
}

interface HolidayFiltersProps {
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
}

interface HolidayRowProps {
  holiday: Holiday;
  removing: boolean;
  saving: boolean;
  onEdit: () => void;
  onAskRemove: () => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
}

interface WeeklyDayRowProps {
  day: WeeklyDay;
  editing: boolean;
  saving: boolean;
  firstConfiguration: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSave: (input: HoursInput) => Promise<void>;
}

export type {
  HolidayEditorProps,
  HolidayFiltersProps,
  HolidayRowProps,
  HoursFormProps,
  HoursInitial,
  TimingsFormProps,
  WeeklyDayRowProps,
};
