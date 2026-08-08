import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import useAutoTranscribe from "@/hooks/useAutoTranscribe";

export default function AutoTranscribeToggle() {
  const { enabled, loaded, setAutoTranscribe } = useAutoTranscribe();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 text-right">
        <Label htmlFor="auto-transcribe" className="text-sm font-medium">תמלול אוטומטי</Label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          כשמופעל, כל שיחה מתומללת מיד ותוצג כ"תמלול מוכן" ברשימה.
        </p>
      </div>
      <Switch
        id="auto-transcribe"
        checked={enabled}
        disabled={!loaded}
        onCheckedChange={setAutoTranscribe}
      />
    </div>
  );
}