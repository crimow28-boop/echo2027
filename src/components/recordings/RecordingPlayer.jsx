import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Loader2, AudioLines } from "lucide-react";
import { formatDuration } from "@/lib/recordingUtils";

const BAR_COUNT = 40;

// Stable pseudo-random amplitude bars per recording (WhatsApp-style waveform).
function buildBars(seedStr) {
  let seed = 0;
  for (let i = 0; i < String(seedStr).length; i++) seed = (seed * 31 + String(seedStr).charCodeAt(i)) % 100000;
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const rnd = (seed / 2147483648);
    const envelope = Math.sin((i / BAR_COUNT) * Math.PI) * 0.5 + 0.5;
    bars.push(Math.round(25 + rnd * 75 * envelope));
  }
  return bars;
}

export default function RecordingPlayer({ recording }) {
  const bars = React.useMemo(() => buildBars(recording.id || recording.externalId || "x"), [recording.id, recording.externalId]);
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
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = Math.max(0, Math.min(total, ratio * total));
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-3" dir="ltr">
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : playing ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex-1 min-w-0" dir="ltr">
          <div onClick={seek} className="flex items-center gap-[2px] h-8 cursor-pointer">
            {bars.map((h, i) => {
              const active = (i / bars.length) * 100 <= progress;
              return (
                <span
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${active ? "bg-primary" : "bg-border"}`}
                  style={{ height: `${h}%`, minWidth: 2 }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground font-mono" dir="ltr">
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