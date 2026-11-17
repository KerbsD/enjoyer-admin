import { Modal } from "@/components/ui/Modal";
import { shopTime, statusLabel } from "@/lib/shop-format";

import { AccountForm } from "./AccountForm";
import { useAccountCard } from "./useAccountCard";

import type { AccountCardProps } from "@/types/accounts";

export function AccountCard({ account, onNotice }: AccountCardProps) {
  const {
    self,
    editing,
    setEditing,
    confirming,
    setConfirming,
    working,
    error,
    changeActive,
    sendInvite,
  } = useAccountCard({ account, onNotice });

  return (
    <article className="managed-table account-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            ACCOUNT {account.id}
            {self ? " · YOU" : ""}
          </span>
          <h2>{account.name}</h2>
        </div>
        <span
          className={`status-tag ${account.active ? "status-open" : "status-served"}`}
        >
          {account.active ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="account-email">{account.email}</p>
      <p>
        <strong>{statusLabel(account.role)}</strong> ·{" "}
        {account.invitePending
          ? "Invite pending (no password set)"
          : "Invite accepted"}
      </p>
      {account.invitePending && (
        <p>
          {account.inviteExpiresAt
            ? `Invite link expires: ${shopTime(account.inviteExpiresAt)}`
            : "No current invite link"}
        </p>
      )}
      <p>Created {shopTime(account.createdAt)}</p>
      <div className="action-row">
        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            setEditing(true);
            setConfirming(false);
          }}
        >
          Edit name and role
        </button>
        <button
          type="button"
          className="button button-outline"
          disabled={working || (account.active && self)}
          onClick={() => {
            setConfirming(!confirming);
            setEditing(false);
          }}
        >
          {account.active ? "Deactivate" : "Reactivate"}
        </button>
        {account.active && account.invitePending && (
          <button
            type="button"
            className="button button-outline"
            disabled={working}
            onClick={() => void sendInvite()}
          >
            {working ? "Sending…" : "Resend invite"}
          </button>
        )}
      </div>
      {self && (
        <p>You cannot deactivate your own account or change your own role.</p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {confirming && (
        <div className="action-panel">
          <p>
            {account.active
              ? `Deactivate ${account.name}? Their active sessions and any pending invite/reset link will be revoked. Past orders and account history remain.`
              : `Reactivate ${account.name}? Previous sessions will not be restored.${account.invitePending ? " Send a new invite afterward; reactivation does not email one." : ""}`}
          </p>
          <div className="action-row">
            <button
              type="button"
              className={`button ${account.active ? "button-danger" : ""}`}
              disabled={working}
              onClick={() => void changeActive()}
            >
              {working
                ? "Saving…"
                : account.active
                  ? "Confirm deactivation"
                  : "Confirm reactivation"}
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setConfirming(false)}
            >
              Keep as is
            </button>
          </div>
        </div>
      )}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={`Edit ${account.name}`}
      >
        <AccountForm
          key={account.id}
          account={account}
          onClose={() => setEditing(false)}
          onNotice={onNotice}
        />
      </Modal>
    </article>
  );
}
