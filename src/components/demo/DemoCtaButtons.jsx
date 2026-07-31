import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DemoCtaButtons({ size = "lg" }) {
  const h = size === "lg" ? "h-12" : "h-11";
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const p = phone.trim();
    navigate(p ? `/client-login?phone=${encodeURIComponent(p)}` : "/client-login");
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row items-stretch justify-center gap-2 max-w-md mx-auto">
      <div className="relative flex-1">
        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          dir="ltr"
          placeholder="0501234567"
          className={`${h} rounded-full pr-10 text-sm text-center`}
        />
      </div>
      <Button type="submit" className={`gap-2 ${h} rounded-full px-7 text-sm`}>
        כניסה למערכת
        <ArrowLeft className="w-4 h-4" />
      </Button>
    </form>
  );
}