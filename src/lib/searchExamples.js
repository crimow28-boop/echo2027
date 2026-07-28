// Builds chat-style search examples from real recordings, so every suggestion
// shown to the user is guaranteed to return results.
import { formatPhoneDisplay } from "@/lib/recordingUtils";

function dayStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ddmmyyyy(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function buildSearchExamples(rows) {
  const list = (rows || []).filter((r) => r.callDate);
  if (list.length === 0) return [];

  const examples = [];
  const now = new Date();
  const today = dayStart(now);
  const weekAgo = dayStart(new Date(now.getTime() - 7 * 86400000));
  const monthAgo = dayStart(new Date(now.getTime() - 30 * 86400000));

  const dates = list.map((r) => new Date(r.callDate));
  if (dates.some((d) => d >= today)) examples.push("שיחות מהיום");
  else if (dates.some((d) => d >= weekAgo)) examples.push("שיחות מהשבוע האחרון");
  else if (dates.some((d) => d >= monthAgo)) examples.push("שיחות מהחודש האחרון");

  const named = list.find((r) => (r.callerFriendly || "").trim());
  if (named) examples.push(`תמצא לי את כל השיחות עם ${named.callerFriendly.trim()}`);

  const numbered = list.find((r) => (r.callerNumber || "").trim());
  if (numbered) examples.push(`שיחות מהמספר ${formatPhoneDisplay(numbered.callerNumber.trim())}`);

  const latest = dates.sort((a, b) => b - a)[0];
  if (latest) examples.push(`הקלטות מ-${ddmmyyyy(latest)}`);

  return examples.slice(0, 4);
}