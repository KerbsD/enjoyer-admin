import { Modal } from "@/components/ui/Modal";
import type { TableCardProps } from "@/types/tables";
import { TableActivationPanel } from "./TableActivationPanel";
import { TableForm } from "./TableForm";
import { TableQrActions } from "./TableQrActions";
import { useTableCard } from "./useTableCard";

export function TableCard({ table }: TableCardProps) {
  const {
    editing,
    confirming,
    saving,
    downloading,
    target,
    saveQr,
    changeActivation,
    openEdit,
    toggleConfirming,
    closeEdit,
    cancelConfirm,
  } = useTableCard({ table });

  return (
    <article className="managed-table">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TABLE {table.id}</span>
          <h2>{table.name}</h2>
        </div>
        <span
          className={`status-tag ${table.active ? "status-open" : "status-served"}`}
        >
          {table.active ? "Active" : "Inactive"}
        </span>
      </div>
      <p>
        Order limit: <strong>{table.orderLimit} per session</strong>
      </p>
      <p className="qr-target">
        QR destination:{" "}
        <code>
          {target.origin}
          {target.pathname}
        </code>
        <span>Token hidden · verify the customer origin before printing.</span>
      </p>
      <div className="action-row">
        <button
          type="button"
          className="button button-outline"
          onClick={openEdit}
        >
          Edit name & limit
        </button>
        <button
          type="button"
          className="button button-outline"
          disabled={saving}
          onClick={toggleConfirming}
        >
          {table.active ? "Deactivate" : "Reactivate"}
        </button>
      </div>
      <TableQrActions
        active={table.active}
        downloading={downloading}
        onDownload={(format) => void saveQr(format)}
      />
      {confirming && (
        <TableActivationPanel
          active={table.active}
          saving={saving}
          onConfirm={() => void changeActivation()}
          onCancel={cancelConfirm}
        />
      )}
      <Modal open={editing} onClose={closeEdit} title={`Edit ${table.name}`}>
        <TableForm key={table.id} table={table} onClose={closeEdit} />
      </Modal>
    </article>
  );
}
