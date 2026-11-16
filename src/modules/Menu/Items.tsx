import { Modal } from "@/components/ui/Modal";
import { ItemCard } from "./ItemCard";
import { ItemForm } from "./ItemForm";
import { useItemsSection } from "./useItemsSection";

export function Items() {
  const {
    list,
    categories,
    filter,
    setFilter,
    creating,
    setCreating,
    filtered,
  } = useItemsSection();

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
          type="button"
          disabled={!categories.data?.length}
          onClick={() => setCreating(true)}
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
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      {(list.isPending || categories.isPending) && (
        <p role="status">Loading menu…</p>
      )}
      {(list.isError || categories.isError) && (
        <p className="error" role="alert">
          {list.error?.message || categories.error?.message}{" "}
          <button
            className="text-button"
            onClick={() => {
              void list.refetch();
              void categories.refetch();
            }}
          >
            Retry
          </button>
        </p>
      )}
      {filtered?.length === 0 && <p>No items in this selection.</p>}
      {filtered?.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          categories={categories.data ?? []}
          categoryName={
            categories.data?.find((c) => c.id === item.categoryId)?.name
          }
        />
      ))}
      {categories.data?.length ? (
        <Modal
          open={creating}
          onClose={() => setCreating(false)}
          title="New menu item"
        >
          <ItemForm
            categories={categories.data}
            onClose={() => setCreating(false)}
          />
        </Modal>
      ) : null}
    </section>
  );
}
