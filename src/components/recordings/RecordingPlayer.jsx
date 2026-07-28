import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Loader2, AudioLines } from "lucide-react";
import { formatDuration } from "@/lib/recordingUtils";

export default function RecordingPlayer({ recording }) {
  const audioRef = useRef(null);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(recording.duration || 0);
  const [error, setError] = useState("");

  const toggle = async () => {
    setError("");
    if (!url) {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("getRecordingUrl", { recordId: recording.id });
        if (!res.data?.url) throw new Error(res.data?.error || "לא ניתן להאזין להקלטה");
        setUrl(res.data.url);
        setTimeout(() => audioRef.current?.play(), 0);
      } catch (e) {
        setError(e?.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const progress = total > 0 ? Math.min(100, (time / total) * 100) : 0;

  const seek = (e) => {
    const el = audioRef.current;
    if (!el || !total) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = 1 - (e.clientX - rect.left) / rect.width; // RTL
    el.currentTime = Math.max(0, Math.min(total, ratio * total));
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : playing ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div
            onClick={seek}
            className="h-1.5 w-full rounded-full bg-border cursor-pointer overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%`, marginRight: 0, marginLeft: "auto" }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground font-mono" dir="ltr">
            <span>{formatDuration(Math.round(time))}</span>
            <span>{formatDuration(Math.round(total))}</span>
          </div>
        </div>

        <AudioLines className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {error && <p className="mt-2 text-xs text-destructive text-right">{error}</p>}

      {url && (
        <audio
          ref={audioRef}
          src={url}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (isFinite(e.currentTarget.duration)) setTotal(e.currentTarget.duration);
          }}
          className="hidden"
        />
      )}
    </div>
  );
}