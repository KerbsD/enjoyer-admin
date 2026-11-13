export function saveAttachment(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Delay revocation until the browser has begun its download.
  setTimeout(() => URL.revokeObjectURL(href), 60_000);
}
