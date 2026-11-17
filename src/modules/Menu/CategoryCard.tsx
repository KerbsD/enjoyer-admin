import { Modal } from "@/components/ui/Modal";
import type { CategoryCardProps } from "@/types/menu";
import { CategoryForm } from "./CategoryForm";
import { useCategoryCard } from "./useCategoryCard";

export function CategoryCard({ category }: CategoryCardProps) {
  const { editing, setEditing } = useCategoryCard();

  return (
    <>
      <div className="menu-row">
        <div>
          <strong>{category.name}</strong>
          <span>Position {category.sortOrder}</span>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      </div>
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={`Edit ${category.name}`}
      >
        <CategoryForm category={category} onClose={() => setEditing(false)} />
      </Modal>
    </>
  );
}
