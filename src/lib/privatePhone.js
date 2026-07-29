// Normalize a phone number so the same contact matches across formats.
export function normalizePrivatePhone(num) {
  if (!num) return "";
  let n = String(num).replace(/\D/g, "");
  if (n.startsWith("0")) n = "972" + n.slice(1);
  return n;
}