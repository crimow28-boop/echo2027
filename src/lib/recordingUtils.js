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

export const DEFAULT_FILTERS = {
  search: "",
};

export const PAGE_SIZE = 50;

export function buildQuery(filters) {
  const query = {};
  if (filters.search) {
    query.callerNumber = { $regex: filters.search, $options: "i" };
  }
  return query;
}