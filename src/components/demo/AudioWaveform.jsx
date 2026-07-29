import React, { useMemo } from "react";

// Deterministic pseudo-random bar heights, WhatsApp-style.
function buildBars(seed, count) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s += String(seed).charCodeAt(i) * (i + 3);
  const bars = [];
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const wave = 0.55 + 0.45 * Math.sin(i / 2.7);
    bars.push(Math.max(0.18, Math.min(1, r * wave + 0.15)));
  }
  return bars;
}

export default function AudioWaveform({ seed = "a", progress = 0, bars = 42, onSeek }) {
  const heights = useMemo(() => buildBars(seed, bars), [seed, bars]);

  const handleClick = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div
      dir="ltr"
      onClick={handleClick}
      className={`flex-1 flex items-center gap-[2px] h-8 ${onSeek ? "cursor-pointer" : ""}`}
    >
      {heights.map((h, i) => {
        const played = i / heights.length <= progress;
        return (
          <span
            key={i}
            style={{ height: `${Math.round(h * 100)}%` }}
            className={`flex-1 min-w-[2px] rounded-full transition-colors ${played ? "bg-primary" : "bg-muted-foreground/25"}`}
          />
        );
      })}
    </div>
  );
}