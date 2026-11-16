const key = "enjoyer:locally-signed-out";
let signedOut = false;

export function locallySignedOut() {
  try {
    return signedOut || localStorage.getItem(key) === "1";
  } catch {
    return signedOut;
  }
}

export function markLocallySignedOut() {
  signedOut = true;
  try {
    localStorage.setItem(key, "1");
  } catch {
    // In-memory suppression still protects this tab when storage is blocked.
  }
}

export function allowSessionRestore() {
  signedOut = false;
  try {
    localStorage.removeItem(key);
  } catch {
    // A manual login is still valid without storage access.
  }
}
