import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div dir="rtl" className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-10">
      <div className="max-w-md w-full">
        <span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground">CALLECT // ERROR</span>
        <div className="text-center mt-6 border-2 border-foreground bg-card p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-amber-400 bg-amber-400/10 mb-6">
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground leading-none">Access Restricted</h1>
          <p className="text-muted-foreground mt-3 font-mono text-xs uppercase tracking-[0.15em]">You are not registered to use this application</p>
          <div className="mt-6 border-t-2 border-border pt-5 text-left">
            <p className="font-mono text-xs text-muted-foreground">If you believe this is an error:</p>
            <ul className="mt-2 space-y-1 font-mono text-xs text-muted-foreground list-disc list-inside">
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