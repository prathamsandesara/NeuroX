import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import {
    Cpu, Zap, Shield, FileText, Upload,
    ArrowRight, Lock, CheckCircle, Clock,
    Globe, Terminal, AlertCircle, RefreshCw,
    Activity, Radar, Target, User
} from "lucide-react";
import toast from "react-hot-toast";

export default function CandidateDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProfileAndJobs();
    }, []);

    const fetchProfileAndJobs = async () => {
        try {
            const [profileRes, jobsRes] = await Promise.all([
                api.get("/api/auth/me"),
                api.get("/api/jobs")
            ]);
            setUser(profileRes.data.user);
            setResumeUrl(profileRes.data.user?.resume_url);
            setJobs(jobsRes.data);
        } catch (error) {
            console.error("Dashboard sync error:", error);
            toast.error("MISSION_SYNC_ERROR: RECONNECTING...");
        } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("resume", file);

        setUploading(true);
        try {
            const { data } = await api.post("/api/candidate/resume", formData);
            setResumeUrl(data.resumeUrl);
            toast.success("BIOMETRIC_DATA_UPLOADED: RESUME_SYNCED");
        } catch (error) {
            toast.error(error.response?.data?.error || "UPLOAD_FAILED: STORAGE_OFFLINE");
        } finally {
            setUploading(false);
        }
    };

    const handleResumeDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your resume? This will remove your experience-based personalization for upcoming exams.")) return;
        
        try {
            await api.post("/api/auth/delete-resume");
            setResumeUrl(null);
            toast.success("BIOMETRIC_DATA_PURGED: RESUME_REMOVED");
        } catch (error) {
            toast.error("DELETE_FAILED: CORE_DATABASE_SYNC_ERROR");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-cyber text-teal-400 overflow-hidden relative transition-colors duration-300">
            <div className="noise-overlay" />
            <div className="absolute inset-0 bg-glow-teal opacity-20 pointer-events-none animate-pulse" />
            <div className="relative">
                <div className="w-24 h-24 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-[spin_2s_linear_infinite] mb-8" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Target size={24} className="animate-pulse" />
                </div>
            </div>
            <div className="tracking-[0.8em] animate-pulse text-[10px] font-bold uppercase text-[var(--text-secondary)]">Syncing_Mission_Control...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans pb-32 cyber-grid relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background */}
            <div className="noise-overlay" />
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-glow-teal opacity-10 dark:opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-glow-blue opacity-5 dark:opacity-10 pointer-events-none" />

            <header className="max-w-7xl mx-auto px-10 pt-16 flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10 animate-in fade-in slide-in-from-top-12 duration-1000">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="px-4 py-1 bg-teal-500 text-white dark:text-black font-black text-[9px] rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                                <Activity size={10} className="animate-pulse" />
                                CANDIDATE_NODE_v4.5
                            </div>
                            <div className="absolute -inset-1 bg-teal-500 opacity-20 blur-md rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-glow"></div>
                            <span className="text-teal-600 dark:text-teal-400 text-[9px] font-black tracking-widest uppercase italic">SIGNAL_OPTIMAL</span>
                        </div>
                    </div>
                    <div className="relative group">
                        <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] italic tracking-tighter font-cyber uppercase leading-none mb-4 relative z-10">
                            MISSION_<span className="text-teal-600 dark:text-teal-400">CONTROL</span>
                        </h1>
                        <div className="absolute -left-4 top-0 w-1 h-full bg-teal-500 rounded-full group-hover:h-1/2 transition-all duration-700" />
                        <p className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.6em] flex items-center gap-3 opacity-60">
                            <Target size={12} className="text-teal-500" />
                            ID_VERIFIED // {user?.email || 'AUTH_ACTIVE'}
                        </p>
                    </div>
                </div>

                {/* Biometric Upload Card */}
                <div className="glass-card p-8 min-w-[320px] border-white/5 bg-white/[0.01] relative group overflow-hidden shadow-2xl transition-all duration-700 hover:border-teal-500/30">
                    <div className="scanline opacity-5"></div>
                    <div className="absolute top-0 right-0 p-3 opacity-5 italic text-[9px] font-black font-cyber">STUB_BIOMETRIC_v4</div>

                    <div className="flex items-center gap-5 mb-6 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ${resumeUrl ? 'bg-teal-500/10 text-teal-600 dark:text-teal-500 border border-teal-500/20 shadow-sm' : 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20 animate-pulse'}`}>
                            {resumeUrl ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div>
                            <div className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tighter mb-0.5 font-cyber">{resumeUrl ? 'RESUME_STUB_LOCKED' : 'STUB_DATA_EMPTY'}</div>
                            <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-50">{resumeUrl ? 'Sync_Complete_L4' : 'Action_Required_L1'}</div>
                        </div>
                    </div>

                    <div className={`block w-full ${resumeUrl || uploading ? 'cursor-not-allowed' : 'cursor-pointer'} relative z-10`}>
                        <input 
                            type="file" 
                            id="resume-upload"
                            className="hidden" 
                            onChange={handleResumeUpload} 
                            accept=".pdf" 
                            disabled={!!resumeUrl || uploading}
                        />
                        <button 
                            onClick={() => !resumeUrl && !uploading && document.getElementById('resume-upload').click()}
                            disabled={!!resumeUrl || uploading}
                            className={`cyber-button bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] flex items-center justify-center gap-3 w-full py-3 group/btn transition-all duration-700 shadow-sm ${resumeUrl || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-500/50 cursor-pointer'}`}
                        >
                            {uploading ? <RefreshCw className="animate-spin text-teal-500" size={14} /> : <Upload size={14} className={`${!(resumeUrl || uploading) && 'group-hover/btn:scale-125'} transition-transform`} />}
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] italic font-cyber">{resumeUrl ? 'RESUME_ALREADY_UPLOADED' : 'INITIALIZE_UPLOAD'}</span>
                        </button>
                        
                        {resumeUrl && !uploading && (
                            <button 
                                onClick={handleResumeDelete}
                                className="mt-4 w-full py-2 text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-[0.3em] transition-colors font-cyber flex items-center justify-center gap-2 group/del"
                            >
                                <RefreshCw size={10} className="group-hover/del:rotate-180 transition-transform duration-500" />
                                PURGE_EXISTING_STUB [DELETE]
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-10 mt-24 space-y-24 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                {/* Active Assessment Ops */}
                <section className="space-y-10">
                    <div className="flex items-center justify-between border-l-4 border-teal-500 pl-6">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter font-cyber italic leading-none mb-2">OPERATIONAL_PHASES</h2>
                            <p className="text-[10px] text-teal-600 dark:text-teal-500/50 uppercase tracking-[0.4em] font-black">Identified_Nodes // Tactical_Alignment_v4.5</p>
                        </div>
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10"></div>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job) => (
                            <div key={job.id} className="glass-card p-8 group relative overflow-hidden flex flex-col min-h-[400px] hover:border-teal-500/30 transition-all duration-700 shadow-xl">
                                <div className="scanline opacity-0 group-hover:opacity-10"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/0 to-transparent group-hover:via-teal-500 opacity-100 transition-all duration-1000"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-4 py-1.5 rounded-full border border-[var(--border-primary)] uppercase tracking-widest w-fit shadow-sm">
                                            NODE_{job.id.substring(0, 6)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-primary)] shadow-sm">
                                        <div className={`w-1.5 h-1.5 rounded-full ${job.difficulty_level === 'EXPERT' ? 'bg-red-500 animate-pulse' : 'bg-teal-500 animate-glow'}`}></div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${job.difficulty_level === 'EXPERT' ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}>{job.difficulty_level}</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-700 italic tracking-tighter uppercase leading-tight relative z-10">
                                    {job.title}
                                </h3>
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Cpu size={12} className="text-teal-500/60" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-cyber">{job.domain || 'SYSTEMS'}</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-primary)]"></div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Shield size={12} className="text-blue-500/60" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-cyber">L4_SECURE</span>
                                    </div>
                                </div>

                                <p className="text-sm text-[var(--text-secondary)] font-sans line-clamp-3 mb-10 leading-relaxed font-medium relative z-10 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                    {job.description || "Initializing mission parameters. Skill alignment synchronization required for assessment entry. Proceed with caution."}
                                </p>

                                <div className="mt-auto pt-8 border-t border-[var(--border-primary)] flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm group-hover:border-teal-500/30 transition-colors">
                                            <Clock size={16} className="text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-50 lg:mb-1">DURATION</div>
                                            <div className="text-[12px] font-black text-[var(--text-primary)] uppercase italic tracking-wider">60_MINUTES</div>
                                        </div>
                                    </div>
                                    <a
                                        href={job.assessments?.[0] ? `/candidate/assessment/${job.assessments[0].id}` : '#'}
                                        className="w-14 h-14 bg-teal-500 text-white dark:text-black rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 group/btn relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-12" />
                                        <ArrowRight size={24} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none transform group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-1000 rotate-12">
                                    <Target size={200} className="text-teal-500" />
                                </div>
                            </div>
                        ))}

                        {jobs.length === 0 && (
                            <div className="col-span-full py-32 glass-card flex flex-col items-center justify-center border-dashed border-white/10 bg-white/[0.01]">
                                <Radar size={64} className="text-gray-800 mb-8 animate-pulse" />
                                <p className="text-base font-black uppercase tracking-[0.8em] text-gray-700 italic">No_Terminal_Missions_Found</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer STATS HUD */}
                <footer className="pt-16 border-t border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-center gap-10 group transition-colors duration-300">
                    <div className="flex gap-12">
                        <FooterStat icon={<Shield size={18} />} label="CORE_INTEGRITY" value="100%" color="text-teal-600 dark:text-teal-500" />
                        <FooterStat icon={<Cpu size={18} />} label="CORE_LATENCY" value="12MS" color="text-blue-600 dark:text-blue-500" />
                        <FooterStat icon={<Globe size={18} />} label="NODE_REGION" value="US_EAST_NY" color="text-purple-600 dark:text-purple-500" />
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] transition-colors duration-1000 group-hover:text-teal-500/50 font-cyber italic opacity-50">
                        &copy; 2026 NEUROX_OS // MISSION_CENTRAL // v4.5.2
                    </div>
                </footer>
            </main>
        </div>
    );
}

function FooterStat({ icon, label, value, color }) {
    return (
        <div className="flex items-center gap-4 group/stat cursor-default">
            <div className={`p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl transition-all duration-700 group-hover/stat:border-current ${color}/20 flex items-center justify-center shadow-sm`}>
                <div className={`${color} opacity-40 group-hover/stat:opacity-100 transition-opacity duration-700`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-0.5 opacity-50">{label}</div>
                <div className="text-[11px] font-black text-[var(--text-primary)] uppercase italic tracking-tighter tabular-nums">{value}</div>
            </div>
        </div>
    );
}

function AlertTriangle({ size, className }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
