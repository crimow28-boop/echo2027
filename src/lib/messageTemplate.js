// Builds the client-facing WhatsApp messages. {{link}} is replaced by the
// recording link on the server, where the permanent URL is generated.
export const LINK_TOKEN = "{{link}}";

export const DEFAULT_TEMPLATE = [
  `שלום,`,
  `להלן הקישור להקלטת השיחה שהתקיימה עם נציג/ת {{business}}:`,
  LINK_TOKEN,
  ``,
  `📅 תאריך השיחה: {{date}}`,
  `🕒 שעת השיחה: {{time}}`,
  `⏱️ משך השיחה: {{duration}}`,
  ``,
  `הקישור נשמר ללא מגבלת זמן — מומלץ לשמור אותו לצורך עיון עתידי.`,
  ``,
  `לכל שאלה או בקשה נוספת, ניתן להשיב להודעה זו.`,
  ``,
  `בברכה,`,
  `{{business}}`
].join("\n");

export const DEFAULT_MISSED_TEMPLATE = [
  `שלום,`,
  `ראינו שהתקשרת ({{date}}, {{time}}) ולא הצלחנו לענות.`,
  `נחזור אליך בהקדם — אפשר גם להשיב להודעה זו ונטפל בפנייה.`,
  ``,
  `בברכה,`,
  `{{business}}`
].join("\n");

export const DEFAULT_NO_ANSWER_TEMPLATE = [
  `שלום,`,
  `ניסינו להשיג אותך בטלפון ({{date}}, {{time}}) ולא הצלחנו.`,
  `נשמח שתחזור אלינו בהזדמנות הראשונה, או פשוט להשיב להודעה זו.`,
  ``,
  `בברכה,`,
  `{{business}}`
].join("\n");

const BASE_TOKENS = [
  { token: "{{business}}", label: "שם העסק" },
  { token: "{{date}}", label: "תאריך השיחה" },
  { token: "{{time}}", label: "שעת השיחה" }
];

export const TEMPLATE_TOKENS = [
  { token: LINK_TOKEN, label: "קישור להקלטה" },
  ...BASE_TOKENS,
  { token: "{{duration}}", label: "משך השיחה" }
];

export const MESSAGE_KINDS = [
  {
    id: "recording",
    label: "הקלטת שיחה",
    description: "נשלחת כשיש הקלטה — כולל הקישור לשמיעה",
    defaultBody: DEFAULT_TEMPLATE,
    tokens: TEMPLATE_TOKENS,
    sample: { callDate: new Date().toISOString(), duration: 95 }
  },
  {
    id: "missed",
    label: "לא עניתי ללקוח",
    description: "הלקוח התקשר ולא נענה — בלי קישור להקלטה",
    defaultBody: DEFAULT_MISSED_TEMPLATE,
    tokens: BASE_TOKENS,
    sample: { callDate: new Date().toISOString(), duration: 0, callType: "incoming" }
  },
  {
    id: "no_answer",
    label: "הלקוח לא ענה לי",
    description: "התקשרתי ללקוח והוא לא ענה — בלי קישור להקלטה",
    defaultBody: DEFAULT_NO_ANSWER_TEMPLATE,
    tokens: BASE_TOKENS,
    sample: { callDate: new Date().toISOString(), duration: 0, callType: "outgoing" }
  }
];

// Calls with 0 seconds were never answered — no recording exists.
export function isMissedCall(recording) {
  return !Number(recording?.duration);
}

export function messageKindFor(recording) {
  if (!isMissedCall(recording)) return "recording";
  return recording?.callType === "outgoing" ? "no_answer" : "missed";
}

export function fillTemplate(recording, businessName, template) {
  const biz = businessName || "העסק שלנו";
  const d = recording?.callDate ? new Date(recording.callDate) : null;
  const dateStr = d ? d.toLocaleDateString("he-IL") : "—";
  const timeStr = d ? d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "—";
  const secs = Number(recording?.duration) || 0;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  const durationStr = mins > 0 ? `${mins} דקות ו-${rem} שניות` : `${rem} שניות`;

  return String(template || "")
    .replaceAll("{{business}}", biz)
    .replaceAll("{{date}}", dateStr)
    .replaceAll("{{time}}", timeStr)
    .replaceAll("{{duration}}", durationStr);
}

// templates: { recording?: string, missed?: string }
export function buildRecordingMessage(recording, businessName, templates) {
  if (!recording) return "";
  const kind = messageKindFor(recording);
  const custom = typeof templates === "string" ? templates : templates?.[kind];
  const fallback = MESSAGE_KINDS.find((k) => k.id === kind).defaultBody;
  return fillTemplate(recording, businessName, custom || fallback);
}

export async function loadTemplates(base44) {
  const rows = await base44.entities.MessageTemplate.list("-updated_date", 50).catch(() => []);
  const map = {};
  (rows || []).forEach((row) => {
    const kind = row.kind || "recording";
    if (!map[kind]) map[kind] = row;
  });
  return map;
}