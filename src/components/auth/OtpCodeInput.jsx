import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function OtpCodeInput({ value, onChange, disabled, autoFilled }) {
  return (
    <div dir="ltr" className="flex justify-center">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus
        inputMode="numeric"
        autoComplete="off"
        name="otp-manual"
        containerClassName="gap-2"
      >
        <InputOTPGroup className="gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className={`h-14 w-11 rounded-2xl border bg-muted/40 text-xl font-medium shadow-none transition-all duration-300 first:rounded-2xl last:rounded-2xl border-border/70 ${
                autoFilled ? "border-primary/60 bg-primary/5 scale-[1.03]" : ""
              }`}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}