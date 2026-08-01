import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share, Plus } from "lucide-react";

const DISMISS_KEY = "echo_install_dismissed";
const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/7557abb16_Screenshot2026-07-31at231525-Photoroom.png";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

// Invites the user to add the web app to their home screen.
// Chrome/Android: uses the native install prompt. iOS: shows the manual steps.
export default function InstallAppPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS never fires beforeinstallprompt, so surface the manual instructions.
    let timer;
    if (isIos()) timer = setTimeout(() => setShowIos(true), 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setPrompt(null);
    setShowIos(false);
  };

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice.catch(() => {});
    dismiss();
  };

  if (!prompt && !showIos) return null;

  return (
    <div dir="rtl" className="fixed inset-x-0 bottom-0 z-50 p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md rounded-[1.75rem] bg-card p-5 text-right shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] border border-border">
        <div className="flex items-start gap-3">
          <img src={LOGO} alt="" className="h-10 w-10 rounded-xl object-contain" />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base">להוסיף את Echo למסך הבית?</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {prompt
                ? "פתיחה מהירה מהמסך הראשי, בלי דפדפן."
                : "לחצו על כפתור השיתוף ואז על ״הוסף למסך הבית״."}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="סגירה"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {prompt ? (
          <Button onClick={install} className="mt-4 w-full h-11 gap-2 rounded-full">
            הוספה למסך הבית
            <Download className="w-4 h-4" />
          </Button>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-muted/50 py-3 text-xs text-muted-foreground">
            <Share className="w-4 h-4" /> שיתוף
            <span>←</span>
            <Plus className="w-4 h-4" /> הוסף למסך הבית
          </div>
        )}
      </div>
    </div>
  );
}