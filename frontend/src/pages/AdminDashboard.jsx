import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import SecurityTerminal from "../components/SecurityTerminal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
    Shield, Activity, Database, Lock, AlertOctagon,
    Terminal, Fingerprint, Search, RefreshCw, FileText,
    Globe, Cpu, Zap, Radar, HardDrive, Server, ArrowRight,
    Clock, Eye, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Monitor, Wifi
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
    const [forensicLogs, setForensicLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        fetchAdminPortalData();
        const interval = setInterval(fetchAdminPortalData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAdminPortalData = async () => {
        try {
            const [logsRes, statsRes, auditRes] = await Promise.all([
                api.get("/api/admin/forensics").catch(err => {
                    const status = err.response?.status;
                    if (status === 401) toast.error("NOT_AUTHENTICATED: Please log in as ADMIN");
                    else if (status === 403) toast.error("ACCESS_DENIED: Your account role is not ADMIN");
                    else toast.error("FORENSIC_API_OFFLINE: Backend unreachable");
                    return { data: [] };
                }),
                api.get("/api/admin/stats").catch(() => ({ data: null })),
                api.get("/api/admin/audit-logs").catch(() => ({ data: [] }))
            ]);
            setForensicLogs(logsRes.data || []);
            if (statsRes.data) setStats(statsRes.data);
            setAuditLogs(auditRes.data || []);
        } catch (error) {
            console.error("Forensic sync failed:", error);
            setForensicLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(20, 184, 166);
        doc.text("NEUROX_FORENSIC_AUDIT_REPORT", 14, 20);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`GENERATED: ${new Date().toLocaleString()} | CLASSIFICATION: SEC_ADMIN_L4`, 14, 28);
        doc.line(14, 33, 196, 33);

        const tableData = forensicLogs.map(log => [
            log.candidate?.toUpperCase() || "ANONYMOUS",
            log.metadata?.ip || "N/A",
            log.metadata?.device_fingerprint ? `${log.metadata.device_fingerprint.screen || 'N/A'}` : 'N/A',
            `${log.integrityScore || 0}%`,
            log.riskLevel || "CLEAR",
            log.anomalyFlags?.join(', ') || 'NONE',
            log.violationsCount || 0,
            log.sessionDuration !== null ? `${log.sessionDuration}m` : 'N/A',
        ]);

        doc.autoTable({
            startY: 40,
            head: [['SUBJECT', 'IP_ADDR', 'SCREEN', 'INTEGRITY', 'RISK', 'ANOMALIES', 'FLAGS', 'DURATION']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [20, 184, 166], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7 },
            styles: { fontSize: 7, cellPadding: 3 },
        });

        doc.save(`neurox_audit_${new Date().getTime()}.pdf`);
        toast.success("AUDIT_REPORT_EXPORTED");
    };

    const filteredLogs = forensicLogs.filter(f => {
        const matchSearch = f.candidate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.metadata?.ip?.includes(searchTerm) ||
            f.job?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTab = activeTab === "ALL" ||
            (activeTab === "THREATS" && (f.riskLevel === "CRITICAL" || f.riskLevel === "MEDIUM")) ||
            (activeTab === "AUTH" && f.status === "AUTH_SUCCESS") ||
            (activeTab === "SESSIONS" && f.status !== "AUTH_SUCCESS");
        return matchSearch && matchTab;
    });

    const criticalCount = forensicLogs.filter(f => f.riskLevel === "CRITICAL").length;
    const anomalyCount = forensicLogs.filter(f => f.anomalyFlags?.length > 0).length;
    const totalViolations = forensicLogs.reduce((acc, f) => acc + (f.violationsCount || 0), 0);

    if (loading) return (
        <div className="min-h-screen bg-[#020204] flex flex-col items-center justify-center font-cyber text-teal-400 relative overflow-hidden">
            <div className="noise-overlay" />
            <div className="absolute inset-0 bg-glow-teal opacity-20 pointer-events-none animate-pulse" />
            <div className="relative">
                <div className="w-24 h-24 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-[spin_2s_linear_infinite] mb-8" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Shield size={24} className="animate-pulse" />
                </div>
            </div>
            <div className="tracking-[0.8em] animate-pulse text-[10px] font-bold uppercase text-slate-500">Initializing_Forensic_Kernel...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020204] text-slate-400 font-sans selection:bg-teal-500/30 relative overflow-hidden">
            <div className="noise-overlay" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-glow-teal opacity-20 pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-[100] border-b border-white/5 bg-black/60 backdrop-blur-3xl px-12 py-5">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-teal-500 flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                            <Radar className="text-black" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-0.5">
                                <span className="px-3 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 font-black text-[8px] rounded uppercase tracking-[0.2em]">SEC_ADMIN_L4</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-glow"></div>
                            </div>
                            <h1 className="text-2xl font-black text-white italic tracking-tighter font-cyber uppercase leading-none">FORENSIC_COMMAND</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.5em]">Threat_Intelligence_v5.0</p>
                                <div className="h-2 w-[1px] bg-white/10 mx-1"></div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-500/5 border border-teal-500/10 rounded-md text-[7px] font-black text-teal-400 uppercase tracking-widest">
                                    <Wifi size={8} /> {window.location.hostname}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-8 mr-4">
                            <StatPill label="CRITICAL" value={criticalCount} color="text-red-500" bg="bg-red-500/10 border-red-500/20" />
                            <StatPill label="ANOMALIES" value={anomalyCount} color="text-yellow-500" bg="bg-yellow-500/10 border-yellow-500/20" />
                            <StatPill label="VIOLATIONS" value={totalViolations} color="text-orange-500" bg="bg-orange-500/10 border-orange-500/20" />
                        </div>
                        <button onClick={handleExportPDF} className="cyber-button cyber-button-primary px-6 py-3 text-[10px]">
                            <FileText size={13} /> EXPORT_AUDIT
                        </button>
                        <button onClick={fetchAdminPortalData} className="p-3 bg-white/5 border border-white/10 text-teal-500 rounded-xl hover:bg-teal-500 hover:text-black transition-all">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-8 space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard icon={<Server size={22} />} label="SYSTEM_STORAGE" value={stats?.totalUsers || '0'} sub="SUBJECTS_IN_DATABASE" color="text-blue-400" />
                    <MetricCard icon={<Activity size={22} />} label="LIVE_SESSIONS" value={stats?.totalAssessments || '0'} sub="TOTAL_ASSESSMENTS" color="text-teal-400" />
                    <MetricCard icon={<AlertOctagon size={22} />} label="CRITICAL_THREATS" value={criticalCount} sub="HIGH_RISK_SUBJECTS" color="text-red-400" variant="danger" />
                    <MetricCard icon={<Lock size={22} />} label="ANOMALIES_DETECTED" value={anomalyCount} sub="BEHAVIORAL_FLAGS" color="text-yellow-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Security Terminal */}
                        <section className="glass-card p-8 border-teal-500/10 bg-gradient-to-b from-teal-500/5 to-transparent relative group min-h-[300px]">
                            <div className="scanline opacity-5"></div>
                            <h3 className="text-xs font-black text-white uppercase mb-6 flex items-center gap-4 tracking-[0.3em] font-cyber">
                                <Terminal size={18} className="text-teal-500" /> EVENT_STREAM
                            </h3>
                            <SecurityTerminal />
                        </section>

                        {/* Live Threat Map */}
                        <section className="glass-card p-8 border-white/5 bg-[#020204]/80 relative overflow-hidden group min-h-[300px]">
                            <div className="scanline opacity-[0.03]"></div>
                            <h3 className="text-xs font-black text-white uppercase mb-6 flex items-center gap-4 tracking-[0.3em] font-cyber">
                                <Globe size={18} className="text-blue-500" /> LIVE_THREAT_MAP
                            </h3>
                            <div className="relative w-full h-48 border border-white/10 rounded-2xl bg-black/40 overflow-hidden flex items-center justify-center">
                                {/* Grid map background */}
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-50"></div>
                                {/* Scanning line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.8)] animate-[scan_3s_linear_infinite]"></div>
                                
                                {filteredLogs.slice(0, 5).map((log, i) => {
                                    const top = Math.random() * 80 + 10;
                                    const left = Math.random() * 80 + 10;
                                    const isCritical = log.riskLevel === 'CRITICAL';
                                    return (
                                        <div key={i} className="absolute flex flex-col items-center" style={{ top: `${top}%`, left: `${left}%` }}>
                                            <div className={`w-3 h-3 rounded-full ${isCritical ? 'bg-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]' : 'bg-yellow-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]'} shadow-[0_0_10px_currentColor]`}></div>
                                            <div className={`mt-2 text-[8px] font-black uppercase font-mono tracking-widest ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {log.metadata?.ip?.split(',')[0].trim() || 'UNKNOWN_IP'}
                                            </div>
                                        </div>
                                    );
                                })}
                                {anomalyCount === 0 && criticalCount === 0 && (
                                     <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-teal-500 border border-teal-500/20 px-4 py-1.5 rounded-full bg-teal-500/10 backdrop-blur-sm z-10 font-cyber">SCANNING_GLOBAL_NODES...</div>
                                )}
                            </div>
                        </section>

                        {/* Critical Threats Panel */}
                        <section className="glass-card p-8 bg-red-500/5 border-red-400/10 group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-white uppercase flex items-center gap-3 tracking-[0.3em] font-cyber">
                                    <AlertOctagon size={18} className="text-red-500 animate-pulse" /> CRITICAL_THREATS
                                </h3>
                                <span className="text-[9px] font-black text-red-500/50 bg-red-500/5 px-3 py-1 rounded-full uppercase border border-red-500/10">{criticalCount} DETECTED</span>
                            </div>
                            <div className="space-y-4">
                                {filteredLogs.filter(f => f.riskLevel === "CRITICAL" || f.riskLevel === "MEDIUM").slice(0, 4).map((log, i) => (
                                    <div key={i} className="p-5 bg-black/60 border border-red-500/10 rounded-2xl hover:border-red-500/20 transition-all">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${log.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-orange-400'}`}>{log.riskLevel}_RISK</div>
                                                <div className="text-[11px] text-white font-black uppercase truncate">{log.candidate?.split('@')[0]}</div>
                                                <div className="text-[9px] text-red-500/50 font-black uppercase mt-1 font-mono">{log.metadata?.ip}</div>
                                            </div>
                                            <div className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20 shrink-0">{log.violationsCount} FLAGS</div>
                                        </div>
                                        {log.anomalyFlags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                                                {log.anomalyFlags.slice(0, 2).map((flag, j) => (
                                                    <span key={j} className="text-[8px] font-black uppercase text-yellow-500/70 bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded-lg tracking-widest">{flag.replace(/_/g, ' ')}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {criticalCount === 0 && (
                                    <div className="text-center py-8 opacity-30">
                                        <Shield size={32} className="mx-auto mb-3 text-gray-500" />
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">No critical threats detected.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Behavioral Biometrics Summary */}
                        <section className="glass-card p-8 border-blue-500/10 bg-blue-500/5">
                            <h3 className="text-xs font-black text-white uppercase mb-6 flex items-center gap-3 tracking-[0.3em] font-cyber">
                                <Cpu size={18} className="text-blue-400" /> BIOMETRIC_SUMMARY
                            </h3>
                            <div className="space-y-4">
                                {['COPY_PASTE_ATTEMPT', 'HOTKEY_BYPASS_ATTEMPT', 'TAB_SWITCH_OR_NOTIFICATION', 'FULLSCREEN_EXIT'].map(type => {
                                    const count = forensicLogs.reduce((acc, f) => acc + (f.violationBreakdown?.[type] || 0), 0);
                                    const maxCount = Math.max(1, ...forensicLogs.map(f => f.violationBreakdown?.[type] || 0));
                                    return (
                                        <div key={type} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{type.replace(/_/g, ' ')}</span>
                                                <span className="text-[10px] font-black text-white">{count}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((count / Math.max(totalViolations, 1)) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Right Column — Main Forensic Table */}
                    <div className="lg:col-span-8">
                        <section className="glass-card bg-[#050505]/80 overflow-hidden border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
                            {/* Table Header */}
                            <div className="px-8 py-6 border-b border-white/5 flex flex-col gap-6 bg-white/[0.02]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                                            <Fingerprint size={20} className="text-teal-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-white uppercase italic tracking-tighter font-cyber leading-none">IDENTITY_AUDIT_LOGS</h2>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">{filteredLogs.length} RECORDS // Auto-refresh: 30s</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input type="text" className="cyber-input w-64 pl-10 py-2.5 text-[10px] bg-black/40"
                                            placeholder="SEARCH_BY_IP_OR_EMAIL..."
                                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2">
                                    {["ALL", "THREATS", "AUTH", "SESSIONS", "AUDIT"].map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all font-cyber ${activeTab === tab ? 'bg-teal-500 text-black border-teal-500' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="overflow-x-auto overflow-y-auto max-h-[900px] custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/60 sticky top-0 z-10 border-b border-white/5">
                                            {activeTab === 'AUDIT' ? (
                                                <>
                                                    <th className="px-6 py-4 text-[9px] font-black text-teal-500 font-cyber uppercase tracking-[0.3em]">Event Type</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em]">Subject / Email</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em]">IP & Client</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em]">Risk Level</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em] text-right">Timestamp</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="px-6 py-4 text-[9px] font-black text-teal-500 font-cyber uppercase tracking-[0.3em]">Subject</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em]">IP / Device</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em]">Risk & Anomalies</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em] text-center">Integrity</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em] text-right">Timestamp</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-gray-500 font-cyber uppercase tracking-[0.3em] text-center">Detail</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {activeTab === 'AUDIT' ? (
                                            auditLogs.length > 0 ? auditLogs.map((log) => (
                                                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-white font-black uppercase text-xs tracking-tighter">{log.event_type}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{log.email || 'System'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] text-gray-500 font-mono">{log.ip_address}</span>
                                                        <div className="text-[8px] text-gray-600 truncate max-w-[150px]">{log.user_agent}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${log.risk_level === 'CRITICAL' ? 'text-red-500 bg-red-500/10 border-red-500/20' : log.risk_level === 'MEDIUM' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-teal-500 bg-teal-500/5 border-teal-500/10'}`}>{log.risk_level}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-[10px] text-white font-black uppercase">{new Date(log.created_at).toLocaleString()}</span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center text-gray-600 uppercase text-[10px] font-black tracking-widest">No audit logs found. Ensure security_audit_log SQL is run.</td>
                                                </tr>
                                            )
                                        ) : (
                                            filteredLogs.map((f) => (
                                            <>
                                                <tr key={f.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === f.id ? null : f.id)}>
                                                    <td className="px-6 py-4 relative">
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-teal-500 transition-all rounded-r-full duration-500"></div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-white font-black uppercase text-xs tracking-tighter">{f.candidate?.split('@')[0] || 'ANON'}</span>
                                                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest truncate max-w-[140px]">{f.job}</span>
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-0.5 w-fit ${f.status === 'AUTH_SUCCESS' ? 'text-teal-500 bg-teal-500/10' : f.status === 'TERMINATED_DUE_TO_VIOLATION' ? 'text-red-500 bg-red-500/10' : 'text-gray-500 bg-white/5'}`}>{f.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-teal-400">
                                                                <Globe size={10} className="opacity-40" /> {f.metadata?.ip || '127.0.0.1'}
                                                            </div>
                                                            {f.metadata?.device_fingerprint && (
                                                                <div className="flex items-center gap-1.5 text-[8px] text-gray-600">
                                                                    <Monitor size={9} /> {f.metadata.device_fingerprint.screen} / {f.metadata.device_fingerprint.platform}
                                                                </div>
                                                            )}
                                                            {f.sessionDuration !== null && (
                                                                <div className="flex items-center gap-1.5 text-[8px] text-gray-500">
                                                                    <Clock size={9} /> {f.sessionDuration}m session
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${f.riskLevel === 'CRITICAL' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                                                                f.riskLevel === 'MEDIUM' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                                                                    f.riskLevel === 'LOW' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
                                                                        'text-teal-500 bg-teal-500/5 border-teal-500/10'
                                                                }`}>{f.riskLevel}</span>
                                                            {f.anomalyFlags?.slice(0, 2).map((flag, i) => (
                                                                <div key={i} className="text-[7px] font-black text-yellow-500/60 uppercase tracking-widest">{flag.replace(/_/g, ' ')}</div>
                                                            ))}
                                                            {f.violationsCount > 0 && (
                                                                <div className="text-[8px] text-red-500 font-black">{f.violationsCount} violation(s)</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`text-lg font-black italic font-cyber ${f.integrityScore > 70 ? 'text-teal-400' : f.integrityScore > 40 ? 'text-orange-400' : 'text-red-500 animate-pulse'}`}>
                                                                {f.integrityScore}
                                                            </span>
                                                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className={`h-full ${f.integrityScore > 70 ? 'bg-teal-500' : f.integrityScore > 40 ? 'bg-orange-400' : 'bg-red-500'}`}
                                                                    style={{ width: `${f.integrityScore}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] text-white font-black uppercase">{new Date(f.timestamp || Date.now()).toLocaleTimeString()}</span>
                                                            <span className="text-[8px] text-gray-600 font-bold uppercase">{new Date(f.timestamp || Date.now()).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-teal-500/10 hover:border-teal-500/20 transition-all text-gray-500 hover:text-teal-400">
                                                            {expandedRow === f.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Detail Row */}
                                                {expandedRow === f.id && (
                                                    <tr key={`${f.id}-expanded`}>
                                                        <td colSpan={6} className="bg-black/60 px-8 py-6 border-b border-teal-500/10">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                {/* Device Fingerprint */}
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[9px] font-black text-teal-500 uppercase tracking-[0.3em] flex items-center gap-2 font-cyber"><Monitor size={12} /> DEVICE_FINGERPRINT</h4>
                                                                    {f.metadata?.device_fingerprint ? (
                                                                        <div className="space-y-1.5">
                                                                            {Object.entries(f.metadata.device_fingerprint).map(([k, v]) => (
                                                                                <div key={k} className="flex justify-between items-center">
                                                                                    <span className="text-[8px] text-gray-600 font-black uppercase">{k}:</span>
                                                                                    <span className="text-[9px] text-gray-300 font-mono">{String(v)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : <p className="text-[9px] text-gray-700 italic">No fingerprint captured. Log out and back in to capture.</p>}
                                                                </div>

                                                                {/* Violation Breakdown */}
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2 font-cyber"><AlertTriangle size={12} /> VIOLATION_BREAKDOWN</h4>
                                                                    {f.violationBreakdown && Object.keys(f.violationBreakdown).length > 0 ? (
                                                                        <div className="space-y-1.5">
                                                                            {Object.entries(f.violationBreakdown).map(([type, count]) => (
                                                                                <div key={type} className="flex justify-between items-center p-2 bg-red-500/5 border border-red-500/10 rounded-xl">
                                                                                    <span className="text-[8px] text-gray-400 font-black uppercase truncate max-w-[120px]">{type.replace(/_/g, ' ')}</span>
                                                                                    <span className="text-[10px] text-red-400 font-black">{count}x</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : <p className="text-[9px] text-gray-700 italic">No violations recorded.</p>}

                                                                    {/* Anomaly Flags */}
                                                                    {f.anomalyFlags?.length > 0 && (
                                                                        <div className="pt-3 border-t border-white/5 space-y-1.5">
                                                                            <div className="text-[8px] text-yellow-500 font-black uppercase tracking-widest mb-2">ANOMALY_FLAGS:</div>
                                                                            {f.anomalyFlags.map((flag, i) => (
                                                                                <div key={i} className="flex items-center gap-2 text-[8px] text-yellow-500/70">
                                                                                    <Zap size={9} /> {flag.replace(/_/g, ' ')}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Behavioral Biometrics & Login History */}
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2 font-cyber"><Activity size={12} /> BIOMETRICS & LOGIN_HIST</h4>
                                                                    {f.biometrics ? (
                                                                        <div className="space-y-1.5 mb-4">
                                                                            {[
                                                                                ['AVG KEYSTROKE (ms)', f.biometrics.avg_keystroke_latency_ms],
                                                                                ['BACKSPACE COUNT', f.biometrics.backspace_count],
                                                                                ['FOCUS LOST', f.biometrics.focus_lost_count],
                                                                                ['COPY-PASTE ATTEMPTS', f.biometrics.copy_paste_attempts],
                                                                                ['ANSWER CHANGES', f.biometrics.answer_changes],
                                                                            ].map(([label, val]) => (
                                                                                <div key={label} className="flex justify-between">
                                                                                    <span className="text-[8px] text-gray-600 uppercase">{label}:</span>
                                                                                    <span className="text-[9px] text-blue-300 font-mono">{val ?? 'N/A'}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : <p className="text-[9px] text-gray-700 italic mb-3">No biometric data (auth event).</p>}

                                                                    {/* Login History */}
                                                                    <div className="pt-3 border-t border-white/5">
                                                                        <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">RECENT LOGINS ({f.loginCount || 0} TOTAL):</div>
                                                                        {f.loginHistory?.length > 0 ? f.loginHistory.map((lh, i) => (
                                                                            <div key={i} className="text-[8px] text-gray-600 font-mono mb-1 flex items-center gap-1.5">
                                                                                <Globe size={8} /> {lh.ip} — {new Date(lh.timestamp).toLocaleString()}
                                                                            </div>
                                                                        )) : <p className="text-[9px] text-gray-700 italic">No login history available.</p>}
                                                                    </div>

                                                                    {/* Integrity Hash */}
                                                                    <div className="pt-3 border-t border-white/5">
                                                                        <div className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">INTEGRITY_HASH:</div>
                                                                        <div className="text-[7px] text-gray-600 font-mono break-all">{f.integrityHash}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                        )}
                                        {activeTab !== 'AUDIT' && filteredLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center">
                                                    <Shield size={40} className="mx-auto mb-4 text-gray-700" />
                                                    <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest">No forensic data available.</p>
                                                    <p className="text-[9px] text-gray-700 mt-2">Ensure your account has ADMIN role in the database.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

const StatPill = ({ label, value, color, bg }) => (
    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${bg}`}>
        <span className={`text-xl font-black font-cyber italic ${color}`}>{value}</span>
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
    </div>
);

const MetricCard = ({ icon, label, value, sub, color, variant = 'default' }) => (
    <div className={`glass-card p-8 group hover:translate-y-[-5px] transition-all duration-700 relative overflow-hidden ${variant === 'danger' ? 'border-red-500/20' : 'shadow-[0_0_50px_rgba(0,0,0,0.3)]'}`}>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 ${color} group-hover:scale-110 transition-transform duration-500`}>{icon}</div>
        </div>
        <div className="space-y-2">
            <div className="text-3xl font-black font-cyber italic text-white tracking-wider">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{label}</div>
            <div className="pt-4 border-t border-white/5 mt-4">
                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">{sub}</span>
            </div>
        </div>
    </div>
);
