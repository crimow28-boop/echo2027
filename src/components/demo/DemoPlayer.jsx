import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function DemoPlayer({ duration }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= duration) {
          setPlaying(false);
          return 0;
        }
        return p + 1;
      });
    }, 250);
    return () => clearInterval(timer.current);
  }, [playing, duration]);

  const pct = Math.min(100, (pos / duration) * 100);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground font-mono shrink-0" dir="ltr">
        {fmt(pos)} / {fmt(duration)}
      </span>
    </div>
  );
}