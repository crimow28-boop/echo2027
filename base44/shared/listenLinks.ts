// Shared helpers for Echo-owned public listen links.
// Instead of sending clients a permanent public EXM URL, we send a link to the
// listenRecording function, which mints a fresh short-lived EXM signed URL on
// every visit. The link can be revoked by clearing the recording's listenToken.

// Cryptographically random 32-hex-char token.
export function randomListenToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Public URL of the listenRecording function for a given token.
export function listenUrl(appId, token) {
  return `https://base44.app/api/apps/${appId}/functions/listenRecording?t=${token}`;
}