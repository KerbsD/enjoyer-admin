import { type AccountFilters } from "@/api/accounts";
import { Modal } from "@/components/ui/Modal";

import { AccountCard } from "./AccountCard";
import { AccountForm } from "./AccountForm";
import { useOwnerAccounts } from "./useOwnerAccounts";

export function OwnerAccounts() {
  const {
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
  } = useOwnerAccounts();

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">ENJOYER / OWNER</span>
        <h1>
          Accounts<span className="brand-dot">.</span>
        </h1>
        <p>
          Manage team access and emailed invitations. Accounts are deactivated,
          not deleted.
        </p>
      </div>
      <div className="account-toolbar">
        <button
          className="button"
          type="button"
          onClick={() => setCreating(true)}
        >
          Invite team member
        </button>
        <button
          className="button button-outline"
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Refresh
        </button>
      </div>
      {notice && (
        <div className="new-orders-banner" role="status">
          <span>{notice}</span>
          <button
            className="text-button"
            type="button"
            onClick={() => setNotice("")}
          >
            Dismiss
          </button>
        </div>
      )}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Invite a team member"
      >
        <AccountForm onClose={() => setCreating(false)} onNotice={setNotice} />
      </Modal>
      <form className="report-controls" onSubmit={apply}>
        <label className="field">
          <span>Search name or email</span>
          <input
            type="search"
            maxLength={100}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Role</span>
          <select
            value={draftRole ?? ""}
            onChange={(e) =>
              setDraftRole(
                e.target.value
                  ? (e.target.value as AccountFilters["role"])
                  : undefined,
              )
            }
          >
            <option value="">All roles</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select
            value={draftActive}
            onChange={(e) =>
              setDraftActive(e.target.value as typeof draftActive)
            }
          >
            <option value="all">All accounts</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <label className="field">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="createdAt">Created</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className="field">
          <span>Direction</span>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as typeof order)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <button className="button" type="submit">
          Apply filters
        </button>
        <button className="button button-outline" type="button" onClick={clear}>
          Clear
        </button>
      </form>
      {searchError && (
        <p className="error" role="alert">
          {searchError}
        </p>
      )}
      {query.isPending && <p role="status">Loading accounts…</p>}
      {query.isError && (
        <p className="error" role="alert">
          {query.error.message}{" "}
          <button
            className="text-button"
            type="button"
            onClick={() => void query.refetch()}
          >
            Retry
          </button>
        </p>
      )}
      {query.data && (
        <>
          <p className="report-caption">
            {query.data.pagination.total} accounts · showing{" "}
            {query.data.pagination.total ? offset + 1 : 0}–
            {offset + query.data.data.length}
          </p>
          {query.data.data.length ? (
            <div className="managed-table-grid">
              {query.data.data.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onNotice={setNotice}
                />
              ))}
            </div>
          ) : (
            <p>No accounts match these filters.</p>
          )}
          <div className="report-pagination">
            <button
              className="button button-outline"
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 25))}
            >
              Previous
            </button>
            <span>Page {Math.floor(offset / 25) + 1}</span>
            <button
              className="button button-outline"
              type="button"
              disabled={!query.data.pagination.hasMore}
              onClick={() => setOffset(offset + 25)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
