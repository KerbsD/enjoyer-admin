import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboard, type DashboardParams } from "@/api/reports";
import { reportKeys } from "@/constants/reports";
import { rangeError, rangeOf } from "@/schemas/reports";
import type { DashboardPeriodChoice } from "@/types/reports";

export function useDashboardSection() {
  const [period, setPeriod] = useState<DashboardPeriodChoice>("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState<DashboardParams>({ period: "today" });
  const [error, setError] = useState("");

  const query = useQuery({
    queryKey: reportKeys.dashboard(applied),
    queryFn: ({ signal }) => getDashboard(applied, signal),
  });

  function apply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = period === "custom" ? rangeError(from, to, true) : null;
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setApplied(period === "custom" ? rangeOf(from, to) : { period });
  }

  return {
    period,
    setPeriod,
    from,
    setFrom,
    to,
    setTo,
    error,
    query,
    apply,
  };
}
