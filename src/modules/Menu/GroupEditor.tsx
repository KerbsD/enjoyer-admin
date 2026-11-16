"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Option, OptionBody, OptionGroup } from "@/api/menu";
import {
  createGroup,
  createOption,
  updateGroup,
  updateOption,
} from "@/api/menu";
import { Modal } from "@/components/ui/Modal";
import { peso } from "@/lib/shop-format";
import { groupSchema, optionSchema } from "./schemas";
import { useGroups, useRefreshMenu } from "./useMenu";

const blank = { name: "", minSelections: 0, maxSelections: 1, sortOrder: 0 };
const blankOption: OptionBody = {
  name: "",
  priceDelta: "0.00",
  isAvailable: true,
  sortOrder: 0,
};

function GroupForm({
  group,
  onClose,
}: {
  group?: OptionGroup;
  onClose: () => void;
}) {
  const [values, setValues] = useState(
    group
      ? {
          name: group.name,
          minSelections: group.minSelections,
          maxSelections: group.maxSelections,
          sortOrder: group.sortOrder,
        }
      : blank,
  );
  const [choice, setChoice] = useState(blankOption);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const refresh = useRefreshMenu();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = groupSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check selections.");
      return;
    }
    const initial = group ? null : optionSchema.safeParse(choice);
    if (initial && !initial.success) {
      setError(initial.error.issues[0]?.message || "Add a choice.");
      return;
    }
    if (!group && parsed.data.minSelections > 1) {
      setError(
        "Create with a minimum of at most one; add choices before increasing it.",
      );
      return;
    }
    setSaving(true);
    try {
      if (group) await updateGroup(group.id, parsed.data);
      else if (initial?.success)
        await createGroup({ ...parsed.data, options: [initial.data] });
      await refresh();
      toast.success(group ? "Group updated." : "Group created.");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save group.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="menu-editor" onSubmit={(event) => void submit(event)}>
      <div className="editor-grid">
        <label className="field">
          <span className="eyebrow">Group name</span>
          <input
            required
            maxLength={100}
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="eyebrow">Position</span>
          <input
            type="number"
            min={0}
            max={2_147_483_647}
            required
            value={values.sortOrder}
            onChange={(e) =>
              setValues({ ...values, sortOrder: Number(e.target.value) })
            }
          />
        </label>
        <label className="field">
          <span className="eyebrow">Minimum selections (0 = optional)</span>
          <input
            type="number"
            min={0}
            max={50}
            required
            value={values.minSelections}
            onChange={(e) =>
              setValues({ ...values, minSelections: Number(e.target.value) })
            }
          />
        </label>
        <label className="field">
          <span className="eyebrow">Maximum selections</span>
          <input
            type="number"
            min={1}
            max={50}
            required
            value={values.maxSelections}
            onChange={(e) =>
              setValues({ ...values, maxSelections: Number(e.target.value) })
            }
          />
        </label>
      </div>
      {!group && (
        <div className="editor-grid">
          <label className="field">
            <span className="eyebrow">First choice (required)</span>
            <input
              required
              maxLength={100}
              value={choice.name}
              onChange={(e) => setChoice({ ...choice, name: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="eyebrow">Surcharge (PHP)</span>
            <input
              inputMode="decimal"
              value={choice.priceDelta}
              onChange={(e) =>
                setChoice({ ...choice, priceDelta: e.target.value })
              }
            />
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save group"}
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

function ChoiceForm({
  group,
  option,
  onClose,
}: {
  group: OptionGroup;
  option?: Option;
  onClose: () => void;
}) {
  const [values, setValues] = useState<OptionBody>(
    option
      ? {
          name: option.name,
          priceDelta: option.priceDelta,
          isAvailable: option.isAvailable,
          sortOrder: option.sortOrder,
        }
      : blankOption,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const refresh = useRefreshMenu();
  return (
    <form
      className="menu-editor"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        const parsed = optionSchema.safeParse(values);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || "Check choice fields.");
          return;
        }
        setSaving(true);
        void (
          option
            ? updateOption(group.id, option.id, parsed.data)
            : createOption(group.id, parsed.data)
        )
          .then(async () => {
            await refresh();
            toast.success("Choice saved.");
            onClose();
          })
          .catch((cause) =>
            setError(
              cause instanceof Error ? cause.message : "Could not save choice.",
            ),
          )
          .finally(() => setSaving(false));
      }}
    >
      <div className="editor-grid">
        <label className="field">
          <span className="eyebrow">Choice name</span>
          <input
            required
            maxLength={100}
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="eyebrow">Surcharge (PHP)</span>
          <input
            inputMode="decimal"
            value={values.priceDelta}
            onChange={(e) =>
              setValues({ ...values, priceDelta: e.target.value })
            }
          />
        </label>
        <label className="field">
          <span className="eyebrow">Position</span>
          <input
            type="number"
            min={0}
            max={2_147_483_647}
            required
            value={values.sortOrder}
            onChange={(e) =>
              setValues({ ...values, sortOrder: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <label className="check-item">
        <input
          type="checkbox"
          checked={values.isAvailable}
          onChange={(e) =>
            setValues({ ...values, isAvailable: e.target.checked })
          }
        />{" "}
        Available for orders
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save choice"}
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

export function GroupEditor() {
  const result = useGroups();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [choice, setChoice] = useState<{
    groupId: number;
    optionId?: number;
  } | null>(null);
  const group = result.data?.data.find((v) => v.id === editing);
  const choiceGroup = result.data?.data.find((v) => v.id === choice?.groupId);
  const currentChoice = choiceGroup?.options.find(
    (v) => v.id === choice?.optionId,
  );
  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Option groups & add-ons</h2>
          <p>
            Group changes affect every attached item. Required means minimum
            selections ≥ 1.
          </p>
        </div>
        <button
          className="button"
          onClick={() => {
            setEditing("new");
            setChoice(null);
          }}
        >
          Add group
        </button>
      </div>
      {result.isPending && <p role="status">Loading add-ons…</p>}
      {result.isError && (
        <p role="alert" className="error">
          {result.error.message}{" "}
          <button className="text-button" onClick={() => void result.refetch()}>
            Retry
          </button>
        </p>
      )}
      {result.data?.data.map((row) => (
        <div className="menu-group" key={row.id}>
          <div className="section-heading">
            <div>
              <h3>{row.name}</h3>
              <p>
                Position {row.sortOrder} · Select {row.minSelections}–
                {row.maxSelections} · {row.required ? "Required" : "Optional"}
              </p>
            </div>
            <div className="action-row">
              <button
                className="button button-outline"
                onClick={() => {
                  setEditing(row.id);
                  setChoice(null);
                }}
              >
                Edit group
              </button>
              <button
                className="button button-outline"
                onClick={() => {
                  setChoice({ groupId: row.id });
                  setEditing(null);
                }}
              >
                Add choice
              </button>
            </div>
          </div>
          {row.options.map((opt) => (
            <div className="menu-row" key={opt.id}>
              <div>
                <strong>{opt.name}</strong>
                <span>
                  {peso(opt.priceDelta)} extra · position {opt.sortOrder} ·{" "}
                  {opt.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <button
                className="button button-outline"
                onClick={() => {
                  setChoice({ groupId: row.id, optionId: opt.id });
                  setEditing(null);
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      ))}
      {editing !== null && (editing === "new" || group) && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={group ? `Edit ${group.name}` : "New option group"}
        >
          <GroupForm
            key={editing}
            group={group}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
      {choice && choiceGroup && (
        <Modal
          open
          onClose={() => setChoice(null)}
          title={
            currentChoice
              ? `Edit ${currentChoice.name}`
              : `Add a choice to ${choiceGroup.name}`
          }
        >
          <ChoiceForm
            key={`${choice.groupId}-${choice.optionId ?? "new"}`}
            group={choiceGroup}
            option={currentChoice}
            onClose={() => setChoice(null)}
          />
        </Modal>
      )}
    </section>
  );
}
