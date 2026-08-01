import React from "react";
import { Download, Mic } from "lucide-react";

export default function AnnouncementClip({ label, url, fileName }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Mic className="w-4 h-4 text-primary" />
          {label}
        </span>
        <a
          href={url}
          download={fileName}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          הורדה MP3
        </a>
      </div>
      <audio controls preload="none" src={url} className="mt-3 w-full" />
    </div>
  );
}