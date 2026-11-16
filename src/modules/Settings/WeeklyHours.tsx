"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getWeeklyHours, saveWeeklyDay, type HoursInput } from "@/api/settings";
import { Modal } from "@/components/ui/Modal";
import { staffKeys } from "@/modules/Staff/useStaffRealtime";
import { HoursForm } from "./HoursForm";

export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function WeeklyHours() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "weekly"],
    queryFn: ({ signal }) => getWeeklyHours(signal),
  });
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const firstConfiguration = !query.data?.data.some((day) => day.configured);
  const save = async (day: number, input: HoursInput) => {
    setSaving(true);
    try {
      await saveWeeklyDay(day, input);
      await queryClient.invalidateQueries({ queryKey: staffKeys.settings });
      toast.success(`${daysOfWeek[day]} hours saved.`);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Weekly opening hours</h2>
          <p>
            Sunday = day 0 through Saturday = day 6. Enter 24-hour times in
            Asia/Manila; overnight hours are not supported.
          </p>
        </div>
      </div>
      {firstConfiguration && query.data && (
        <p className="hours-warning" role="note">
          <strong>Hours are not configured.</strong> Ordering is currently
          unrestricted. Saving the first weekday switches ordering to the weekly
          schedule: every weekday not yet configured will be treated as closed.
          Configure each day you intend to open.
        </p>
      )}
      {query.isPending && <p role="status">Loading weekly hours…</p>}
      {query.isError && (
        <p className="error" role="alert">
          {query.error.message}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => void query.refetch()}
          >
            Retry
          </button>
        </p>
      )}
      {query.data?.data.map((day) => (
        <div className="weekly-day" key={day.dayOfWeek}>
          <div>
            <strong>{daysOfWeek[day.dayOfWeek]}</strong>
            <span>
              {day.configured
                ? day.closed
                  ? "Closed"
                  : `${day.openTime}–${day.closeTime} · Manila time`
                : "Not set — treated closed once weekly hours are configured"}
            </span>
          </div>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setEditing(day.dayOfWeek)}
          >
            {day.configured ? "Edit" : "Set hours"}
          </button>
          {editing === day.dayOfWeek && (
            <Modal
              open
              onClose={() => setEditing(null)}
              title={`${daysOfWeek[day.dayOfWeek]} hours`}
            >
              <HoursForm
                key={day.dayOfWeek}
                initial={day}
                saving={saving}
                onSave={(input) => save(day.dayOfWeek, input)}
                onCancel={() => setEditing(null)}
                acknowledge={
                  firstConfiguration
                    ? "I understand that saving the first day makes every other unconfigured weekday closed."
                    : undefined
                }
              />
            </Modal>
          )}
        </div>
      ))}
    </section>
  );
}
