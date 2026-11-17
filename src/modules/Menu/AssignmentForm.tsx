"use client";

import { useQuery } from "@tanstack/react-query";
import { itemOptionGroups } from "@/api/menu";
import { menuKeys } from "@/constants/menu";
import type { AssignmentFieldsProps, AssignmentFormProps } from "@/types/menu";
import { useAssignmentForm } from "./useAssignmentForm";
import { useGroups } from "./useMenu";

export function AssignmentForm({ item, onClose }: AssignmentFormProps) {
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
    <AssignmentFields
      item={item}
      groups={groups.data.data}
      initialIds={assigned.data.data.map((group) => group.id)}
      onClose={onClose}
    />
  );
}

function AssignmentFields({
  item,
  groups,
  initialIds,
  onClose,
}: AssignmentFieldsProps) {
  const { selected, toggle, saving, error, submit } = useAssignmentForm({
    item,
    initialIds,
    onClose,
  });

  return (
    <form className="menu-editor" onSubmit={(event) => void submit(event)}>
      <p>
        Saving replaces the full list of assigned groups. Shared group edits
        affect every item using them.
      </p>
      {groups.map((group) => (
        <label className="check-item" key={group.id}>
          <input
            type="checkbox"
            checked={selected.includes(group.id)}
            onChange={(event) => toggle(group.id, event.target.checked)}
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
