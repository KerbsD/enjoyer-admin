"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteHoliday,
  getHolidays,
  saveHoliday,
  type Holiday,
  type HoursInput,
} from "@/api/settings";
import { Modal } from "@/components/ui/Modal";
import { staffKeys } from "@/modules/Staff/useStaffRealtime";
import { HoursForm } from "./HoursForm";
import { calendarDate } from "./schemas";

function HolidayEditor({
  holiday,
  onClose,
}: {
  holiday?: Holiday;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [date, setDate] = useState(holiday?.date ?? "");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async (input: HoursInput) => {
    const parsed = calendarDate.safeParse(date);
    if (!parsed.success) {
      setDateError("Enter a real date (YYYY-MM-DD).");
      return;
    }
    setDateError("");
    setSaving(true);
    try {
      await saveHoliday(parsed.data, input);
      await client.invalidateQueries({ queryKey: staffKeys.settings });
      toast.success(
        holiday ? "Holiday override updated." : "Holiday override created.",
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="holiday-editor">
      <label className="field">
        <span className="eyebrow">Date (Manila calendar)</span>
        <input
          type="date"
          value={date}
          disabled={!!holiday}
          onChange={(event) => {
            setDate(event.target.value);
            setDateError("");
          }}
        />
      </label>
      {dateError && (
        <p className="error" role="alert">
          {dateError}
        </p>
      )}
      {holiday && (
        <p>
          To move an override to a different date, remove it and create a new
          one.
        </p>
      )}
      <HoursForm
        key={holiday?.date ?? "new"}
        initial={holiday}
        saving={saving}
        onSave={save}
        onCancel={onClose}
      />
    </div>
  );
}

export function Holidays() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "holidays"],
    queryFn: ({ signal }) => getHolidays(signal),
  });
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const selected = query.data?.find((holiday) => holiday.date === editing);
  const shown = query.data?.filter(
    (holiday) => (!from || holiday.date >= from) && (!to || holiday.date <= to),
  );
  const remove = async (date: string) => {
    setSaving(true);
    try {
      await deleteHoliday(date);
      await client.invalidateQueries({ queryKey: staffKeys.settings });
      toast.success("Override removed; weekly hours apply again.");
      setRemoving(null);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not remove override.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Holiday overrides</h2>
          <p>
            One date overrides its usual weekday hours. Removing it returns to
            the weekly schedule.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => setEditing("new")}
        >
          Add date override
        </button>
      </div>
      <div className="editor-grid holiday-filters">
        <label className="field">
          <span className="eyebrow">From date</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="eyebrow">To date</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
      </div>
      {query.isPending && <p role="status">Loading holiday overrides…</p>}
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
      {shown?.length === 0 && <p>No holiday overrides match these dates.</p>}
      {shown?.map((holiday) => (
        <div className="holiday-row" key={holiday.date}>
          <div>
            <strong>{holiday.date}</strong>
            <span>
              {holiday.closed
                ? "Closed all day"
                : `${holiday.openTime}–${holiday.closeTime} · Manila time`}
            </span>
          </div>
          <div className="action-row">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setEditing(holiday.date)}
            >
              Edit
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setRemoving(holiday.date)}
            >
              Remove
            </button>
          </div>
          {removing === holiday.date && (
            <div className="action-panel holiday-confirm">
              <p>
                Remove the override on {holiday.date}? Its normal weekday
                schedule will apply.
              </p>
              <div className="action-row">
                <button
                  type="button"
                  className="button button-danger"
                  disabled={saving}
                  onClick={() => void remove(holiday.date)}
                >
                  {saving ? "Removing…" : "Confirm removal"}
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setRemoving(null)}
                >
                  Keep override
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {editing !== null && (editing === "new" || selected) && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={
            selected ? `Override for ${selected.date}` : "New date override"
          }
        >
          <HolidayEditor
            key={editing}
            holiday={selected}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </section>
  );
}
