import React from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function DemoHeader() {
  return (
    <header className="sticky top-3 z-20 px-4 sm:px-6 pt-3">
      <div className="max-w-3xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-4 rounded-full bg-card/85 backdrop-blur ring-1 ring-black/5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
        <img src={LOGO} alt="echo" className="h-8 w-auto" />
        <Button asChild className="gap-2 h-10 rounded-full px-5 text-sm">
          <Link to="/client-login">
            <LogIn className="w-4 h-4" />
            התחברות
          </Link>
        </Button>
      </div>
    </header>
  );
}