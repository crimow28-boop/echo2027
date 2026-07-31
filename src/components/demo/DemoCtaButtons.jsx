import React from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoCtaButtons({ size = "lg" }) {
  const h = size === "lg" ? "h-12" : "h-11";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Button asChild className={`gap-2 ${h} rounded-full px-7 text-sm w-full sm:w-auto`}>
        <Link to="/signup">מתחילים כאן בחינם</Link>
      </Button>
      <Button asChild variant="outline" className={`gap-2 ${h} rounded-full bg-card px-7 text-sm w-full sm:w-auto`}>
        <Link to="/client-login">
          <LogIn className="w-4 h-4" />
          כבר יש לי חשבון
        </Link>
      </Button>
    </div>
  );
}