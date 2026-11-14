import { request } from "@/lib/api";

export type Category = {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
export type MenuItem = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: string;
  isSpicy: boolean;
  isAvailable: boolean;
  isHidden: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
export type Option = {
  id: number;
  groupId: number;
  name: string;
  priceDelta: string;
  isAvailable: boolean;
  sortOrder: number;
};
export type OptionGroup = {
  id: number;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  options: Option[];
};
export type AssignedGroup = Omit<OptionGroup, "options"> & {
  options: Omit<Option, "groupId">[];
};
export type PublicCategory = {
  id: number;
  name: string;
  sortOrder: number;
  items: (Pick<
    MenuItem,
    | "id"
    | "name"
    | "description"
    | "price"
    | "isSpicy"
    | "isAvailable"
    | "sortOrder"
  > & { optionGroups: AssignedGroup[] })[];
};
type Envelope<T> = { success: true; data: T; currency?: "PHP" };
type Page<T> = Envelope<T[]> & {
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
};
const id = (value: number) => encodeURIComponent(String(value));

async function allPages<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const result: T[] = [];
  let offset = 0;
  while (true) {
    const join = path.includes("?") ? "&" : "?";
    const page = await request<Page<T>>(
      `${path}${join}limit=100&offset=${offset}`,
      { signal },
    );
    result.push(...page.data);
    if (!page.pagination.hasMore) return result;
    if (!page.data.length) throw new Error("Menu pagination did not advance.");
    offset += page.data.length;
  }
}
export const categories = (signal?: AbortSignal) =>
  allPages<Category>("/admin/categories", signal);
export const createCategory = (body: { name: string; sortOrder: number }) =>
  request<Envelope<Category>>("/admin/categories", { method: "POST", body });
export const updateCategory = (
  categoryId: number,
  body: Partial<{ name: string; sortOrder: number }>,
) =>
  request<Envelope<Category>>(`/admin/categories/${id(categoryId)}`, {
    method: "PATCH",
    body,
  });
export const items = (signal?: AbortSignal) =>
  allPages<MenuItem>("/admin/menu-items", signal);
export const createItem = (
  body: Omit<MenuItem, "id" | "createdAt" | "updatedAt">,
) => request<Envelope<MenuItem>>("/admin/menu-items", { method: "POST", body });
export const updateItem = (
  itemId: number,
  body: Partial<Omit<MenuItem, "id" | "createdAt" | "updatedAt">>,
) =>
  request<Envelope<MenuItem>>(`/admin/menu-items/${id(itemId)}`, {
    method: "PATCH",
    body,
  });
export const setAvailability = (itemId: number, isAvailable: boolean) =>
  request<Envelope<MenuItem>>(`/staff/menu-items/${id(itemId)}/availability`, {
    method: "PATCH",
    body: { isAvailable },
  });
export const publicMenu = (signal?: AbortSignal) =>
  request<Envelope<PublicCategory[]>>("/menu", { auth: false, signal });
export const optionGroups = (signal?: AbortSignal) =>
  request<Envelope<OptionGroup[]>>("/admin/option-groups", { signal });
export type OptionBody = {
  name: string;
  priceDelta: string;
  isAvailable: boolean;
  sortOrder: number;
};
export type GroupBody = {
  name: string;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
};
export const createGroup = (body: GroupBody & { options: OptionBody[] }) =>
  request<Envelope<OptionGroup>>("/admin/option-groups", {
    method: "POST",
    body,
  });
export const updateGroup = (groupId: number, body: GroupBody) =>
  request<Envelope<OptionGroup>>(`/admin/option-groups/${id(groupId)}`, {
    method: "PATCH",
    body,
  });
export const createOption = (groupId: number, body: OptionBody) =>
  request<Envelope<Option>>(`/admin/option-groups/${id(groupId)}/options`, {
    method: "POST",
    body,
  });
export const updateOption = (
  groupId: number,
  optionId: number,
  body: OptionBody,
) =>
  request<Envelope<Option>>(
    `/admin/option-groups/${id(groupId)}/options/${id(optionId)}`,
    { method: "PATCH", body },
  );
export const itemOptionGroups = (itemId: number, signal?: AbortSignal) =>
  request<Envelope<AssignedGroup[]>>(
    `/admin/menu-items/${id(itemId)}/option-groups`,
    { signal },
  );
export const assignGroups = (itemId: number, groupIds: number[]) =>
  request<Envelope<{ menuItemId: number; groupIds: number[] }>>(
    `/admin/menu-items/${id(itemId)}/option-groups`,
    { method: "PUT", body: { groupIds } },
  );
