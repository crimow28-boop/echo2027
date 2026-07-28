// Build a Hebrew-friendly CSV (with BOM so Excel reads it correctly) from
// exported recording rows and trigger a browser download.
export function downloadRecordingsCsv(rows) {
  const headers = [
    "תאריך",
    "שם איש קשר",
    "מספר",
    "סוג",
    "משך (שניות)",
    "סטטוס",
    "קישור להקלטה"
  ];

  const escape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.date ? new Date(r.date).toLocaleString("he-IL") : "",
        r.name,
        r.number,
        r.type,
        r.duration,
        r.sent,
        r.link
      ]
        .map(escape)
        .join(",")
    );
  }

  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `הקלטות_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}