import React from "react";

const bar = "rounded-md bg-muted animate-pulse motion-reduce:animate-none";

export function RecordingRowsSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0">
          <td className="px-4 py-4"><div className={`${bar} h-3.5 w-28`} /></td>
          <td className="px-4 py-4"><div className={`${bar} h-3.5 w-24`} /></td>
          <td className="px-4 py-4"><div className={`${bar} h-3.5 w-12`} /></td>
          <td className="px-4 py-4"><div className={`${bar} h-3.5 w-20`} /></td>
          <td className="px-4 py-4"><div className={`${bar} h-3.5 w-16`} /></td>
          <td className="px-4 py-4"><div className={`${bar} h-8 w-24 mx-auto`} /></td>
        </tr>
      ))}
    </>
  );
}

export function RecordingCardsSkeleton({ cards = 4 }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-3 w-16`} />
          </div>
          <div className={`${bar} h-9 w-full`} />
          <div className="flex items-center justify-between gap-3">
            <div className={`${bar} h-3 w-20`} />
            <div className={`${bar} h-8 w-28`} />
          </div>
        </div>
      ))}
    </div>
  );
}