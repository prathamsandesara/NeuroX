import { useState, useEffect, useRef } from "react";
import { Terminal, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function SecurityTerminal() {
    const [logs, setLogs] = useState([
        { id: 1, type: 'INFO', msg: 'NeuroX Security Kernel v2.1 Initialized...', time: new Date().toLocaleTimeString() },
        { id: 2, type: 'INFO', msg: 'IDS (Intrusion Detection System): ACTIVE', time: new Date().toLocaleTimeString() },
        { id: 3, type: 'INFO', msg: 'IPS (Intrusion Prevention System): ACTIVE', time: new Date().toLocaleTimeString() }
    ]);
    const scrollRef = useRef(null);

    // Simulate incoming security logs
    useEffect(() => {
        const interval = setInterval(() => {
            const events = [
                "Authorized session handshake for @admin",
                "Integrity hash verification: SUCCESS",
                "Cleaning ephemeral cache...",
                "Scanning for active context switches...",
                "Database integrity check: STABLE"
            ];
            const randomMsg = events[Math.floor(Math.random() * events.length)];

            setLogs(prev => [...prev.slice(-15), {
                id: Date.now(),
                type: 'SYSTEM',
                msg: randomMsg,
                time: new Date().toLocaleTimeString()
            }]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black border border-white/10 rounded-2xl overflow-hidden font-mono text-[10px] h-[300px] flex flex-col shadow-2xl">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-teal-500" />
                    <span className="text-white font-black uppercase tracking-widest">Security_Live_Feed</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-hide"
            >
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in duration-500">
                        <span className="text-gray-600">[{log.time}]</span>
                        <span className={`font-black ${log.type === 'INFO' ? 'text-teal-500' :
                                log.type === 'SYSTEM' ? 'text-blue-500/80' : 'text-gray-400'
                            }`}>
                            [{log.type}]
                        </span>
                        <span className="text-gray-300 break-all">{log.msg}</span>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-teal-500/5 border-t border-white/5 text-[9px] text-teal-500/50 flex items-center gap-2">
                <Shield size={10} />
                <span className="animate-pulse">KERNEL_LISTENING_ON_PORT_4000...</span>
            </div>
        </div>
    );
}
