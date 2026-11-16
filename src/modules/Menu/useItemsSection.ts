import { useState } from "react";
import { useCategories, useItems } from "./useMenu";

export function useItemsSection() {
  const list = useItems();
  const categories = useCategories();
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const filtered = list.data?.filter(
    (item) => filter === "all" || item.categoryId === Number(filter),
  );

  return {
    list,
    categories,
    filter,
    setFilter,
    creating,
    setCreating,
    filtered,
  };
}
