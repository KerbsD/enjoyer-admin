import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { items } from "@/api/menu";
import { listHistory, type HistoryFilters as Filters } from "@/api/reports";
import type { OrderStatus, PaymentStatus } from "@/api/staff";
import { listManagedTables } from "@/api/tables";
import { menuKeys } from "@/constants/menu";
import {
  blankHistoryDraft,
  historyPageSize,
  reportKeys,
} from "@/constants/reports";
import { staffKeys } from "@/modules/Staff/useStaffRealtime";
import { historySearchSchema, rangeError, rangeOf } from "@/schemas/reports";
import type { HistoryDraft } from "@/types/reports";

export function useHistorySection() {
  const [draft, setDraft] = useState<HistoryDraft>(blankHistoryDraft);
  const [filters, setFilters] = useState<Filters>({});
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");

  const tables = useQuery({
    queryKey: staffKeys.managedTables,
    queryFn: ({ signal }) => listManagedTables(signal),
  });
  const menu = useQuery({
    queryKey: menuKeys.items,
    queryFn: ({ signal }) => items(signal),
  });
  const history = useQuery({
    queryKey: reportKeys.history(filters, offset),
    queryFn: ({ signal }) =>
      listHistory({ ...filters, limit: historyPageSize, offset }, signal),
  });

  function change(key: keyof HistoryDraft, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function apply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = rangeError(draft.from, draft.to);
    if (message) {
      setError(message);
      return;
    }
    const parsed = historySearchSchema.safeParse(draft.q);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid search.");
      return;
    }
    setError("");
    setOffset(0);
    setSelected(null);
    setFilters({
      ...(draft.from ? rangeOf(draft.from, draft.to) : {}),
      tableId: draft.tableId ? Number(draft.tableId) : undefined,
      itemId: draft.itemId ? Number(draft.itemId) : undefined,
      status: draft.status ? (draft.status as OrderStatus) : undefined,
      paymentStatus: draft.paymentStatus
        ? (draft.paymentStatus as PaymentStatus)
        : undefined,
      q: parsed.data || undefined,
    });
  }

  function clear() {
    setDraft({ ...blankHistoryDraft });
    setFilters({});
    setOffset(0);
    setSelected(null);
    setError("");
  }

  function toggle(id: string) {
    setSelected((previous) => (previous === id ? null : id));
  }

  function closeDetail() {
    setSelected(null);
  }

  function previous() {
    setSelected(null);
    setOffset(Math.max(0, offset - historyPageSize));
  }

  function next() {
    setSelected(null);
    setOffset(offset + historyPageSize);
  }

  return {
    draft,
    change,
    apply,
    clear,
    tables,
    menu,
    history,
    offset,
    selected,
    error,
    toggle,
    closeDetail,
    previous,
    next,
  };
}
