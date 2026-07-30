import { useEffect, useRef } from "react";

const CODE_RE = /\b(\d{6})\b/;

// Auto-detects an incoming 6-digit code:
// 1. WebOTP API (browsers that surface SMS/notification codes).
// 2. Clipboard — when the user returns to the tab after copying the code.
export default function useOtpAutoFill(onCode, active) {
  const handled = useRef(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const apply = (value) => {
      const match = CODE_RE.exec(String(value || ""));
      if (!match || cancelled) return;
      if (handled.current === match[1]) return;
      handled.current = match[1];
      onCode(match[1]);
    };

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (navigator.credentials && "OTPCredential" in window) {
      navigator.credentials
        .get({ otp: { transport: ["sms"] }, signal: controller?.signal })
        .then((cred) => cred?.code && apply(cred.code))
        .catch(() => {});
    }

    const readClipboard = async () => {
      try {
        apply(await navigator.clipboard.readText());
      } catch {
        /* clipboard permission not granted — user can paste manually */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") readClipboard();
    };

    readClipboard();
    window.addEventListener("focus", readClipboard);
    document.addEventListener("visibilitychange", onVisible);
    const poll = setInterval(readClipboard, 1500);

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(poll);
      window.removeEventListener("focus", readClipboard);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}