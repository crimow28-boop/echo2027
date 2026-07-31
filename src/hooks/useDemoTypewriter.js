import { useEffect, useRef, useState } from "react";

const WORDS = ["משה כהן", "מוסך אלון", "052", "רונית שגב"];

// Types a name, pauses (so results show), deletes it, moves to the next one.
export default function useDemoTypewriter(active) {
  const [text, setText] = useState("");
  const state = useRef({ word: 0, char: 0, deleting: false });

  useEffect(() => {
    if (!active) return;
    let timer;

    const tick = () => {
      const s = state.current;
      const word = WORDS[s.word % WORDS.length];
      let delay = 110;

      if (!s.deleting) {
        s.char += 1;
        if (s.char >= word.length) {
          s.deleting = true;
          delay = 2200;
        }
      } else {
        s.char -= 1;
        delay = 55;
        if (s.char <= 0) {
          s.deleting = false;
          s.word += 1;
          delay = 500;
        }
      }

      setText(word.slice(0, Math.max(0, s.char)));
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [active]);

  return text;
}