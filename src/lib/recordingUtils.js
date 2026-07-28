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

// Build a database query from a free-text search term.
// The term can be a phone number (normalized to e164) or a contact name.
export function buildQuery(filters) {
  const query = {};
  if (!filters.search) return query;

  const term = String(filters.search).trim();
  if (!term) return query;

  const digits = term.replace(/\D/g, "");
  const namePart = term.replace(/\d/g, "").trim();
  const conditions = [];

  // Phone branch: normalize Israeli local numbers to e164 (drop leading 0).
  if (digits.length >= 3) {
    let normalized = digits;
    if (normalized.startsWith("0")) {
      normalized = "972" + normalized.slice(1);
    }
    conditions.push({ callerNumber: { $regex: normalized, $options: "i" } });
  }

  // Contact name branch: match against the stored friendly name.
  if (namePart.length >= 2) {
    conditions.push({ callerFriendly: { $regex: namePart, $options: "i" } });
  }

  if (conditions.length === 0) {
    // Fallback: only digits/short term — match the raw term anywhere.
    query.callerNumber = { $regex: digits || term, $options: "i" };
  } else if (conditions.length === 1) {
    Object.assign(query, conditions[0]);
  } else {
    query.$or = conditions;
  }

  return query;
}

// Example suggestions shown under the search bar to guide users.
export const SEARCH_SUGGESTIONS = [
  { label: "050-712-3456", hint: "מספר טלפון" },
  { label: "דני כהן", hint: "איש קשר" },
  { label: "052-880-1122", hint: "מספר נוסף" },
];