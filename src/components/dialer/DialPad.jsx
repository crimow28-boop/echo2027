import React from "react";
import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export default function DialPad({ onPress, onBackspace }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onPress(k)}
          className="h-16 rounded-2xl bg-muted/60 text-2xl font-heading text-foreground hover:bg-accent active:scale-95 transition-all"
        >
          {k}
        </button>
      ))}
      <button
        type="button"
        onClick={onBackspace}
        className="col-start-3 h-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center"
      >
        <Delete className="w-5 h-5" />
      </button>
    </div>
  );
}