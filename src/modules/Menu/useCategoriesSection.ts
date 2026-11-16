import { useState } from "react";
import { useCategories } from "./useMenu";

export function useCategoriesSection() {
  const result = useCategories();
  const [creating, setCreating] = useState(false);

  return { result, creating, setCreating };
}
