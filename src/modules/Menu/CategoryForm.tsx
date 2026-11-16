import { Field } from "@/components/ui/Field";
import type { CategoryFormProps } from "@/types/menu";
import { useCategoryForm } from "./useCategoryForm";

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const { register, errors, isSubmitting, error, submit } = useCategoryForm({
    category,
    onClose,
  });

  return (
    <form className="menu-editor" onSubmit={submit}>
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
      {error && (
        <p className="error" role="alert">
          {error}
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
