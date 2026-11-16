import type { TableQrActionsProps } from "@/types/tables";

export function TableQrActions({
  active,
  downloading,
  onDownload,
}: TableQrActionsProps) {
  return (
    <>
      {active && (
        <div className="action-row">
          <button
            type="button"
            className="button button-outline"
            disabled={downloading !== null}
            onClick={() => onDownload("png")}
          >
            {downloading === "png" ? "Downloading…" : "Download PNG"}
          </button>
          <button
            type="button"
            className="button button-outline"
            disabled={downloading !== null}
            onClick={() => onDownload("svg")}
          >
            {downloading === "svg" ? "Downloading…" : "Download SVG"}
          </button>
        </div>
      )}
      {!active && (
        <p className="error">Reactivate to download this table’s QR code.</p>
      )}
    </>
  );
}
