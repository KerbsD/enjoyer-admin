"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import type { Category, MenuItem } from "@/api/menu";
import { createItem, setAvailability, updateItem } from "@/api/menu";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { peso } from "@/lib/shop-format";
import { itemSchema } from "./schemas";
import { useCategories, useItems, useRefreshMenu } from "./useMenu";
import { AssignmentEditor } from "./AssignmentEditor";

function ItemForm({
  item,
  categories,
  onClose,
}: {
  item?: MenuItem;
  categories: Category[];
  onClose: () => void;
}) {
  const refresh = useRefreshMenu();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof itemSchema>, unknown, z.output<typeof itemSchema>>(
    {
      resolver: zodResolver(itemSchema),
      defaultValues: {
        categoryId: item?.categoryId ?? categories[0]?.id,
        name: item?.name ?? "",
        description: item?.description ?? "",
        price: item?.price ?? "0.00",
        sortOrder: item?.sortOrder ?? 0,
        isSpicy: item?.isSpicy ?? false,
        isHidden: item?.isHidden ?? false,
        isAvailable: item?.isAvailable ?? true,
      },
    },
  );
  return (
    <form
      className="menu-editor"
      onSubmit={handleSubmit(async (data) => {
        setApiError("");
        try {
          if (item) await updateItem(item.id, data);
          else await createItem(data);
          await refresh();
          toast.success(item ? "Item updated." : "Item created.");
          onClose();
        } catch (error) {
          setApiError(
            error instanceof Error ? error.message : "Could not save item.",
          );
        }
      })}
    >
      <div className="editor-grid">
        <label className="field">
          <span className="eyebrow">Category</span>
          <select
            {...register("categoryId", { valueAsNumber: true })}
            aria-invalid={!!errors.categoryId}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span className="field-error">Choose a category.</span>
          )}
        </label>
        <Field
          label="Item name"
          id="item-name"
          maxLength={100}
          error={errors.name?.message}
          {...register("name")}
        />
        <Field
          label="Price (PHP)"
          id="item-price"
          inputMode="decimal"
          error={errors.price?.message}
          {...register("price")}
        />
        <Field
          label="Position within category"
          id="item-position"
          type="number"
          min={0}
          max={2_147_483_647}
          error={errors.sortOrder?.message}
          {...register("sortOrder", { valueAsNumber: true })}
        />
      </div>
      <label className="field">
        <span className="eyebrow">Description</span>
        <textarea maxLength={2000} rows={3} {...register("description")} />
        {errors.description && (
          <span className="field-error">{errors.description.message}</span>
        )}
      </label>
      <div className="check-row">
        <label>
          <input type="checkbox" {...register("isSpicy")} /> Spicy marker
        </label>
        <label>
          <input type="checkbox" {...register("isAvailable")} /> Available
        </label>
        <label>
          <input type="checkbox" {...register("isHidden")} /> Hidden from
          customer menu
        </label>
      </div>
      {apiError && (
        <p className="error" role="alert">
          {apiError}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save item"}
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

export function ItemEditor() {
  const list = useItems();
  const cats = useCategories();
  const refresh = useRefreshMenu();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const selected = list.data?.find((v) => v.id === editing);
  const assignedItem = list.data?.find((v) => v.id === assigning);
  const filtered = list.data?.filter(
    (item) => filter === "all" || item.categoryId === Number(filter),
  );
  const mutate = async (id: number, action: () => Promise<unknown>) => {
    setSavingId(id);
    setError("");
    try {
      await action();
      await refresh();
      toast.success("Item updated.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update item.",
      );
    } finally {
      setSavingId(null);
    }
  };
  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Menu items</h2>
          <p>
            Hidden items are not shown to customers; sold-out items stay
            visible.
          </p>
        </div>
        <button
          className="button"
          disabled={!cats.data?.length}
          onClick={() => {
            setEditing("new");
            setAssigning(null);
          }}
        >
          Add item
        </button>
      </div>
      <label className="field filter-field">
        <span className="eyebrow">Category filter</span>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {cats.data?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>
      {(list.isPending || cats.isPending) && <p role="status">Loading menu…</p>}
      {(list.isError || cats.isError) && (
        <p className="error" role="alert">
          {list.error?.message || cats.error?.message}{" "}
          <button
            className="text-button"
            onClick={() => {
              void list.refetch();
              void cats.refetch();
            }}
          >
            Retry
          </button>
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {filtered?.length === 0 && <p>No items in this selection.</p>}
      {filtered?.map((item) => (
        <div className="menu-row" key={item.id}>
          <div>
            <strong>
              {item.name}
              {item.isSpicy ? " · Spicy" : ""}
            </strong>
            <span>
              {cats.data?.find((c) => c.id === item.categoryId)?.name} ·{" "}
              {peso(item.price)} · position {item.sortOrder} ·{" "}
              {item.isHidden ? "Hidden" : "Visible"} ·{" "}
              {item.isAvailable ? "Available" : "Sold out"}
            </span>
          </div>
          <div className="action-row">
            <button
              className="button button-outline"
              onClick={() => {
                setEditing(item.id);
                setAssigning(null);
              }}
            >
              Edit
            </button>
            <button
              className="button button-outline"
              onClick={() => {
                setAssigning(item.id);
                setEditing(null);
              }}
            >
              Add-ons
            </button>
            <button
              className="button button-outline"
              disabled={savingId !== null}
              onClick={() =>
                void mutate(item.id, () =>
                  setAvailability(item.id, !item.isAvailable),
                )
              }
            >
              {savingId === item.id
                ? "Saving…"
                : item.isAvailable
                  ? "Sold out"
                  : "Available"}
            </button>
            <button
              className="button button-outline"
              disabled={savingId !== null}
              onClick={() =>
                void mutate(item.id, () =>
                  updateItem(item.id, { isHidden: !item.isHidden }),
                )
              }
            >
              {item.isHidden ? "Show" : "Hide"}
            </button>
          </div>
        </div>
      ))}
      {editing !== null &&
        (editing === "new" || selected) &&
        !!cats.data?.length && (
          <Modal
            open
            onClose={() => setEditing(null)}
            title={selected ? `Edit ${selected.name}` : "New menu item"}
          >
            <ItemForm
              key={editing}
              item={selected}
              categories={cats.data}
              onClose={() => setEditing(null)}
            />
          </Modal>
        )}
      {assignedItem && (
        <Modal
          open
          onClose={() => setAssigning(null)}
          title={`Add-ons for ${assignedItem.name}`}
        >
          <AssignmentEditor
            key={assignedItem.id}
            item={assignedItem}
            onClose={() => setAssigning(null)}
          />
        </Modal>
      )}
    </section>
  );
}
