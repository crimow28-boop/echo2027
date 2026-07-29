import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import AudioWaveform from "@/components/demo/AudioWaveform";

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function DemoPlayer({ duration, audioUrl }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [total, setTotal] = useState(duration);
  const timer = useRef(null);
  const audioRef = useRef(null);

  // Simulated playback (no real audio attached)
  useEffect(() => {
    if (audioUrl || !playing) return;
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
  }, [playing, duration, audioUrl]);

  const toggle = () => {
    if (!audioUrl) {
      setPlaying((p) => !p);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const pct = total ? Math.min(100, (pos / total) * 100) : 0;

  return (
    <div dir="ltr" className="flex items-center gap-3 min-w-0 w-full overflow-hidden">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration)) setTotal(e.currentTarget.duration);
          }}
          onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            setPos(0);
          }}
          className="hidden"
        />
      )}
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <AudioWaveform
        seed={audioUrl || String(duration)}
        progress={pct / 100}
        onSeek={(ratio) => {
          if (audioUrl && audioRef.current && total) {
            audioRef.current.currentTime = ratio * total;
            setPos(ratio * total);
          } else {
            setPos(ratio * duration);
          }
        }}
      />
    </div>
  );
}