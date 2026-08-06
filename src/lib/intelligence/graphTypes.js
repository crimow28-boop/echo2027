// Entity types of the Echo Intelligence knowledge graph.
// Colors are literal Tailwind classes so the build keeps them.
export const NODE_TYPES = {
  client: { label: "לקוח / ליד", dot: "bg-sky-500", ring: "ring-sky-400", text: "text-sky-600", hex: "#0ea5e9" },
  call: { label: "שיחה", dot: "bg-slate-500", ring: "ring-slate-400", text: "text-slate-600", hex: "#64748b" },
  topic: { label: "נושא", dot: "bg-violet-500", ring: "ring-violet-400", text: "text-violet-600", hex: "#8b5cf6" },
  need: { label: "צורך", dot: "bg-teal-500", ring: "ring-teal-400", text: "text-teal-600", hex: "#14b8a6" },
  pain: { label: "כאב / בעיה", dot: "bg-orange-500", ring: "ring-orange-400", text: "text-orange-600", hex: "#f97316" },
  objection: { label: "התנגדות", dot: "bg-rose-500", ring: "ring-rose-400", text: "text-rose-600", hex: "#f43f5e" },
  handling: { label: "טיפול בהתנגדות", dot: "bg-emerald-500", ring: "ring-emerald-400", text: "text-emerald-600", hex: "#10b981" },
  promise: { label: "הבטחה", dot: "bg-amber-500", ring: "ring-amber-400", text: "text-amber-600", hex: "#f59e0b" },
  task: { label: "משימת המשך", dot: "bg-yellow-500", ring: "ring-yellow-400", text: "text-yellow-600", hex: "#eab308" },
  product: { label: "מוצר / שירות", dot: "bg-indigo-500", ring: "ring-indigo-400", text: "text-indigo-600", hex: "#6366f1" },
  price: { label: "מחיר / הצעה", dot: "bg-lime-600", ring: "ring-lime-400", text: "text-lime-700", hex: "#65a30d" },
  competitor: { label: "מתחרה", dot: "bg-fuchsia-500", ring: "ring-fuchsia-400", text: "text-fuchsia-600", hex: "#d946ef" },
  team: { label: "איש צוות", dot: "bg-blue-600", ring: "ring-blue-400", text: "text-blue-700", hex: "#2563eb" },
  outcome: { label: "תוצאה", dot: "bg-cyan-600", ring: "ring-cyan-400", text: "text-cyan-700", hex: "#0891b2" }
};

export const typeLabel = (t) => NODE_TYPES[t]?.label || t;
export const typeHex = (t) => NODE_TYPES[t]?.hex || "#94a3b8";