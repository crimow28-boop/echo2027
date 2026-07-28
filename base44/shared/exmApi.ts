// Shared helpers for the exm.co.il call-history API.
// Used by syncRecordings and sendRecordingToClient.

const BASE = "https://www.exm.co.il/api/v1";

// POST /calls/ — list call history (newest first) with filtering + cursor pagination.
export async function listCalls(token, opts = {}) {
  const body = {};
  if (opts.from || opts.to) {
    body.time = {};
    if (opts.from) body.time.from = opts.from;
    if (opts.to) body.time.to = opts.to;
  }
  if (Array.isArray(opts.callTypes) && opts.callTypes.length) {
    body.call_types = opts.callTypes;
  }
  body.pagination = { items: opts.items || 100 };
  if (opts.next) body.pagination.next = opts.next;

  const res = await fetch(BASE + "/calls/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success === false) {
    throw new Error(data.error?.message || "exm API error");
  }
  return data; // { metadata: { next_page_token, ... }, calls: [...] }
}

// POST /calls/get-recording-urls/ — trade call ids for (signed) recording URLs.
// ttl: 0 = make public (permanent), 1..10 = signed URL valid for that many minutes.
export async function getRecordingUrls(token, ids, ttl = 10) {
  const res = await fetch(BASE + "/calls/get-recording-urls/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ ids, config: { ttl } })
  });
  const data = await res.json();
  if (data.success === false) {
    throw new Error(data.error?.message || "exm API error");
  }
  return data.urls || []; // [{ id, code, url }]
}

// Map an exm call object to our CallRecording entity shape.
// The "other party" (the client to send the recording to) is:
//   outgoing -> numbers.destination (the person we called)
//   incoming -> numbers.caller      (the person who called us)
export function mapCall(call) {
  const isOutgoing = String(call.type || "").startsWith("outgoing");
  const other = isOutgoing
    ? call.numbers?.destination
    : call.numbers?.caller;

  const offset = call.time?.gmt_offset || "+03:00";
  const start = call.time?.start; // "2026-07-28 15:44:37" (Asia/Jerusalem local)
  let callDate = null;
  if (start) {
    const d = new Date(start.replace(" ", "T") + offset);
    if (!isNaN(d.getTime())) callDate = d.toISOString();
  }

  // exm returns the contact name (from the phonebook) under call.contact.name
  // when the other party is a saved contact; otherwise contact is `false`.
  const contactName = call.contact && call.contact.name ? call.contact.name : null;
  const friendlyNumber = other?.friendly || other?.e164 || "";

  return {
    externalId: call.id,
    callerNumber: other?.e164 || "",
    callerFriendly: contactName || friendlyNumber,
    callType: isOutgoing ? "outgoing" : "incoming",
    duration: call.duration || 0,
    callDate
  };
}