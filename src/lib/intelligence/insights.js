// Business insight cards computed from the graph (works on demo or real data).
export function computeInsights(raw) {
  const { nodes, edges } = raw;
  const by = (type) => nodes.filter((n) => n.type === type);
  const count = (n) => edges.filter((e) => e.source === n.id || e.target === n.id).length;

  const topObjection = [...by("objection")].sort((a, b) => count(b) - count(a))[0];
  const openPromises = by("promise").filter((n) => n.status === "open");
  const growingTopic = [...by("topic")].sort((a, b) => (b.trend || 0) - (a.trend || 0))[0];
  const followupClients = by("client").filter((n) => n.followup);
  const bestHandling = [...by("handling")].sort((a, b) => (b.closes || 0) - (a.closes || 0))[0];

  const perTeam = new Map();
  openPromises.forEach((p) => (p.team || []).forEach((t) => perTeam.set(t, (perTeam.get(t) || 0) + 1)));
  const worstTeamId = [...perTeam.entries()].sort((a, b) => b[1] - a[1])[0];
  const worstTeam = worstTeamId ? nodes.find((n) => n.id === worstTeamId[0]) : null;

  const topProducts = [...by("product")].sort((a, b) => (b.calls?.length || 0) - (a.calls?.length || 0)).slice(0, 2);

  return [
    { id: "objection", title: "ההתנגדות הנפוצה ביותר", value: topObjection?.label || "—", note: topObjection ? `${count(topObjection)} קשרים בגרף` : "", nodeId: topObjection?.id },
    { id: "promises", title: "הבטחות פתוחות", value: String(openPromises.length), note: openPromises.map((p) => p.label).slice(0, 2).join(" • "), preset: "promises" },
    { id: "topic", title: "הנושא שגדל השבוע", value: growingTopic?.label || "—", note: growingTopic ? `הופיע ב-${growingTopic.calls?.length || 0} שיחות` : "", nodeId: growingTopic?.id },
    { id: "followup", title: "לקוחות שדורשים מעקב", value: String(followupClients.length), note: followupClients.map((c) => c.label).join(" • "), preset: "followup" },
    { id: "handling", title: "הטיפול שסוגר עסקאות", value: bestHandling?.label || "—", note: bestHandling ? `${bestHandling.closes || 0} עסקאות נסגרו` : "", nodeId: bestHandling?.id },
    { id: "team", title: "הבטחות שלא טופלו", value: worstTeam?.label || "—", note: worstTeamId ? `${worstTeamId[1]} הבטחות פתוחות` : "", nodeId: worstTeam?.id },
    { id: "products", title: "מוצרים מוזכרים בתדירות", value: topProducts[0]?.label || "—", note: topProducts.map((p) => `${p.label} (${p.calls?.length || 0})`).join(" • "), nodeId: topProducts[0]?.id }
  ];
}