export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const DEFAULT_FILTERS = {
  search: "",
};

export const PAGE_SIZE = 50;

export function buildQuery(filters) {
  const query = {};
  if (filters.search) {
    // Normalize the search term to match the stored e164 format (+972...).
    // Israeli local numbers start with 0 (e.g. 052-712-3456); the e164 form
    // drops that 0 (972527123456). Convert so partial lookups match.
    const digits = String(filters.search).replace(/\D/g, "");
    let normalized = digits;
    if (normalized.startsWith("0")) {
      normalized = "972" + normalized.slice(1);
    } else if (normalized.startsWith("972")) {
      // already international, keep as-is
    }
    query.callerNumber = { $regex: normalized, $options: "i" };
  }
  return query;
}