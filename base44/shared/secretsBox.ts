// AES-GCM encryption-at-rest for sensitive UserSettings fields.
// The master key is SETTINGS_ENC_KEY (any long random string); the actual AES
// key is its SHA-256 digest. Encrypted values look like "enc1:<iv>:<ciphertext>".
// decryptSecret passes legacy plaintext values through unchanged.

const PREFIX = "enc1:";

// Fields on UserSettings that must never be stored in plaintext.
export const SECRET_FIELDS = ["exmToken", "greenToken", "loginPassword"];

let keyPromise = null;
function getKey() {
  if (!keyPromise) {
    keyPromise = (async () => {
      const raw = Deno.env.get("SETTINGS_ENC_KEY") || "";
      if (!raw) throw new Error("SETTINGS_ENC_KEY is not configured");
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
      return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
    })();
  }
  return keyPromise;
}

const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function encryptSecret(value) {
  if (!value || String(value).startsWith(PREFIX)) return value;
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(String(value)));
  return `${PREFIX}${toB64(iv)}:${toB64(ct)}`;
}

export async function decryptSecret(value) {
  if (!value || !String(value).startsWith(PREFIX)) return value;
  const [ivB64, ctB64] = String(value).slice(PREFIX.length).split(":");
  const key = await getKey();
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(ivB64) }, key, fromB64(ctB64));
  return new TextDecoder().decode(pt);
}

// Encrypt any secret fields present in a data object (before writing to DB).
export async function encryptSettingsFields(data) {
  const out = { ...data };
  for (const f of SECRET_FIELDS) {
    if (out[f]) out[f] = await encryptSecret(out[f]);
  }
  return out;
}

// Decrypt the secret fields of a UserSettings row (after reading from DB).
export async function decryptSettingsRow(row) {
  if (!row) return row;
  const out = { ...row };
  for (const f of SECRET_FIELDS) {
    if (out[f]) out[f] = await decryptSecret(out[f]);
  }
  return out;
}