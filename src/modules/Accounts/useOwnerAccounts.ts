import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAccounts, type AccountFilters } from "@/api/accounts";
import { accountSearchSchema } from "@/schemas/accounts";

import { accountKey, defaultFilters } from "@/constants/account";

export function useOwnerAccounts() {
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [draftRole, setDraftRole] = useState<AccountFilters["role"]>();
  const [draftActive, setDraftActive] = useState<"all" | "true" | "false">(
    "all",
  );

  const [sort, setSort] = useState<AccountFilters["sort"]>("createdAt");
  const [order, setOrder] = useState<AccountFilters["order"]>("desc");
  const [filters, setFilters] = useState<AccountFilters>(defaultFilters);
  const [offset, setOffset] = useState(0);

  const query = useQuery({
    queryKey: [...accountKey, filters, offset],
    queryFn: ({ signal }) => listAccounts(filters, offset, signal),
  });

  function apply(e: FormEvent) {
    e.preventDefault();
    const parsed = accountSearchSchema.safeParse(search);
    if (!parsed.success) {
      setSearchError(parsed.error.issues[0]?.message ?? "Invalid search.");
      return;
    }
    setSearchError("");
    setOffset(0);
    setFilters({
      search: parsed.data || undefined,
      role: draftRole,
      active: draftActive === "all" ? undefined : draftActive === "true",
      sort,
      order,
    });
  }

  const clear = () => {
    setSearch("");
    setSearchError("");
    setDraftRole(undefined);
    setDraftActive("all");
    setSort("createdAt");
    setOrder("desc");
    setFilters(defaultFilters);
    setOffset(0);
  };

  return {
    creating,
    setCreating,
    notice,
    setNotice,
    search,
    setSearch,
    searchError,
    draftRole,
    setDraftRole,
    draftActive,
    setDraftActive,
    sort,
    setSort,
    order,
    setOrder,
    offset,
    setOffset,
    query,
    apply,
    clear,
  };
}
