import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useSendRecording(onSent) {
  const [sendingId, setSendingId] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");

  const send = async (recordId, message) => {
    setSendingId(recordId);
    setError("");
    try {
      const response = await base44.functions.invoke("sendRecordingToClient", { recordId, message });
      if (response.data?.success) {
        if (onSent) onSent(recordId);
        setPending(null);
      } else {
        setError(response.data?.error || "השליחה נכשלה — נסו שוב");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "השליחה נכשלה — נסו שוב");
    } finally {
      setSendingId(null);
    }
  };

  const clearPending = () => {
    setPending(null);
    setError("");
  };

  return { sendingId, pending, setPending: (r) => { setError(""); setPending(r); }, clearPending, send, error };
}