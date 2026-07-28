// Parses a free-text, chat-style search request in Hebrew or English into
// structured search parts: a text/phone term plus an optional date range.
// Examples:
//   "תמצא לי את כל השיחות עם דנה לוי"
//   "תראה לי את כל ההקלטות מ-01/07/2026 עד 15/07/2026"
//   "שיחות מהיום"
//   "Hoe Number 17#"

const FILLER_WORDS = [
  "תמצא", "תמצאי", "מצא", "מצאי", "תחפש", "חפש", "תראה", "תראי", "הראה",
  "בבקשה", "לי", "את", "כל", "כול", "ה", "של", "עם", "שיחה", "שיחות",
  "השיחה", "השיחות", "הקלטה", "הקלטות", "ההקלטה", "ההקלטות", "רשומות",
  "לפי", "מספר", "טלפון", "מייל", "אימייל", "שם", "איש", "קשר", "בתאריך",
  "תאריך", "בין", "מתאריך", "עד", "מ", "ל", "בטווח", "בבין",
  "find", "show", "me", "all", "the", "calls", "call", "recordings",
  "recording", "with", "from", "to", "between", "for", "please", "search",
];

const FILLER_SET = new Set(FILLER_WORDS);

export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Parse a date written as DD/MM/YYYY, DD.MM.YY, DD-MM-YYYY or YYYY-MM-DD.
function parseDateToken(token) {
  const iso = token.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  const local = token.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (local) {
    let year = Number(local[3]);
    if (year < 100) year += 2000;
    return new Date(year, Number(local[2]) - 1, Number(local[1]));
  }
  return null;
}

// Relative date phrases, including common Hebrew prefixes ("מהיום", "מאתמול").
// Hebrew letters are not word characters in JS regex, so no \b anchors here.
const RELATIVE_RANGES = [
  { re: /(מה?|ב)?אתמול|yesterday/, days: [1, 1] },
  { re: /(מה?|ב)?היום|today/, days: [0, 0] },
  { re: /(מה?|ב)?שבוע(\s+האחרון|\s+שעבר)?|השבוע|last week|this week|past week/, days: [7, 0] },
  { re: /(מה?|ב)?חודש(\s+האחרון|\s+שעבר)?|החודש|last month|this month|past month/, days: [30, 0] },
];

function parseRelativeRange(text) {
  const now = new Date();
  for (const item of RELATIVE_RANGES) {
    const match = text.match(item.re);
    if (!match) continue;
    const fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - item.days[0]);
    const toDate = new Date(now);
    toDate.setDate(toDate.getDate() - item.days[1]);
    return { from: startOfDay(fromDate), to: endOfDay(toDate), matchedText: match[0] };
  }
  return null;
}

// Returns { text, digits, from, to } — `text` is the cleaned search subject.
export function parseSearchRequest(rawInput) {
  const raw = String(rawInput || "").trim();
  if (!raw) return { text: "", digits: "", from: null, to: null };

  let working = raw;
  let from = null;
  let to = null;

  // Explicit dates first (they are unambiguous).
  const dateTokens = working.match(/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2}/g) || [];
  const parsedDates = dateTokens.map(parseDateToken).filter(Boolean);
  if (parsedDates.length > 0) {
    parsedDates.sort((a, b) => a - b);
    from = startOfDay(parsedDates[0]);
    to = endOfDay(parsedDates[parsedDates.length - 1]);
    for (const token of dateTokens) working = working.split(token).join(" ");
  } else {
    const relative = parseRelativeRange(working);
    if (relative) {
      from = relative.from;
      to = relative.to;
      working = working.split(relative.matchedText).join(" ");
    }
  }

  // Remove conversational filler words, keeping the actual subject intact
  // (including punctuation such as "#" that belongs to the contact name).
  const words = working.split(/\s+/).filter(Boolean);
  const kept = words.filter((w) => {
    const bare = w.replace(/^[-־]+|[-־,.!?]+$/g, "");
    if (!bare) return false;
    return !FILLER_SET.has(bare.toLowerCase());
  });

  const text = kept.join(" ").trim();
  const digits = text.replace(/\D/g, "");
  // Kept as a fallback: some contact names contain words we treat as filler
  // (e.g. "חבר עם פרווה").
  const rawText = working.trim();

  return { text, rawText, digits, from, to };
}