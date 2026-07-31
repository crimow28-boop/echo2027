import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoCtaButtons({ size = "lg" }) {
  const h = size === "lg" ? "h-14" : "h-12";
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const p = phone.trim();
    navigate(p ? `/client-login?phone=${encodeURIComponent(p)}` : "/client-login");
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="mb-2 text-center text-sm font-medium text-foreground">
        הזינו את מספר הטלפון שלכם כדי להתחיל
      </p>
      <form
        onSubmit={submit}
        className={`flex items-center gap-2 ${h} w-full rounded-full border border-border bg-card pr-4 pl-1.5 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)] focus-within:ring-2 focus-within:ring-ring`}
      >
        <Phone className="w-4 h-4 shrink-0 text-muted-foreground" />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          dir="ltr"
          placeholder="מספר טלפון · 0501234567"
          className="flex-1 min-w-0 bg-transparent text-sm text-right outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5 h-10 rounded-full px-5 text-sm">
          כניסה
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}