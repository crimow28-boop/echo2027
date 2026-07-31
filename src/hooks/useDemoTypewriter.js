import { useEffect, useRef, useState } from "react";

const WORDS = ["משה כהן", "מוסך אלון", "052", "רונית שגב"];

// Types a name, holds it (results shown), deletes it, moves on.
// `settled` is true only while a word is fully typed, so results don't flicker.
export default function useDemoTypewriter(active) {
  const [text, setText] = useState("");
  const [settled, setSettled] = useState(false);
  const state = useRef({ word: 0, char: 0, deleting: false });

  useEffect(() => {
    if (!active) return;
    let timer;

    const tick = () => {
      const s = state.current;
      const word = WORDS[s.word % WORDS.length];
      let delay = 150;

      if (!s.deleting) {
        s.char += 1;
        if (s.char >= word.length) {
          s.deleting = true;
          setSettled(true);
          delay = 3600;
        }
      } else {
        setSettled(false);
        s.char -= 1;
        delay = 80;
        if (s.char <= 0) {
          s.deleting = false;
          s.word += 1;
          delay = 900;
        }
      }

      setText(word.slice(0, Math.max(0, s.char)));
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [active]);

  return { text, settled };
}