import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { createCategory, updateCategory } from "@/api/menu";
import { categorySchema } from "@/schemas/menu";
import type { CategoryFormProps } from "@/types/menu";
import { useRefreshMenu } from "./useMenu";

export function useCategoryForm({ category, onClose }: CategoryFormProps) {
  const refresh = useRefreshMenu();
  const [error, setError] = useState("");
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

  const submit = handleSubmit(async (input) => {
    setError("");
    try {
      if (category) await updateCategory(category.id, input);
      else await createCategory(input);
      await refresh();
      toast.success(category ? "Category updated." : "Category created.");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save category.",
      );
    }
  });

  return { register, errors, isSubmitting, error, submit };
}
