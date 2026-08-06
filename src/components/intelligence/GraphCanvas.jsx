import React, { useRef, useState } from "react";
import useForceGraph from "@/hooks/useForceGraph";
import { typeHex } from "@/lib/intelligence/graphTypes";
import GraphTooltip from "./GraphTooltip";

const W = 1000;
const H = 640;

export default function GraphCanvas({ nodes, edges, degree, selectedId, onSelectNode, onSelectEdge }) {
  const svgRef = useRef(null);
  const { positions, startDrag, dragTo, endDrag } = useForceGraph(nodes, edges, { width: W, height: H });
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState(null);
  const drag = useRef(null);

  const toLocal = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    return { x: (sx - view.x) / view.k, y: (sy - view.y) / view.k };
  };

  const onMove = (e) => {
    if (!drag.current) return;
    const p = toLocal(e);
    if (drag.current.type === "node") {
      dragTo(drag.current.id, p.x, p.y);
      return;
    }
    const dx = e.clientX - drag.current.cx;
    const dy = e.clientY - drag.current.cy;
    drag.current.cx = e.clientX;
    drag.current.cy = e.clientY;
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const stopDrag = () => { drag.current = null; endDrag(); };

  const zoom = (dir) => setView((v) => ({ ...v, k: Math.min(2.4, Math.max(0.4, v.k * (dir > 0 ? 1.2 : 1 / 1.2))) }));

  const radius = (id) => 7 + Math.min(16, (degree.get(id) || 1) * 1.8);
  const neighbors = new Set();
  if (selectedId) {
    edges.forEach((e) => {
      if (e.source === selectedId) neighbors.add(e.target);
      if (e.target === selectedId) neighbors.add(e.source);
    });
  }

  return (
    <div className="relative rounded-3xl border border-border bg-card overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[520px] sm:h-[640px] touch-none cursor-grab"
        onMouseMove={onMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onWheel={(e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1 : -1); }}
        onMouseDown={(e) => { drag.current = { type: "pan", cx: e.clientX, cy: e.clientY }; }}
      >
        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {edges.map((e) => {
            const a = positions.get(e.source);
            const b = positions.get(e.target);
            if (!a || !b) return null;
            const active = selectedId && (e.source === selectedId || e.target === selectedId);
            return (
              <line
                key={e.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active ? "#0f766e" : "#94a3b8"}
                strokeWidth={active ? 2 : 1}
                strokeOpacity={selectedId ? (active ? 0.9 : 0.15) : 0.35}
                className="cursor-pointer"
                onMouseDown={(ev) => ev.stopPropagation()}
                onClick={(ev) => { ev.stopPropagation(); onSelectEdge(e); }}
              />
            );
          })}
          {nodes.map((n) => {
            const p = positions.get(n.id);
            if (!p) return null;
            const dim = selectedId && n.id !== selectedId && !neighbors.has(n.id);
            const r = radius(n.id);
            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                opacity={dim ? 0.22 : 1}
                className="cursor-pointer"
                onMouseDown={(ev) => { ev.stopPropagation(); drag.current = { type: "node", id: n.id }; startDrag(n.id); }}
                onMouseUp={stopDrag}
                onClick={(ev) => { ev.stopPropagation(); onSelectNode(n); }}
                onMouseEnter={() => setHover({ node: n, x: p.x * view.k + view.x, y: p.y * view.k + view.y })}
                onMouseLeave={() => setHover(null)}
              >
                <circle r={r} fill={typeHex(n.type)} fillOpacity={0.9} stroke={n.id === selectedId ? "#0f766e" : "#ffffff"} strokeWidth={n.id === selectedId ? 3 : 1.5} />
                <text y={r + 13} textAnchor="middle" className="fill-foreground" style={{ fontSize: 11 }}>
                  {n.label.length > 22 ? n.label.slice(0, 22) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hover && <GraphTooltip node={hover.node} x={(hover.x / W) * 100} y={(hover.y / H) * 100} />}

      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <button onClick={() => zoom(1)} className="w-9 h-9 rounded-full bg-card border border-border text-sm shadow-sm">+</button>
        <button onClick={() => zoom(-1)} className="w-9 h-9 rounded-full bg-card border border-border text-sm shadow-sm">−</button>
        <button onClick={() => setView({ x: 0, y: 0, k: 1 })} className="w-9 h-9 rounded-full bg-card border border-border text-[10px] shadow-sm">איפוס</button>
      </div>
    </div>
  );
}