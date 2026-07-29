import { parseSearchRequest, escapeRegex } from "@/lib/searchParser";

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

// A contact name is only a real name when it isn't just the phone number.
export function displayContactName(recording) {
  const name = (recording?.callerFriendly || "").trim();
  if (!name) return "ללא שם";
  const digitsOnly = name.replace(/[^\d]/g, "");
  if (digitsOnly.length >= 7 && digitsOnly.length === name.replace(/[\s\-+()]/g, "").length) return "ללא שם";
  return name;
}

export const DEFAULT_FILTERS = {
  search: "",
};

export const PAGE_SIZE = 50;

// Build a database query from a chat-style, free-text search request.
// Supports contact names (exactly as saved, punctuation included), phone
// numbers, and date ranges written in plain language.
export function buildQuery(filters) {
  const query = {};
  const parsed = parseSearchRequest(filters.search);
  const { text, rawText, digits, from, to } = parsed;

  if (from || to) {
    query.callDate = {};
    if (from) query.callDate.$gte = from.toISOString();
    if (to) query.callDate.$lte = to.toISOString();
  }

  if (text) {
    const conditions = [];

    // Contact name: match the subject exactly as typed, including characters
    // like "#" that are part of the saved contact name.
    if (text.replace(/\s/g, "").length >= 2) {
      conditions.push({ callerFriendly: { $regex: escapeRegex(text), $options: "i" } });
    }

    // Fallback for names that contain words we strip as conversational filler.
    if (rawText && rawText !== text && rawText.replace(/\s/g, "").length >= 2) {
      conditions.push({ callerFriendly: { $regex: escapeRegex(rawText), $options: "i" } });
    }

    // Phone: normalize Israeli local numbers to e164 (drop the leading 0).
    if (digits.length >= 3) {
      const normalized = digits.startsWith("0") ? "972" + digits.slice(1) : digits;
      conditions.push({ callerNumber: { $regex: normalized, $options: "i" } });
      conditions.push({ callerNumber: { $regex: digits, $options: "i" } });
    }

    if (conditions.length === 1) {
      Object.assign(query, conditions[0]);
    } else if (conditions.length > 1) {
      query.$or = conditions;
    }
  }

  return query;
}

// Example suggestions shown under the search bar to guide users.
export const SEARCH_SUGGESTIONS = [
  { label: "דנה לוי", hint: "שם איש קשר" },
  { label: "050-123-4567", hint: "מספר טלפון" },
];

// Chat-style example requests shown under the search bar.
export const SEARCH_EXAMPLES = [
  "תמצא לי את כל השיחות עם דנה לוי",
  "תראה לי את כל ההקלטות מ-01/07/2026 עד 15/07/2026",
  "כל השיחות מהיום",
  "052-633-1295",
];