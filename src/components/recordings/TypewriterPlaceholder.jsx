import React, { useEffect, useState } from "react";

export default function TypewriterPlaceholder({ examples = [] }) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (examples.length === 0) return;
    const full = examples[index % examples.length];
    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), 1400);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % examples.length);
      return;
    }
    const t = setTimeout(() => {
      setText((prev) => (deleting ? full.slice(0, prev.length - 1) : full.slice(0, prev.length + 1)));
    }, deleting ? 28 : 55);
    return () => clearTimeout(t);
  }, [text, deleting, index, examples]);

  return (
    <div className="absolute inset-y-0 right-12 left-4 flex items-center pointer-events-none">
      <span className="text-base text-muted-foreground truncate">
        {text}
        <span className="opacity-50">|</span>
      </span>
    </div>
  );
}