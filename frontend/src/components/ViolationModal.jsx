import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function ViolationModal({ isOpen, type, onExit }) {
    if (!isOpen) return null;

    const messages = {
        FULLSCREEN_EXIT: "Protocol violation detected: SYSTEM_EXIT_FULLSCREEN. Your session has been terminated for security audit.",
        TAB_SWITCH_OR_NOTIFICATION: "Protocol violation detected: TAB_SWITCH_DETECTION. External environment interaction is strictly prohibited.",
        TIME_EXPIRED: "Session status: DURATION_EXPIRED. Automating data encryption and submission.",
        GENERIC: "Security Protocol Violation. Unauthorized action detected. Session terminated."
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 select-none">
            <div className="w-full max-w-lg bg-black border border-red-500/50 rounded-2xl p-10 text-center space-y-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="inline-flex p-4 bg-red-500/10 rounded-full animate-pulse border border-red-500/20">
                    <ShieldAlert size={48} className="text-red-500" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Security_Breach</h2>
                    <div className="h-px w-24 bg-red-500/30 mx-auto"></div>
                    <p className="text-gray-400 text-sm font-mono leading-relaxed px-4">
                        {messages[type] || messages.GENERIC}
                    </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg font-mono text-[10px] text-red-500/70 uppercase tracking-widest leading-loose">
                    ERROR_CODE: {type || 'UNKNOWN_VIOLATION'}<br />
                    STATUS: TERMINATED_DUE_TO_VIOLATION<br />
                    ENCRYPTION: AES-256-ACTIVE
                </div>

                <button
                    onClick={onExit}
                    className="w-full py-4 bg-red-500 hover:bg-red-400 text-black font-black uppercase text-sm rounded-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    EXIT_SECURE_SHELL
                </button>
            </div>
        </div>
    );
}
