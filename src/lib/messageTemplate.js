// Builds the client-facing WhatsApp message. {{link}} is replaced by the
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

export const TEMPLATE_TOKENS = [
  { token: "{{link}}", label: "קישור להקלטה" },
  { token: "{{business}}", label: "שם העסק" },
  { token: "{{date}}", label: "תאריך השיחה" },
  { token: "{{time}}", label: "שעת השיחה" },
  { token: "{{duration}}", label: "משך השיחה" }
];

export function buildRecordingMessage(recording, businessName, template) {
  if (!recording) return "";
  const biz = businessName || "העסק שלנו";
  const d = recording.callDate ? new Date(recording.callDate) : null;
  const dateStr = d ? d.toLocaleDateString("he-IL") : "—";
  const timeStr = d ? d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "—";
  const secs = typeof recording.duration === "number" ? recording.duration : 0;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  const durationStr = mins > 0 ? `${mins} דקות ו-${rem} שניות` : `${rem} שניות`;

  return (template || DEFAULT_TEMPLATE)
    .replaceAll("{{business}}", biz)
    .replaceAll("{{date}}", dateStr)
    .replaceAll("{{time}}", timeStr)
    .replaceAll("{{duration}}", durationStr);
}