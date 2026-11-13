"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";
import { createAccount, deactivateAccount, listAccounts, reactivateAccount, resendInvite, updateAccount, type Account, type AccountFilters } from "@/api/accounts";
import { Field } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { shopTime, statusLabel } from "@/lib/shop-format";
import { accountEditSchema, accountSchema, accountSearchSchema } from "./schema";

const accountKey = ["accounts"] as const;
const defaultFilters: AccountFilters = { sort: "createdAt", order: "desc" };

function AccountForm({ account, onClose, onNotice }: { account?: Account; onClose: () => void; onNotice: (notice: string) => void }) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const actorId = useAuthStore((s) => s.user?.id);
  const self = account !== undefined && account.id === actorId;
  type Input = z.infer<typeof accountSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Input>({
    resolver: zodResolver(accountSchema), defaultValues: { name: account?.name ?? "", email: account?.email ?? "", role: account?.role ?? "staff" },
  });
  return <form className="menu-editor account-form" onSubmit={handleSubmit(async (input) => {
    setError("");
    try {
      if (account) {
        const change = accountEditSchema.parse({ ...input, role: self ? account.role : input.role });
        if (self && change.role !== account.role) { setError("You cannot change your own role."); return; }
        await updateAccount(account.id, change);
        toast.success("Account updated.");
      } else {
        const result = await createAccount(accountSchema.parse(input));
        onNotice(result.message ?? (result.inviteEmailSent ? "Account created and invite emailed." : "Account created; invite email was not sent. Resend it after the email issue is fixed."));
      }
      await client.invalidateQueries({ queryKey: accountKey }); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save account."); }
  })}><h2>{account ? `Edit ${account.name}` : "Invite a team member"}</h2>
    <div className="editor-grid"><Field id={`account-name-${account?.id ?? "new"}`} label="Name" maxLength={100} error={errors.name?.message} {...register("name")} />
      {account ? <div className="field"><span className="eyebrow">Email (read-only)</span><strong className="account-readonly">{account.email}</strong><input type="hidden" {...register("email")} /></div> : <Field id="account-email-new" label="Email" type="email" maxLength={254} error={errors.email?.message} {...register("email")} />}
      {self ? <div className="field"><span className="eyebrow">Role (read-only)</span><strong className="account-readonly">{statusLabel(account?.role ?? "owner")}</strong><input type="hidden" {...register("role")} /></div> : <label className="field"><span className="eyebrow">Role</span><select {...register("role")}><option value="staff">Staff</option><option value="manager">Manager</option><option value="owner">Owner</option></select>{errors.role && <small className="error" role="alert">{errors.role.message}</small>}</label>}</div>
    {account ? <p>Changing a role revokes that person’s existing sessions; they must sign in again.</p> : <p>The account starts active, but cannot sign in until its owner accepts the emailed invite and sets a password. The invite link expires after 72 hours.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="action-row"><button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : account ? "Save changes" : "Create and email invite"}</button><button className="button button-outline" type="button" onClick={onClose}>Cancel</button></div>
  </form>;
}

