import { attachment, request } from "@/lib/api";

export type ManagedTable = {
  id: number; name: string; orderLimit: number; active: boolean;
  qrToken: string; qrUrl: string; createdAt: string; updatedAt: string;
};
export type TableInput = { name: string; orderLimit: number; active: boolean };
type Envelope<T> = { success: true; data: T };
type Page<T> = Envelope<T[]> & { pagination: { limit: number; offset: number; total: number; hasMore: boolean } };

export async function listManagedTables(signal?: AbortSignal): Promise<ManagedTable[]> {
  const results: ManagedTable[] = [];
  let offset = 0;
  for (;;) {
    const page = await request<Page<ManagedTable>>(`/admin/tables?limit=100&offset=${offset}`, { signal });
    results.push(...page.data);
    if (!page.pagination.hasMore) return results;
    if (!page.data.length) throw new Error("Table pagination did not advance.");
    offset += page.data.length;
  }
}

export const createTable = (body: TableInput) => request<Envelope<ManagedTable>>("/admin/tables", { method: "POST", body });
export const updateTable = (id: number, body: Partial<TableInput>) => request<Envelope<ManagedTable>>(`/admin/tables/${id}`, { method: "PATCH", body });

export type QrFormat = "png" | "svg";
export const downloadQr = (id: number, format: QrFormat) => attachment(`/admin/tables/${id}/qr?format=${format}`);
export const downloadQrSheet = () => attachment("/admin/tables/qr-sheet");
