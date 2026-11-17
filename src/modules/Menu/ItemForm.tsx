import { Field } from "@/components/ui/Field";
import type { ItemFormProps } from "@/types/menu";
import { useItemForm } from "./useItemForm";

export function ItemForm({ item, categories, onClose }: ItemFormProps) {
  const { register, errors, isSubmitting, error, submit } = useItemForm({
    item,
    categories,
    onClose,
  });

  return (
    <form className="menu-editor" onSubmit={submit}>
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
      {error && (
        <p className="error" role="alert">
          {error}
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
