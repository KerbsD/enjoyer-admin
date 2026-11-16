"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MenuItem, OptionGroup } from "@/api/menu";
import { assignGroups, itemOptionGroups } from "@/api/menu";
import { menuKeys, useGroups, useRefreshMenu } from "./useMenu";

function SelectionForm({
  item,
  groups,
  initialIds,
  onClose,
}: {
  item: MenuItem;
  groups: OptionGroup[];
  initialIds: number[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(initialIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const refresh = useRefreshMenu();
  return (
    <form
      className="menu-editor"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        void assignGroups(item.id, selected)
          .then(async () => {
            await refresh();
            toast.success("Add-ons updated.");
            onClose();
          })
          .catch((cause) =>
            setError(
              cause instanceof Error
                ? cause.message
                : "Could not save add-ons.",
            ),
          )
          .finally(() => setSaving(false));
      }}
    >
      <p>
        Saving replaces the full list of assigned groups. Shared group edits
        affect every item using them.
      </p>
      {groups.map((group) => (
        <label className="check-item" key={group.id}>
          <input
            type="checkbox"
            checked={selected.includes(group.id)}
            onChange={(event) =>
              setSelected((ids) =>
                event.target.checked
                  ? [...ids, group.id]
                  : ids.filter((value) => value !== group.id),
              )
            }
          />
          <span>
            <strong>{group.name}</strong>
            <small>
              {group.minSelections}–{group.maxSelections} choices ·{" "}
              {group.options.map((option) => option.name).join(", ")}
            </small>
          </span>
        </label>
      ))}
      {!groups.length && <p>Create an option group first.</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save assignments"}
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AssignmentEditor({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const groups = useGroups();
  const assigned = useQuery({
    queryKey: menuKeys.assigned(item.id),
    queryFn: ({ signal }) => itemOptionGroups(item.id, signal),
  });
  if (groups.isPending || assigned.isPending)
    return (
      <div className="menu-editor" role="status">
        Loading assigned add-ons…
      </div>
    );
  if (groups.isError || assigned.isError)
    return (
      <div className="menu-editor error" role="alert">
        {groups.error?.message || assigned.error?.message}{" "}
        <button type="button" className="text-button" onClick={onClose}>
          Close
        </button>
      </div>
    );
  return (
    <SelectionForm
      item={item}
      groups={groups.data.data}
      initialIds={assigned.data.data.map((group) => group.id)}
      onClose={onClose}
    />
  );
}
