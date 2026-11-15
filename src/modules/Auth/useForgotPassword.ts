import type { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPassword } from "@/lib/api";

import { emailSchema } from "@/schemas/auth";

export function useForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const submit = handleSubmit(async ({ email }) => {
    setError("");
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not send the reset link.",
      );
    }
  });

  return {
    register,
    errors,
    isSubmitting,
    message,
    error,
    submit,
  };
}
