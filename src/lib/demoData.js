// Sample recordings used only by the public interactive demo.
const day = (offsetDays, hh, mm) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};

export const DEMO_RECORDINGS = [
  { id: "d1", callerFriendly: "משה כהן", callerNumber: "0528841203", duration: 134, callDate: day(0, 14, 32) },
  { id: "d2", callerFriendly: "דנה לוי", callerNumber: "0547712098", duration: 48, callDate: day(0, 11, 5) },
  { id: "d3", callerFriendly: "מוסך אלון", callerNumber: "036541122", duration: 337, callDate: day(1, 17, 49) },
  { id: "d4", callerFriendly: "יעל אברהם", callerNumber: "0501122984", duration: 92, callDate: day(1, 9, 15) },
  { id: "d5", callerFriendly: "מרפאת שיניים ניר", callerNumber: "089445610", duration: 211, callDate: day(2, 16, 3) },
  { id: "d6", callerFriendly: "אבי מזרחי", callerNumber: "0533398471", duration: 65, callDate: day(2, 10, 27) },
  { id: "d7", callerFriendly: "רונית שגב", callerNumber: "0526640913", duration: 178, callDate: day(3, 13, 41) },
  { id: "d8", callerFriendly: "משה כהן", callerNumber: "0528841203", duration: 39, callDate: day(4, 8, 52) },
  { id: "d9", callerFriendly: "חשמלייה סנטר", callerNumber: "046778120", duration: 256, callDate: day(5, 15, 18) },
  { id: "d10", callerFriendly: "טל ברקוביץ'", callerNumber: "0585512740", duration: 121, callDate: day(6, 12, 9) }
];

export const DEMO_SUGGESTIONS = ["משה כהן", "052", "מוסך"];

export function filterDemoRecordings(search) {
  const term = (search || "").trim().toLowerCase();
  if (!term) return DEMO_RECORDINGS;
  return DEMO_RECORDINGS.filter((r) => {
    const date = new Date(r.callDate);
    const dateText = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
    return (
      r.callerFriendly.toLowerCase().includes(term) ||
      r.callerNumber.includes(term.replace(/\D/g, "") || "\u0000") ||
      dateText.includes(term)
    );
  });
}