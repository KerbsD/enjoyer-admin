import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";
import { createTable, updateTable } from "@/api/tables";
import { staffKeys } from "@/constants/staff";
import { tableSchema } from "@/schemas/tables";
import type { TableFormProps } from "@/types/tables";

export function useTableForm({ table, onClose }: TableFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: table?.name ?? "",
      orderLimit: table?.orderLimit ?? 5,
    },
  });

  const submit = handleSubmit(async (input) => {
    setError("");
    try {
      if (table) await updateTable(table.id, input);
      else await createTable({ ...input, active: true });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.managedTables }),
        queryClient.invalidateQueries({ queryKey: staffKeys.tables }),
      ]);
      toast.success(table ? "Table updated." : "Table created.");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save table.",
      );
    }
  });

  return { register, errors, isSubmitting, error, submit };
}
