import React from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoCtaButtons({ size = "lg" }) {
  const h = size === "lg" ? "h-12" : "h-11";

  return (
    <div className="flex justify-center">
      <Button asChild className={`gap-2 ${h} rounded-full px-8 text-sm w-full sm:w-auto`}>
        <Link to="/client-login">
          <LogIn className="w-4 h-4" />
          כניסה למערכת
        </Link>
      </Button>
    </div>
  );
}