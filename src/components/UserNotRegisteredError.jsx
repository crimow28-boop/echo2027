import React from 'react';
import { ShieldAlert } from 'lucide-react';

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

const UserNotRegisteredError = () => {
  return (
    <div dir="rtl" className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-10">
      <div className="max-w-md w-full text-center">
        <img src={LOGO} alt="echo" className="h-10 w-auto mx-auto mb-8" />
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border border-amber-200 mb-5">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Access Restricted</h1>
          <p className="text-sm text-muted-foreground mt-2">You are not registered to use this application</p>
          <div className="mt-6 border-t border-border pt-5 text-right">
            <p className="text-sm font-medium text-foreground/80">If you believe this is an error:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc list-inside pr-1">
              <li>Verify you are logged in with the correct account</li>
              <li>Contact the app administrator for access</li>
              <li>Try logging out and back in again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;