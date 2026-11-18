import { Modal } from "@/components/ui/Modal";
import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import { useCategoriesSection } from "./useCategoriesSection";

export function Categories() {
  const { result, creating, setCreating } = useCategoriesSection();

  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Categories</h2>
        </div>
        <button
          className="button"
          type="button"
          onClick={() => setCreating(true)}
        >
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
      {result.data?.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New category"
      >
        <CategoryForm onClose={() => setCreating(false)} />
      </Modal>
    </section>
  );
}
