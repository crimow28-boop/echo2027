// Turns anything a server/SDK may reject with (string, object, array of
// validation objects) into a single readable sentence for the UI.
export function errorText(value, fallback = "משהו לא עבד, נסו שוב") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const parts = value.map((v) => errorText(v, "")).filter(Boolean);
    return parts.length ? parts.join(", ") : fallback;
  }
  if (typeof value === "object") {
    return (
      errorText(value.message, "") ||
      errorText(value.description, "") ||
      errorText(value.error, "") ||
      errorText(value.detail, "") ||
      errorText(value.msg, "") ||
      fallback
    );
  }
  return fallback;
}