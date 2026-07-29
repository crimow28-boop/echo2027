import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import RequestAccountDialog from "@/components/auth/RequestAccountDialog";

export default function DemoCtaButtons({ size = "lg" }) {
  const [open, setOpen] = useState(false);
  const h = size === "lg" ? "h-12" : "h-11";

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button onClick={() => setOpen(true)} className={`gap-2 ${h} rounded-full px-7 text-sm w-full sm:w-auto`}>
          <Sparkles className="w-4 h-4" />
          פתיחת חשבון חדש
        </Button>
        <Button asChild variant="outline" className={`gap-2 ${h} rounded-full px-7 text-sm w-full sm:w-auto`}>
          <Link to="/client-login">
            <LogIn className="w-4 h-4" />
            כבר יש לי חשבון
          </Link>
        </Button>
      </div>
      <RequestAccountDialog open={open} onOpenChange={setOpen} />
    </>
  );
}