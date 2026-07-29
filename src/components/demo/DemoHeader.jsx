import React from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function DemoHeader() {
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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