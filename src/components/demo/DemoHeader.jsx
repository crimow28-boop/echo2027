import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function DemoHeader() {
  return (
    <header className="sticky top-0 z-20 pt-4 sm:pt-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto rounded-full bg-card shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] px-4 sm:px-6 h-16 flex flex-row-reverse items-center gap-4">
        <img src={LOGO} alt="echo" className="h-8 w-auto shrink-0" />

        <nav className="hidden md:flex flex-1 flex-row-reverse items-center justify-center gap-7 text-sm text-foreground/80">
          <a href="#playground" className="hover:text-foreground transition-colors">איך זה עובד</a>
          <a href="#playground" className="hover:text-foreground transition-colors">למי זה מתאים</a>
          <Link to="/signup" className="hover:text-foreground transition-colors">פתיחת חשבון</Link>
        </nav>

        <div className="flex flex-1 md:flex-none items-center justify-end gap-4">
          <Link to="/client-login" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
            התחברות
          </Link>
          <Button asChild className="h-10 rounded-full px-5 text-sm">
            <Link to="/signup">בואו נתחיל</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}