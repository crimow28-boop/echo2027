import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { loadDemoGraph } from "@/lib/intelligence/demoGraph";
import { buildGraph, emptyFilters, PRESETS } from "@/lib/intelligence/graphFilters";
import { computeInsights } from "@/lib/intelligence/insights";
import InsightCards from "@/components/intelligence/InsightCards";
import PresetBar from "@/components/intelligence/PresetBar";
import GraphFilters from "@/components/intelligence/GraphFilters";
import GraphCanvas from "@/components/intelligence/GraphCanvas";
import NodeDetailsPanel from "@/components/intelligence/NodeDetailsPanel";
import EdgeExplainDialog from "@/components/intelligence/EdgeExplainDialog";

export default function EchoIntelligence() {
  const [raw, setRaw] = useState(() => loadDemoGraph());
  const [filters, setFilters] = useState(emptyFilters);
  const [preset, setPreset] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [edge, setEdge] = useState(null);

  const graph = useMemo(() => buildGraph(raw, filters), [raw, filters]);
  const insights = useMemo(() => computeInsights(raw), [raw]);
  const clients = raw.nodes.filter((n) => n.type === "client");
  const team = raw.nodes.filter((n) => n.type === "team");
  const selected = graph.nodes.find((n) => n.id === selectedId) || null;

  const applyPreset = (p) => {
    setPreset(p.id);
    setFilters({ ...emptyFilters, ...p.filters });
    setSelectedId(null);
  };

  const openInsight = (card) => {
    if (card.preset) {
      applyPreset(PRESETS.find((p) => p.id === card.preset));
      return;
    }
    if (card.nodeId) {
      setFilters(emptyFilters);
      setPreset("all");
      setSelectedId(card.nodeId);
    }
  };

  const renameNode = (id, label) =>
    setRaw((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === id ? { ...n, label } : n)) }));

  const deleteNode = (id) => {
    setRaw((g) => ({
      ...g,
      nodes: g.nodes.filter((n) => n.id !== id),
      edges: g.edges.filter((e) => e.source !== id && e.target !== id)
    }));
    setSelectedId(null);
  };

  const approveNode = (id) =>
    setRaw((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === id ? { ...n, verify: false, approved: true } : n)) }));

  // Merge: fold `id` into `intoId`, moving its edges and keeping its label as an alias.
  const mergeNodes = (id, intoId) => {
    setRaw((g) => {
      const from = g.nodes.find((n) => n.id === id);
      const nodes = g.nodes
        .filter((n) => n.id !== id)
        .map((n) =>
          n.id === intoId
            ? {
                ...n,
                aliases: [...new Set([...(n.aliases || []), ...(from?.aliases || []), from?.label].filter(Boolean))],
                calls: [...new Set([...(n.calls || []), ...(from?.calls || [])])]
              }
            : n
        );
      const seen = new Set();
      const edges = g.edges
        .map((e) => ({
          ...e,
          source: e.source === id ? intoId : e.source,
          target: e.target === id ? intoId : e.target
        }))
        .filter((e) => {
          const key = `${e.source}->${e.target}->${e.label}`;
          if (e.source === e.target || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      return { ...g, nodes, edges };
    });
    setSelectedId(intoId);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-grid text-foreground font-body">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Echo Intelligence</h1>
              <p className="text-xs text-muted-foreground">המוח החזותי של העסק — קשרים בין שיחות, לקוחות, התנגדויות ותוצאות</p>
            </div>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-accent">
            <ArrowRight className="w-3.5 h-3.5" /> חזרה
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          <InsightCards insights={insights} onOpen={openInsight} />
          <PresetBar active={preset} onSelect={applyPreset} />
          <GraphFilters
            filters={filters}
            setFilters={(fn) => { setPreset("custom"); setFilters(fn); }}
            clients={clients}
            team={team}
            onReset={() => applyPreset(PRESETS[0])}
          />
          <p className="text-[11px] text-muted-foreground">
            {graph.nodes.length} ישויות • {graph.edges.length} קשרים • נתוני דמו להמחשה, מוכנים להתחברות לתמלולים האמיתיים
          </p>
          <GraphCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            degree={graph.degree}
            selectedId={selectedId}
            onSelectNode={(n) => setSelectedId(n.id === selectedId ? null : n.id)}
            onSelectEdge={setEdge}
          />
        </div>
      </div>

      <NodeDetailsPanel
        node={selected}
        graph={raw}
        onClose={() => setSelectedId(null)}
        onRename={renameNode}
        onDelete={deleteNode}
        onApprove={approveNode}
        onMerge={mergeNodes}
      />
      <EdgeExplainDialog edge={edge} graph={raw} onClose={() => setEdge(null)} />
    </div>
  );
}