function AccountCard({ account, onNotice }: { account: Account; onNotice: (notice: string) => void }) {
  const client = useQueryClient();
  const actorId = useAuthStore((s) => s.user?.id);
  const self = actorId === account.id;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  async function changeActive() {
    setWorking(true); setError("");
    try {
      const result = account.active ? await deactivateAccount(account.id) : await reactivateAccount(account.id);
      onNotice(result.message ?? "Account status updated.");
      await client.invalidateQueries({ queryKey: accountKey }); setConfirming(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not change account status."); }
    finally { setWorking(false); }
  }
  async function sendInvite() {
    setWorking(true); setError("");
    try { const result = await resendInvite(account.id); onNotice(result.message); await client.invalidateQueries({ queryKey: accountKey }); }
    catch (cause) {
      setError(`${cause instanceof Error ? cause.message : "Could not resend invite."}${cause instanceof ApiError && cause.status === 502 ? " The old link may already have been replaced; wait for the email cooldown before retrying." : ""}`);
      await client.invalidateQueries({ queryKey: accountKey });
    } finally { setWorking(false); }
  }
  return <article className="managed-table account-card"><div className="section-heading"><div><span className="eyebrow">ACCOUNT {account.id}{self ? " · YOU" : ""}</span><h2>{account.name}</h2></div><span className={`status-tag ${account.active ? "status-open" : "status-served"}`}>{account.active ? "Active" : "Inactive"}</span></div>
    <p className="account-email">{account.email}</p><p><strong>{statusLabel(account.role)}</strong> · {account.invitePending ? "Invite pending (no password set)" : "Invite accepted"}</p>
    {account.invitePending && <p>{account.inviteExpiresAt ? `Invite link expires: ${shopTime(account.inviteExpiresAt)}` : "No current invite link"}</p>}
    <p>Created {shopTime(account.createdAt)}</p>
    <div className="action-row"><button type="button" className="button button-outline" onClick={() => { setEditing(!editing); setConfirming(false); }}>{editing ? "Close editor" : "Edit name and role"}</button>
      <button type="button" className="button button-outline" disabled={working || (account.active && self)} onClick={() => { setConfirming(!confirming); setEditing(false); }}>{account.active ? "Deactivate" : "Reactivate"}</button>
      {account.active && account.invitePending && <button type="button" className="button button-outline" disabled={working} onClick={() => void sendInvite()}>{working ? "Sending…" : "Resend invite"}</button>}</div>
    {self && <p>You cannot deactivate your own account or change your own role.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {confirming && <div className="action-panel"><p>{account.active ? `Deactivate ${account.name}? Their active sessions and any pending invite/reset link will be revoked. Past orders and account history remain.` : `Reactivate ${account.name}? Previous sessions will not be restored.${account.invitePending ? " Send a new invite afterward; reactivation does not email one." : ""}`}</p>
      <div className="action-row"><button type="button" className={`button ${account.active ? "button-danger" : ""}`} disabled={working} onClick={() => void changeActive()}>{working ? "Saving…" : account.active ? "Confirm deactivation" : "Confirm reactivation"}</button><button type="button" className="button button-outline" onClick={() => setConfirming(false)}>Keep as is</button></div></div>}
    {editing && <AccountForm key={account.id} account={account} onClose={() => setEditing(false)} onNotice={onNotice} />}
  </article>;
}

function OwnerAccounts() {
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState(""); const [searchError, setSearchError] = useState("");
  const [draftRole, setDraftRole] = useState<AccountFilters["role"]>();
  const [draftActive, setDraftActive] = useState<"all" | "true" | "false">("all");
  const [sort, setSort] = useState<AccountFilters["sort"]>("createdAt"); const [order, setOrder] = useState<AccountFilters["order"]>("desc");
  const [filters, setFilters] = useState<AccountFilters>(defaultFilters);
  const [offset, setOffset] = useState(0);
  const query = useQuery({ queryKey: [...accountKey, filters, offset], queryFn: ({ signal }) => listAccounts(filters, offset, signal) });
  function apply(e: FormEvent) {
    e.preventDefault(); const parsed = accountSearchSchema.safeParse(search);
    if (!parsed.success) { setSearchError(parsed.error.issues[0]?.message ?? "Invalid search."); return; }
    setSearchError(""); setOffset(0);
    setFilters({ search: parsed.data || undefined, role: draftRole, active: draftActive === "all" ? undefined : draftActive === "true", sort, order });
  }
  return <div><div className="page-head"><span className="eyebrow">ENJOYER / OWNER</span><h1>Accounts<span className="brand-dot">.</span></h1><p>Manage team access and emailed invitations. Accounts are deactivated, not deleted.</p></div>
    <div className="account-toolbar"><button className="button" type="button" onClick={() => setCreating(true)}>Invite team member</button><button className="button button-outline" type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>Refresh</button></div>
    {notice && <div className="new-orders-banner" role="status"><span>{notice}</span><button className="text-button" type="button" onClick={() => setNotice("")}>Dismiss</button></div>}
    {creating && <AccountForm onClose={() => setCreating(false)} onNotice={setNotice} />}
    <form className="report-controls" onSubmit={apply}><label className="field"><span>Search name or email</span><input type="search" maxLength={100} value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <label className="field"><span>Role</span><select value={draftRole ?? ""} onChange={(e) => setDraftRole(e.target.value ? e.target.value as AccountFilters["role"] : undefined)}><option value="">All roles</option><option value="staff">Staff</option><option value="manager">Manager</option><option value="owner">Owner</option></select></label>
      <label className="field"><span>Status</span><select value={draftActive} onChange={(e) => setDraftActive(e.target.value as typeof draftActive)}><option value="all">All accounts</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
      <label className="field"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="createdAt">Created</option><option value="name">Name</option></select></label>
      <label className="field"><span>Direction</span><select value={order} onChange={(e) => setOrder(e.target.value as typeof order)}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
      <button className="button" type="submit">Apply filters</button><button className="button button-outline" type="button" onClick={() => { setSearch(""); setSearchError(""); setDraftRole(undefined); setDraftActive("all"); setSort("createdAt"); setOrder("desc"); setFilters(defaultFilters); setOffset(0); }}>Clear</button></form>
    {searchError && <p className="error" role="alert">{searchError}</p>}
    {query.isPending && <p role="status">Loading accounts…</p>}
    {query.isError && <p className="error" role="alert">{query.error.message} <button className="text-button" type="button" onClick={() => void query.refetch()}>Retry</button></p>}
    {query.data && <><p className="report-caption">{query.data.pagination.total} accounts · showing {query.data.pagination.total ? offset + 1 : 0}–{offset + query.data.data.length}</p>
      {query.data.data.length ? <div className="managed-table-grid">{query.data.data.map((account) => <AccountCard key={account.id} account={account} onNotice={setNotice} />)}</div> : <p>No accounts match these filters.</p>}
      <div className="report-pagination"><button className="button button-outline" type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 25))}>Previous</button><span>Page {Math.floor(offset / 25) + 1}</span><button className="button button-outline" type="button" disabled={!query.data.pagination.hasMore} onClick={() => setOffset(offset + 25)}>Next</button></div></>}
  </div>;
}

export default function Accounts() {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "owner") return <div className="feature-note" role="alert"><h1>Access restricted</h1><p>Only an Owner can manage accounts.</p><Link className="text-button" href="/board">Return to live orders</Link></div>;
  return <OwnerAccounts />;
}
