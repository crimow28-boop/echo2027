import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div dir="rtl" className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground">CALLECT // 404</span>
                <div className="text-center mt-6 border-2 border-foreground bg-card p-8 space-y-5">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-bold text-foreground tracking-tight leading-none">404</h1>
                        <div className="h-1 w-16 bg-primary mx-auto"></div>
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                            Page Not Found
                        </h2>
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                            The page <span className="text-primary">"{pageName}"</span> could not be found in this application.
                        </p>
                    </div>
                    
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="border-2 border-amber-400 p-3">
                            <p className="font-mono text-[11px] uppercase tracking-wider text-amber-400">Admin Note</p>
                            <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
                                This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat.
                            </p>
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-primary-foreground bg-primary border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}