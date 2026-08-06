// Turns the raw graph + filter state into the visible sub-graph.

export const PRESETS = [
  { id: "all", label: "כל מפת העסק", filters: {} },
  { id: "objections", label: "התנגדויות נפוצות", filters: { types: ["objection", "handling", "client", "outcome"] } },
  { id: "promises", label: "הבטחות פתוחות", filters: { types: ["promise", "client", "team", "call"], openPromises: true } },
  { id: "topics", label: "נושאים שחוזרים", filters: { types: ["topic", "call", "client"] } },
  { id: "followup", label: "לקוחות שדורשים מעקב", filters: { types: ["client", "task", "call", "outcome"], followup: true } },
  { id: "closers", label: "מה עוזר לסגור עסקאות", filters: { types: ["handling", "objection", "outcome", "team"] } },
  { id: "tasks", label: "משימות שלא בוצעו", filters: { types: ["task", "client", "team", "call"], openTasks: true } },
  { id: "products", label: "מוצרים ומחירים", filters: { types: ["product", "price", "client", "competitor"] } }
];

export const emptyFilters = {
  q: "",
  from: "",
  to: "",
  client: "",
  team: "",
  direction: "",
  kind: "",
  types: [],
  openPromises: false,
  openTasks: false,
  followup: false,
  outcome: "",
  merged: true
};

function expandAliases(nodes, edges) {
  const extraNodes = [];
  const extraEdges = [];
  for (const n of nodes) {
    (n.aliases || []).forEach((alias, i) => {
      const id = `${n.id}__alias${i}`;
      extraNodes.push({ ...n, id, label: alias, aliases: undefined, summary: `נוסח מקורי מהתמלול (אוחד תחת "${n.label}")` });
      extraEdges.push({ id: `${id}->${n.id}`, source: id, target: n.id, label: "אוחד תחת", reason: `הניסוח "${alias}" זוהה כווריאציה של ההתנגדות "${n.label}".`, calls: n.calls || [] });
    });
  }
  return { nodes: [...nodes, ...extraNodes], edges: [...edges, ...extraEdges] };
}

export function buildGraph(raw, filters) {
  const f = { ...emptyFilters, ...filters };
  let { nodes, edges, calls } = raw;
  if (!f.merged) ({ nodes, edges } = expandAliases(nodes, edges));

  const visibleCalls = new Set(
    calls
      .filter((c) => (!f.from || c.date >= f.from) && (!f.to || c.date <= f.to))
      .filter((c) => !f.client || c.client === f.client)
      .filter((c) => !f.team || c.team === f.team)
      .filter((c) => !f.direction || c.direction === f.direction)
      .filter((c) => !f.kind || c.kind === f.kind)
      .filter((c) => !f.outcome || c.outcome === f.outcome)
      .map((c) => c.id)
  );

  const q = f.q.trim();
  let kept = nodes.filter((n) => {
    if (n.calls?.length && !n.calls.some((id) => visibleCalls.has(id))) return false;
    if (f.types.length && !f.types.includes(n.type)) return false;
    if (f.openPromises && n.type === "promise" && n.status !== "open") return false;
    if (f.openTasks && n.type === "task" && n.status !== "open") return false;
    if (f.followup && n.type === "client" && !n.followup) return false;
    if (q) {
      const hay = [n.label, n.summary, ...(n.aliases || [])].join(" ");
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const ids = new Set(kept.map((n) => n.id));
  const visibleEdges = edges.filter((e) => ids.has(e.source) && ids.has(e.target));

  const degree = new Map();
  visibleEdges.forEach((e) => {
    degree.set(e.source, (degree.get(e.source) || 0) + 1);
    degree.set(e.target, (degree.get(e.target) || 0) + 1);
  });

  return { nodes: kept, edges: visibleEdges, degree };
}