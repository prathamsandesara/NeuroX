import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import {
    Shield, CheckCircle, XCircle, AlertCircle,
    Download, ArrowLeft, BarChart3, Fingerprint,
    Terminal, Cpu, Globe, Lock, Activity, Radar,
    TrendingUp, FileText, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

export default function CandidateResult() {
    const { submissionId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditReport();
    }, [submissionId]);

    const fetchAuditReport = async () => {
        try {
            const { data } = await api.get(`/api/submissions/${submissionId}/result`);
            setResult(data);
        } catch (error) {
            console.error("Audit retrieval error:", error);
            toast.error("AUDIT_DISCONNECTED: KERNEL_STUB_NOT_FOUND");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center font-cyber text-teal-500 overflow-hidden relative">
            <div className="noise-overlay"></div>
            <div className="absolute inset-0 bg-teal-500/5 blur-[150px] animate-pulse"></div>
            <div className="relative">
                <div className="w-24 h-24 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-spin mb-8"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 size={24} className="animate-pulse" />
                </div>
            </div>
            <div className="tracking-[0.8em] animate-pulse text-[10px] font-black uppercase">Generating_Integrity_Report...</div>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-12 font-cyber text-center relative overflow-hidden">
            <div className="noise-overlay"></div>
            <XCircle size={64} className="text-red-500/20 mb-8" />
            <h1 className="text-3xl font-black text-white uppercase italic tracking-widest">REPORT_UNDEFINED</h1>
            <p className="text-[10px] text-gray-700 uppercase mt-4 tracking-[0.4em] font-black">STUB_FETCH_FAILURE / MISSION_NODE_DISCONNECTED</p>
            <Link to="/candidate/dashboard" className="cyber-button bg-white/5 border border-white/10 text-white mt-12 px-16 py-4 flex items-center gap-4">
                <ArrowLeft size={16} /> RETURN_TO_BASE
            </Link>
        </div>
    );

    const score = Math.round(result.score || 0);

    return (
        <div className="min-h-screen bg-transparent text-gray-400 font-sans pb-32 cyber-grid relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/5 blur-[180px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none"></div>

            <nav className="max-w-7xl mx-auto px-10 py-8 flex items-center justify-between relative z-10 animate-in fade-in slide-in-from-top-8 duration-700">
                <Link to="/candidate/dashboard" className="flex items-center gap-4 text-[9px] font-black uppercase text-gray-600 hover:text-white transition-all tracking-[0.2em] group">
                    <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-lg group-hover:border-white/20">
                        <ArrowLeft size={14} />
                    </div>
                    RETURN_TO_COMMAND
                </Link>
                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest leading-none mb-1">AUDIT_ANALYSIS</span>
                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.3em]">FINALIZED_v4.2</span>
                    </div>
                    <div className="w-1.5 h-8 bg-white/5 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1/2 bg-teal-500 animate-pulse"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-10 pt-10 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <header className="mb-16 text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-teal-500/5 border border-teal-500/10 rounded-full shadow-2xl">
                        <Shield size={14} className="text-teal-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400 font-cyber">Secure_System_Audit_Report</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase font-cyber leading-none mb-3">MISSION_DEBRIEF</h1>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.6em] font-mono">HASH_IDENTIFIER: {submissionId.substring(0, 24)}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
                    {/* Score Gauges */}
                    <div className="md:col-span-8 glass-card p-10 flex flex-col md:flex-row items-center gap-12 border-teal-500/10 bg-gradient-to-br from-teal-500/5 to-transparent relative group">
                        <div className="scanline opacity-5"></div>
                        <div className="relative w-44 h-44 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                                <circle cx="88" cy="88" r="80" className="stroke-white/5 fill-transparent" strokeWidth="12" />
                                <circle cx="88" cy="88" r="80" className="stroke-teal-500 fill-transparent transition-all duration-1000 ease-out" strokeWidth="12" strokeDasharray={502} strokeDashoffset={502 - (502 * score / 100)} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center font-cyber italic">
                                <span className="text-4xl font-black text-white leading-none tracking-tighter group-hover:text-teal-400 transition-colors animate-in slide-in-from-bottom duration-1000 tabular-nums">{score}</span>
                                <span className="text-[9px] text-teal-500/50 uppercase font-black mt-1.5 tracking-[0.4em]">PERCENT</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-8 py-2">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-3 font-cyber">MISSION_VERDICT:</h3>
                                <p className="text-xs text-gray-500 font-sans leading-loose font-bold italic">
                                    Comprehensive algorithmic analysis confirms mission objective attainment. Your technical footprint demonstrates advanced architectural consciousness and high-integrity code deployment.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-5 pt-5 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-0.5">DESIGNATION:</span>
                                    <span className="text-xs font-black text-teal-500 uppercase italic tracking-tighter">ELITE_SYSTEMS_NODE</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-0.5">GLOBAL_RANK:</span>
                                    <span className="text-xs font-black text-white uppercase italic tracking-tighter">TOP_4%_DECODE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Snapshot */}
                    <div className="md:col-span-4 glass-card p-10 border-white/5 bg-black/40 flex flex-col items-center justify-between text-center group">
                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group-hover:border-teal-500/20 transition-all duration-700">
                            <Fingerprint size={36} className="text-teal-500/40 group-hover:scale-110 group-hover:text-teal-500 transition-all duration-700" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-white uppercase tracking-[0.4em] font-cyber">AUTH_VERIFIED</h3>
                            <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl inline-flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                <Lock size={10} />
                                <span className="text-[9px] font-black uppercase tracking-widest">GATEWAY_SECURE</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-700 font-mono font-bold uppercase tracking-tight leading-relaxed">FINGERPRINT_MATCH: POSITIVE<br />ENCRYPTION: AES_256<br />IP_GEOLOCATION: STABLE</p>
                    </div>
                </div>

                {/* Section Breakdown Grid */}
                <div className="space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                            <Activity size={16} className="text-teal-500" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase italic font-cyber tracking-[0.4em]">PERFORMANCE_HUD_METRICS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MetricCard label="ALGORITHMIC_WEIGHT" value={score > 80 ? 94 : score + 5} icon={<Cpu size={16} />} color="teal" />
                        <MetricCard label="STRUCTURAL_INTEGRITY" value={score > 70 ? 82 : score - 5} icon={<Radar size={16} />} color="blue" />
                        <MetricCard label="SECURITY_LATENCY" value={98} icon={<Shield size={16} />} color="purple" />
                    </div>
                </div>

                {/* Feedback Terminal */}
                <div className="mt-20 glass-card p-12 group overflow-hidden relative border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shadow-2xl transition-all duration-700 hover:border-teal-500/20">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-8xl font-black font-cyber group-hover:opacity-[0.05] transition-all duration-1000 rotate-12 select-none">LOG</div>
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                            <Terminal size={18} className="text-teal-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter font-cyber">AI_ANALYSIS_LOGS_STREAM:</h3>
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1">NeuroX_Audit_Kernel // v4.0.2</p>
                        </div>
                    </div>
                    <div className="p-8 bg-black/60 border border-white/5 rounded-3xl font-mono text-xs leading-relaxed text-gray-400 italic relative z-10 shadow-inner group-hover:text-teal-500/80 transition-colors duration-700">
                        <span className="text-teal-500 font-black mr-3">&gt;&gt;</span>
                        {result.feedback || "Mission analysis complete. Candidate demonstrates high-level proficiency in distributed systems and security protocols. Architectural footprint verified via automated neural netting. Recommended for priority mission assignment."}
                        <div className="mt-5 font-black text-white/10 text-[9px] tracking-widest font-cyber uppercase animate-pulse">Waiting for manual recruiter verification...</div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="mt-16 flex flex-col md:flex-row gap-6 justify-center animate-in slide-in-from-bottom duration-1000 delay-500">
                    <button className="cyber-button cyber-button-primary px-12 py-4 flex items-center justify-center gap-4 text-sm font-black italic tracking-widest group shadow-2xl">
                        <FileText size={18} className="group-hover:scale-110 transition-transform" /> DOWNLOAD_ENCRYPTED_PDF_v4
                    </button>
                    <Link to="/candidate/dashboard" className="px-8 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/20 transition-all flex items-center gap-3 group">
                        RETURN_TO_BASE_OPS <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                </div>
            </main>
        </div>
    );
}

function MetricCard({ label, value, icon, color }) {
    const colors = {
        teal: 'text-teal-500 border-teal-500/20 bg-teal-500/[0.02]',
        blue: 'text-blue-500 border-blue-500/20 bg-blue-500/[0.02]',
        purple: 'text-purple-500 border-purple-500/20 bg-purple-500/[0.02]'
    };

    return (
        <div className={`glass-card p-6 border-2 transition-all duration-700 hover:scale-[1.05] group/card ${colors[color]}`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 bg-black/40 rounded-xl border border-white/5 group-hover/card:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="flex items-center gap-1.5 opacity-20 group-hover/card:opacity-60 transition-opacity">
                    <div className="w-1 h-3 bg-current rounded-full"></div>
                    <div className="w-1 h-2 bg-current rounded-full"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest group-hover/card:text-gray-300 transition-colors uppercase">{label}</span>
                    <span className="text-xl font-black font-cyber italic text-white tabular-nums">{value}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-current shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-1000 ease-out"
                        style={{ width: `${value}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
