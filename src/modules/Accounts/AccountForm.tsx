import { Field } from "@/components/ui/Field";
import { statusLabel } from "@/lib/shop-format";

import { useAccountForm } from "./useAccountForm";

import type { AccountFormProps } from "@/types/accounts";

export function AccountForm(props: AccountFormProps) {
  const { account, onClose } = props;
  const { register, errors, isSubmitting, error, self, submit } =
    useAccountForm(props);

  return (
    <form className="menu-editor account-form" onSubmit={submit}>
      <h2>{account ? `Edit ${account.name}` : "Invite a team member"}</h2>
      <div className="editor-grid">
        <Field
          id={`account-name-${account?.id ?? "new"}`}
          label="Name"
          maxLength={100}
          error={errors.name?.message}
          {...register("name")}
        />
        {account ? (
          <div className="field">
            <span className="eyebrow">Email (read-only)</span>
            <strong className="account-readonly">{account.email}</strong>
            <input type="hidden" {...register("email")} />
          </div>
        ) : (
          <Field
            id="account-email-new"
            label="Email"
            type="email"
            maxLength={254}
            error={errors.email?.message}
            {...register("email")}
          />
        )}
        {self ? (
          <div className="field">
            <span className="eyebrow">Role (read-only)</span>
            <strong className="account-readonly">
              {statusLabel(account?.role ?? "owner")}
            </strong>
            <input type="hidden" {...register("role")} />
          </div>
        ) : (
          <label className="field">
            <span className="eyebrow">Role</span>
            <select {...register("role")}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
            {errors.role && (
              <small className="error" role="alert">
                {errors.role.message}
              </small>
            )}
          </label>
        )}
      </div>
      {account ? (
        <p>
          Changing a role revokes that person’s existing sessions; they must
          sign in again.
        </p>
      ) : (
        <p>
          The account starts active, but cannot sign in until its owner accepts
          the emailed invite and sets a password. The invite link expires after
          72 hours.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : account
              ? "Save changes"
              : "Create and email invite"}
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
