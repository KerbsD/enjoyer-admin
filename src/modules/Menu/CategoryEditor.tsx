"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import type { Category } from "@/api/menu";
import { createCategory, updateCategory } from "@/api/menu";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useCategories, useRefreshMenu } from "./useMenu";
import { categorySchema } from "./schemas";

function CategoryForm({
  category,
  onClose,
}: {
  category?: Category;
  onClose: () => void;
}) {
  const refresh = useRefreshMenu();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      sortOrder: category?.sortOrder ?? 0,
    },
  });
  return (
    <form
      className="menu-editor"
      onSubmit={handleSubmit(async (data) => {
        setApiError("");
        try {
          if (category) await updateCategory(category.id, data);
          else await createCategory(data);
          await refresh();
          toast.success(category ? "Category updated." : "Category created.");
          onClose();
        } catch (error) {
          setApiError(
            error instanceof Error ? error.message : "Could not save category.",
          );
        }
      })}
    >
      <div className="editor-grid">
        <Field
          label="Category name"
          id="category-name"
          maxLength={100}
          error={errors.name?.message}
          {...register("name")}
        />
        <Field
          label="Position (lowest first)"
          id="category-order"
          type="number"
          min={0}
          max={2_147_483_647}
          error={errors.sortOrder?.message}
          {...register("sortOrder", { valueAsNumber: true })}
        />
      </div>
      {apiError && (
        <p className="error" role="alert">
          {apiError}
        </p>
      )}
      <div className="action-row">
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving…" : "Save category"}
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

export function CategoryEditor() {
  const result = useCategories();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const category = result.data?.find((c) => c.id === editing);
  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Categories</h2>
          <p>
            Change positions to reorder categories. Equal positions use ID
            order.
          </p>
        </div>
        <button className="button" onClick={() => setEditing("new")}>
          Add category
        </button>
      </div>
      {result.isPending && <p role="status">Loading categories…</p>}
      {result.isError && (
        <p className="error" role="alert">
          {result.error.message}{" "}
          <button className="text-button" onClick={() => void result.refetch()}>
            Retry
          </button>
        </p>
      )}
      {result.data?.length === 0 && (
        <p>No categories yet. Create one before adding items.</p>
      )}
      {result.data?.map((row) => (
        <div className="menu-row" key={row.id}>
          <div>
            <strong>{row.name}</strong>
            <span>Position {row.sortOrder}</span>
          </div>
          <button
            className="button button-outline"
            onClick={() => setEditing(row.id)}
          >
            Edit
          </button>
        </div>
      ))}
      {editing !== null && (editing === "new" || category) && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={category ? `Edit ${category.name}` : "New category"}
        >
          <CategoryForm
            key={editing}
            category={category}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </section>
  );
}
