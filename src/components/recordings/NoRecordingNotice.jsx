import React from "react";
import { MicOff } from "lucide-react";

export default function NoRecordingNotice() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
      <MicOff className="w-4 h-4 text-amber-600 shrink-0" />
      מערכת הטלפוניה לא שמרה הקלטה לשיחה הזו
    </div>
  );
}