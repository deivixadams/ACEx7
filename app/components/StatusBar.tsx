'use client';

import { Activity, Database, Globe, Lock } from 'lucide-react';

const StatusBar = () => {
    return (
        <footer className="h-8 bg-[#007acc] flex items-center justify-between px-6 text-[10px] font-bold text-white backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                    <span className="uppercase tracking-widest text-white">System Online</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1.5 hover:text-white/60 transition-colors cursor-pointer">
                    <Database className="h-3 w-3" />
                    <span>PORT: 3000</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />
                    <span>JURISDICTION: DOMINICAN REPUBLIC</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-amber-500/50" />
                    <span className="uppercase tracking-widest">SSL SECURE connection</span>
                </div>
                <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <Activity className="h-3 w-3" />
                    <span>LATENCY: 24ms</span>
                </div>
                <span className="uppercase tracking-widest">© 2026 ACEx7 CORP. ALL RIGHTS RESERVED</span>
            </div>
        </footer>
    );
};

export default StatusBar;
