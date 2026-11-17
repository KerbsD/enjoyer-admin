import { Modal } from "@/components/ui/Modal";
import { peso } from "@/lib/shop-format";
import type { ItemCardProps } from "@/types/menu";
import { AssignmentForm } from "./AssignmentForm";
import { ItemForm } from "./ItemForm";
import { useItemCard } from "./useItemCard";

export function ItemCard({ item, categories, categoryName }: ItemCardProps) {
  const {
    editing,
    assigning,
    saving,
    error,
    openEditor,
    closeEditor,
    openAssignments,
    closeAssignments,
    toggleAvailability,
    toggleHidden,
  } = useItemCard(item);

  return (
    <>
      <div className="menu-row">
        <div>
          <strong>
            {item.name}
            {item.isSpicy ? " · Spicy" : ""}
          </strong>
          <span>
            {categoryName} · {peso(item.price)} · position {item.sortOrder} ·{" "}
            {item.isHidden ? "Hidden" : "Visible"} ·{" "}
            {item.isAvailable ? "Available" : "Sold out"}
          </span>
        </div>
        <div className="action-row">
          <button
            className="button button-outline"
            type="button"
            onClick={openEditor}
          >
            Edit
          </button>
          <button
            className="button button-outline"
            type="button"
            onClick={openAssignments}
          >
            Add-ons
          </button>
          <button
            className="button button-outline"
            type="button"
            disabled={saving}
            onClick={() => void toggleAvailability()}
          >
            {saving ? "Saving…" : item.isAvailable ? "Sold out" : "Available"}
          </button>
          <button
            className="button button-outline"
            type="button"
            disabled={saving}
            onClick={() => void toggleHidden()}
          >
            {item.isHidden ? "Show" : "Hide"}
          </button>
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {categories.length > 0 && (
        <Modal open={editing} onClose={closeEditor} title={`Edit ${item.name}`}>
          <ItemForm item={item} categories={categories} onClose={closeEditor} />
        </Modal>
      )}
      <Modal
        open={assigning}
        onClose={closeAssignments}
        title={`Add-ons for ${item.name}`}
      >
        <AssignmentForm item={item} onClose={closeAssignments} />
      </Modal>
    </>
  );
}
