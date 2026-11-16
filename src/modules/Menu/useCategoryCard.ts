import { useState } from "react";

export function useCategoryCard() {
  const [editing, setEditing] = useState(false);

  return { editing, setEditing };
}
