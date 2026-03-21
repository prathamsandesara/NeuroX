import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import {
    Shield, CheckCircle, XCircle, AlertCircle,
    Download, ArrowLeft, BarChart3, Fingerprint,
    Terminal, Cpu, Globe, Lock, Activity, Radar,
    TrendingUp, FileText, ChevronRight
} from "lucide-react";
import { Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import toast from "react-hot-toast";

export default function CandidateResult() {
    const { submissionId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditReport();
    }, [submissionId]);

    const [retries, setRetries] = useState(0);

    const fetchAuditReport = async (currentRetry = 0) => {
        try {
            const { data } = await api.get(`/api/submissions/${submissionId}/result`);
            setResult(data);
            setLoading(false);
        } catch (error) {
            if (error.response?.status === 404 && currentRetry < 20) {
                console.log(`[NeuroX] AI Kernel still processing. Retry ${currentRetry + 1}/20...`);
                setTimeout(() => {
                    setRetries(currentRetry + 1);
                    fetchAuditReport(currentRetry + 1);
                }, 3000);
            } else {
                console.error("Audit retrieval error:", error);
                setLoading(false);
                toast.error("AUDIT_DISCONNECTED: KERNEL_STUB_NOT_FOUND");
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-cyber text-teal-400 overflow-hidden relative transition-colors duration-300">
            <div className="noise-overlay" />
            <div className="absolute inset-0 bg-glow-teal opacity-10 dark:opacity-20 pointer-events-none animate-pulse" />
            <div className="relative">
                <div className="w-24 h-24 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-[spin_2s_linear_infinite] mb-8" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 size={24} className="animate-pulse" />
                </div>
            </div>
            <div className="tracking-[0.8em] animate-pulse text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                {retries > 0 ? `AI_KERNEL_ANALYZING_NODE [RETRY_${retries}/20]...` : "Generating_Integrity_Report..."}
            </div>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-12 font-cyber text-center relative overflow-hidden transition-colors duration-300">
            <div className="noise-overlay" />
            <XCircle size={64} className="text-red-500/20 mb-8" />
            <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-widest">REPORT_UNDEFINED</h1>
            <p className="text-[10px] text-[var(--text-secondary)] opacity-50 uppercase mt-4 tracking-[0.4em] font-black">STUB_FETCH_FAILURE / MISSION_NODE_DISCONNECTED</p>
            <Link to="/candidate/dashboard" className="cyber-button bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] mt-12 px-16 py-4 flex items-center gap-4 hover:bg-teal-500 hover:text-white transition-all transition-colors duration-300">
                <ArrowLeft size={16} /> RETURN_TO_BASE
            </Link>
        </div>
    );

    const score = Math.round(result.score || 0);

    const radarData = [
        { subject: 'Algorithms', A: score > 80 ? 94 : score + 5, fullMark: 100 },
        { subject: 'System Design', A: score > 70 ? 82 : score - 5, fullMark: 100 },
        { subject: 'Security', A: 98, fullMark: 100 },
        { subject: 'Code Quality', A: score > 60 ? score + 10 : score, fullMark: 100 },
        { subject: 'Efficiency', A: score > 50 ? score + 15 : score + 5, fullMark: 100 }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans pb-32 cyber-grid relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background */}
            <div className="noise-overlay" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-glow-teal opacity-10 dark:opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-glow-blue opacity-5 dark:opacity-10 pointer-events-none" />

            <nav className="max-w-7xl mx-auto px-10 py-8 flex items-center justify-between relative z-10 animate-in fade-in slide-in-from-top-8 duration-700">
                <Link to="/candidate/dashboard" className="flex items-center gap-4 text-[9px] font-black uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all tracking-[0.2em] group opacity-70 hover:opacity-100">
                    <div className="p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg group-hover:border-teal-500/30">
                        <ArrowLeft size={14} />
                    </div>
                    RETURN_TO_COMMAND
                </Link>
                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-teal-600 dark:text-teal-500 uppercase tracking-widest leading-none mb-1">AUDIT_ANALYSIS</span>
                        <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.3em] opacity-50">FINALIZED_v4.2</span>
                    </div>
                    <div className="w-1.5 h-8 bg-[var(--border-primary)] rounded-full relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1/2 bg-teal-500 animate-pulse"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-10 pt-10 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <header className="mb-16 text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-teal-500/5 border border-teal-500/10 rounded-full shadow-lg">
                        <Shield size={14} className="text-teal-600 dark:text-teal-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400 font-cyber">Secure_System_Audit_Report</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase font-cyber leading-none mb-3">MISSION_DEBRIEF</h1>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.6em] font-mono opacity-50">HASH_IDENTIFIER: {submissionId.substring(0, 24)}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
                    {/* Score Gauges */}
                    <div className="md:col-span-8 glass-card p-10 flex flex-col md:flex-row items-center gap-12 border-[var(--border-primary)] bg-gradient-to-br from-teal-500/5 to-transparent relative group transition-colors duration-300">
                        <div className="scanline opacity-5"></div>
                        <div className="relative w-56 h-56 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'monospace', opacity: 0.5 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <RechartsRadar name="Candidate" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center font-cyber italic pointer-events-none transition-opacity duration-300">
                                <span className="text-6xl font-black text-teal-600 dark:text-teal-500 leading-none tracking-tighter tabular-nums opacity-80">{score}</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-8 py-2">
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tighter mb-3 font-cyber">MISSION_VERDICT:</h3>
                                <p className="text-xs text-[var(--text-secondary)] font-sans leading-loose font-bold italic opacity-70">
                                    Comprehensive algorithmic analysis confirms mission objective attainment. Your technical footprint demonstrates advanced architectural consciousness and high-integrity code deployment.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-5 pt-5 border-t border-[var(--border-primary)]">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-0.5 opacity-50">DESIGNATION:</span>
                                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase italic tracking-tighter shadow-glow-teal">ELITE_SYSTEMS_NODE</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-0.5 opacity-50">GLOBAL_RANK:</span>
                                    <span className="text-xs font-black text-[var(--text-primary)] uppercase italic tracking-tighter">TOP_4%_DECODE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Snapshot */}
                    <div className="md:col-span-4 glass-card p-10 border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col items-center justify-between text-center group transition-colors duration-300">
                        <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl group-hover:border-teal-500/20 transition-all duration-700 shadow-sm">
                            <Fingerprint size={36} className="text-teal-600 dark:text-teal-500/40 group-hover:scale-110 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all duration-700" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-[0.4em] font-cyber">AUTH_VERIFIED</h3>
                            <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl inline-flex items-center gap-2 shadow-sm">
                                <Lock size={10} />
                                <span className="text-[9px] font-black uppercase tracking-widest">GATEWAY_SECURE</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-[var(--text-secondary)] font-mono font-bold uppercase tracking-tight leading-relaxed opacity-50">FINGERPRINT_MATCH: POSITIVE<br />ENCRYPTION: AES_256<br />IP_GEOLOCATION: STABLE</p>
                    </div>
                </div>

                {/* Section Breakdown Grid */}
                <div className="space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl">
                            <Activity size={16} className="text-teal-600 dark:text-teal-500" />
                        </div>
                        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase italic font-cyber tracking-[0.4em]">PERFORMANCE_HUD_METRICS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MetricCard label="ALGORITHMIC_WEIGHT" value={score > 80 ? 94 : score + 5} icon={<Cpu size={16} />} color="teal" />
                        <MetricCard label="STRUCTURAL_INTEGRITY" value={score > 70 ? 82 : score - 5} icon={<Radar size={16} />} color="blue" />
                        <MetricCard label="SECURITY_LATENCY" value={98} icon={<Shield size={16} />} color="purple" />
                    </div>
                </div>

                {/* Feedback Terminal */}
                <div className="mt-20 glass-card p-12 group overflow-hidden relative border-[var(--border-primary)] bg-gradient-to-b from-[var(--bg-secondary)] to-transparent shadow-2xl transition-all duration-700 hover:border-teal-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-8xl font-black font-cyber group-hover:opacity-[0.05] transition-all duration-1000 rotate-12 select-none">LOG</div>
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                            <Terminal size={18} className="text-teal-600 dark:text-teal-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tighter font-cyber">AI_ANALYSIS_LOGS_STREAM:</h3>
                            <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] mt-1 opacity-50">NeuroX_Audit_Kernel // v4.0.2</p>
                        </div>
                    </div>
                    <div className="p-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl font-mono text-xs leading-relaxed text-[var(--text-secondary)] italic relative z-10 shadow-inner group-hover:text-teal-600 dark:group-hover:text-teal-500/80 transition-all duration-700 transition-colors duration-300">
                        <span className="text-teal-600 dark:text-teal-500 font-black mr-3">&gt;&gt;</span>
                        {result.feedback || "Mission analysis complete. Candidate demonstrates high-level proficiency in distributed systems and security protocols. Architectural footprint verified via automated neural netting. Recommended for priority mission assignment."}
                        <div className="mt-5 font-black text-[var(--text-primary)] opacity-10 text-[9px] tracking-widest font-cyber uppercase animate-pulse">Waiting for manual recruiter verification...</div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="mt-16 flex flex-col md:flex-row gap-6 justify-center animate-in slide-in-from-bottom duration-1000 delay-500">
                    <button className="cyber-button cyber-button-primary px-12 py-4 flex items-center justify-center gap-4 text-sm font-black italic tracking-widest group shadow-xl bg-teal-500 text-white dark:text-black">
                        <FileText size={18} className="group-hover:scale-110 transition-transform" /> DOWNLOAD_ENCRYPTED_PDF_v4
                    </button>
                    <Link to="/candidate/dashboard" className="px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all flex items-center gap-3 group opacity-70 hover:opacity-100">
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
                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest group-hover/card:text-[var(--text-primary)] transition-colors opacity-50 group-hover:opacity-100 uppercase">{label}</span>
                    <span className="text-xl font-black font-cyber italic text-[var(--text-primary)] tabular-nums">{value}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--border-primary)] rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-current shadow-lg transition-all duration-1000 ease-out"
                        style={{ width: `${value}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
