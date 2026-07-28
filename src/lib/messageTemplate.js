// Builds the client-facing WhatsApp message. {{link}} is replaced by the
// recording link on the server, where the permanent URL is generated.
export const LINK_TOKEN = "{{link}}";

export function buildRecordingMessage(recording, businessName) {
  if (!recording) return "";
  const biz = businessName || "העסק שלנו";
  const d = recording.callDate ? new Date(recording.callDate) : null;
  const dateStr = d ? d.toLocaleDateString("he-IL") : "—";
  const timeStr = d ? d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "—";
  const secs = typeof recording.duration === "number" ? recording.duration : 0;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  const durationStr = mins > 0 ? `${mins} דקות ו-${rem} שניות` : `${rem} שניות`;

  return [
    `שלום,`,
    `להלן הקישור להקלטת השיחה שהתקיימה עם נציג/ת ${biz}:`,
    LINK_TOKEN,
    ``,
    `📅 תאריך השיחה: ${dateStr}`,
    `🕒 שעת השיחה: ${timeStr}`,
    `⏱️ משך השיחה: ${durationStr}`,
    ``,
    `הקישור נשמר ללא מגבלת זמן — מומלץ לשמור אותו לצורך עיון עתידי.`,
    ``,
    `לכל שאלה או בקשה נוספת, ניתן להשיב להודעה זו.`,
    ``,
    `בברכה,`,
    `${biz}`
  ].join("\n");
}