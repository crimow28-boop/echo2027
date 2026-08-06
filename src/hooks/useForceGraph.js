import { useEffect, useRef, useState } from "react";

// Minimal force-directed layout (repulsion + spring edges + centering).
// Returns live positions and a dragging API for the SVG canvas.
export default function useForceGraph(nodes, edges, { width = 900, height = 600 } = {}) {
  const posRef = useRef(new Map());
  const dragRef = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const pos = posRef.current;
    const ids = new Set(nodes.map((n) => n.id));
    for (const id of [...pos.keys()]) if (!ids.has(id)) pos.delete(id);
    nodes.forEach((n, i) => {
      if (!pos.has(n.id)) {
        const a = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
        const r = 120 + (i % 7) * 30;
        pos.set(n.id, { x: width / 2 + Math.cos(a) * r, y: height / 2 + Math.sin(a) * r, vx: 0, vy: 0 });
      }
    });

    let frame;
    let alpha = 1;
    const step = () => {
      const list = nodes.map((n) => ({ n, p: pos.get(n.id) })).filter((o) => o.p);
      // repulsion
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i].p;
          const b = list[j].p;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy || 0.01;
          if (d2 > 90000) continue;
          const f = 2600 / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
        }
      }
      // springs
      for (const e of edges) {
        const a = pos.get(e.source);
        const b = pos.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - 130) * 0.012;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      // centering + integrate
      for (const { n, p } of list) {
        p.vx += (width / 2 - p.x) * 0.0016;
        p.vy += (height / 2 - p.y) * 0.0016;
        if (dragRef.current === n.id) { p.vx = 0; p.vy = 0; continue; }
        p.vx *= 0.86; p.vy *= 0.86;
        p.x += p.vx * alpha;
        p.y += p.vy * alpha;
      }
      alpha = Math.max(0.25, alpha * 0.999);
      setTick((t) => t + 1);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [nodes, edges, width, height]);

  return {
    positions: posRef.current,
    tick,
    startDrag: (id) => { dragRef.current = id; },
    dragTo: (id, x, y) => {
      const p = posRef.current.get(id);
      if (p) { p.x = x; p.y = y; }
    },
    endDrag: () => { dragRef.current = null; }
  };
}