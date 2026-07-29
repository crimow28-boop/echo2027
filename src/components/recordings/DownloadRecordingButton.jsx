import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2 } from "lucide-react";

export default function DownloadRecordingButton({ recording }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getRecordingUrl", { recordId: recording.id });
      const url = res.data?.url;
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recording.callerFriendly || recording.callerNumber || "recording"}.mp3`;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={loading}
      title="הורדת ההקלטה"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
    </button>
  );
}