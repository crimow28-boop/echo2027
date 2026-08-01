// Some network/SDK failures reject with a plain object or string instead of an Error.
// The dev error overlay reads reason.stack and crashes on those, masking the real cause.
// We log the actual reason and stop it before that handler runs.
if (typeof window !== "undefined" && !window.__rejectionGuard) {
  window.__rejectionGuard = true;
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      if (reason instanceof Error && typeof reason.stack === "string") return;
      // eslint-disable-next-line no-console
      console.error("Unhandled promise rejection:", reason);
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true
  );
}