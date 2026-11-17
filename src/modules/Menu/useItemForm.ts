import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { createItem, updateItem } from "@/api/menu";
import { itemSchema } from "@/schemas/menu";
import type { ItemFormProps } from "@/types/menu";
import { useRefreshMenu } from "./useMenu";

export function useItemForm({ item, categories, onClose }: ItemFormProps) {
  const refresh = useRefreshMenu();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof itemSchema>, unknown, z.output<typeof itemSchema>>(
    {
      resolver: zodResolver(itemSchema),
      defaultValues: {
        categoryId: item?.categoryId ?? categories[0]?.id,
        name: item?.name ?? "",
        description: item?.description ?? "",
        price: item?.price ?? "0.00",
        sortOrder: item?.sortOrder ?? 0,
        isSpicy: item?.isSpicy ?? false,
        isHidden: item?.isHidden ?? false,
        isAvailable: item?.isAvailable ?? true,
      },
    },
  );

  const submit = handleSubmit(async (input) => {
    setError("");
    try {
      if (item) await updateItem(item.id, input);
      else await createItem(input);
      await refresh();
      toast.success(item ? "Item updated." : "Item created.");
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save item.");
    }
  });

  return { register, errors, isSubmitting, error, submit };
}
