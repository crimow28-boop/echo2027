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

// Format a stored Israeli phone number for display: 972... -> 0..., grouped XXX-XXX-XXXX.
export function formatPhoneDisplay(num) {
  if (!num) return "";
  let n = String(num).replace(/\D/g, "");
  if (n.startsWith("972")) n = "0" + n.slice(3);
  if (n.length === 10 && n.startsWith("0")) {
    return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  }
  return String(num);
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
  { label: "דנה לוי", hint: "שם איש קשר" },
  { label: "050-123-4567", hint: "מספר טלפון" },
];