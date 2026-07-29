import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useSendRecording(onSent) {
  const [sendingId, setSendingId] = useState(null);
  const [pending, setPending] = useState(null);

  const send = async (recordId, message) => {
    setSendingId(recordId);
    try {
      const response = await base44.functions.invoke("sendRecordingToClient", { recordId, message });
      if (response.data?.success && onSent) onSent(recordId);
    } finally {
      setSendingId(null);
      setPending(null);
    }
  };

  return { sendingId, pending, setPending, send };
}