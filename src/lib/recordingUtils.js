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

export function defaultFromDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().split("T")[0];
}

export const DEFAULT_FILTERS = {
  search: "",
  callType: "all",
  sent: "all",
  fromDate: defaultFromDate(),
  toDate: "",
};

export const PAGE_SIZE = 50;

export function buildQuery(filters) {
  const query = {};
  const dateFilter = {};
  if (filters.fromDate) {
    const d = new Date(filters.fromDate + "T00:00:00");
    if (!isNaN(d.getTime())) dateFilter.$gte = d.toISOString();
  }
  if (filters.toDate) {
    const d = new Date(filters.toDate + "T23:59:59");
    if (!isNaN(d.getTime())) dateFilter.$lte = d.toISOString();
  }
  if (Object.keys(dateFilter).length) query.callDate = dateFilter;
  if (filters.callType && filters.callType !== "all") query.callType = filters.callType;
  if (filters.sent === "sent") query.sent = true;
  if (filters.sent === "pending") query.sent = false;
  if (filters.search) {
    const re = { $regex: filters.search, $options: "i" };
    query.$or = [{ callerFriendly: re }, { callerNumber: re }];
  }
  return query;
}