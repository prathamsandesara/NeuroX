import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import {
    Briefcase, Users, ShieldAlert, BarChart3, Plus,
    Search, Filter, ExternalLink, Zap, Lock, Unlock,
    MoreVertical, Download, Eye, Terminal, Cpu, Shield,
    Activity, TrendingUp, Target, Database, Github, ArrowRight,
    Clock, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Monitor, Wifi, Trash2
} from "lucide-react";
import ManualQuestionModal from '../components/ManualQuestionModal';
import HRCharts from '../components/HRCharts';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    // State
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('INSIGHTS'); // INSIGHTS | JOBS | CANDIDATES
    const [loading, setLoading] = useState(true);

    // Provisioning Form
    const [jdForm, setJdForm] = useState({
        title: '', jdText: '', expMin: 1, expMax: 5, domain: 'IT',
        mcqCount: 3, subjectiveCount: 2, codingCount: 1
    });
    const [provisioning, setProvisioning] = useState(false);

    // Modal State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [jobsRes, candRes, statsRes] = await Promise.all([
                api.get('/api/jobs'),
                api.get('/api/recruiter/candidates'),
                api.get('/api/recruiter/stats')
            ]);
            setJobs(jobsRes.data);
            setCandidates(candRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Data retrieval error:", error);
            toast.error("Failed to sync with NeuroX Cloud");
        } finally {
            setLoading(false);
        }
    };

    const handleProvisionJob = async (e) => {
        e.preventDefault();
        setProvisioning(true);
        try {
            await api.post('/api/jobs/parse', {
                jd_text: jdForm.jdText,
                job_title: jdForm.title,
                experience_min: parseInt(jdForm.expMin),
                experience_max: parseInt(jdForm.expMax),
                domain: jdForm.domain,
                mcq_count: parseInt(jdForm.mcqCount),
                subjective_count: parseInt(jdForm.subjectiveCount),
                coding_count: parseInt(jdForm.codingCount)
            });
            toast.success('JOB_PROVISION_COMPLETE');
            setJdForm({ title: '', jdText: '', expMin: 1, expMax: 5, domain: 'IT', mcqCount: 3, subjectiveCount: 2, codingCount: 1 });
            fetchAllData();
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'PROVISIONING_FAILED: ML_SERVICE_OFFLINE';
            toast.error(errorMsg);
        } finally {
            setProvisioning(false);
        }
    };

    const handleDeleteAssessment = async (jobId, assessmentId) => {
        if (!window.confirm("CRITICAL_ACTION: This will purge ALL associated data (Questions, Submissions, Violations). Proceed?")) return;

        try {
            await api.delete(`/api/admin/assessment/${assessmentId}`);
            toast.success('NODE_PURGED_FROM_CORES');
            fetchAllData();
        } catch (error) {
            console.error("Purge error:", error);
            toast.error('PURGE_FAILED: ACCESS_DENIED');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-cyber text-teal-400 overflow-hidden relative transition-colors duration-300">
            <div className="noise-overlay" />
            <div className="absolute inset-0 bg-glow-teal opacity-20 animate-pulse pointer-events-none" />
            <div className="relative">
                <div className="w-24 h-24 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-[spin_2s_linear_infinite] mb-8" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity size={24} className="animate-pulse" />
                </div>
            </div>
            <div className="tracking-[0.8em] animate-pulse text-[10px] font-bold uppercase text-[var(--text-secondary)]">Synchronizing_Neural_Core...</div>
        </div>
    );

    const aggregatedCandidates = Object.values(
        candidates.reduce((acc, curr) => {
            const key = `${curr.users?.email}-${curr.assessments?.jobs?.title}`;
            const currViolations = curr.proctoring_violations?.length || 0;
            const accViolations = acc[key]?.proctoring_violations?.length || 0;
            if (!acc[key] || currViolations > accViolations) {
                acc[key] = curr;
            }
            return acc;
        }, {})
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans pb-32 cyber-grid relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background */}
            <div className="noise-overlay" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-glow-teal opacity-10 dark:opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-glow-blue opacity-5 dark:opacity-10 pointer-events-none" />

            {/* Sub Navigation / Tab Bar */}
            <div className="px-8 mt-10 z-40 relative transition-colors duration-300">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 px-10 glass-card border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-6">
                        <div className="p-2.5 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                            <Target className="text-teal-600 dark:text-teal-500" size={18} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[var(--text-primary)] italic tracking-tighter font-cyber uppercase leading-none mb-0.5">COMMAND_CENTER</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.4em] opacity-50">Sub_System_Active / Node: {activeTab}</p>
                                <div className="h-2 w-[1px] bg-[var(--border-primary)] mx-1"></div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded-md text-[7px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    <Wifi size={8} /> {window.location.hostname}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-[var(--bg-primary)] p-1 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                        {['INSIGHTS', 'JOBS', 'CANDIDATES'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] transition-all duration-500 ${activeTab === tab ? 'bg-teal-500 text-white dark:text-black shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 py-12 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                {/* Insights Tab */}
                {activeTab === 'INSIGHTS' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard icon={<Briefcase size={20} />} label="ACTIVE_DEPLOYMENTS" value={jobs.length} sub="LIVE_NODES" color="text-blue-500" />
                            <StatCard icon={<Users size={20} />} label="IDENTIFIED_TALENT" value={candidates.length} sub="SYNCED_SUBJECTS" color="text-teal-500" />
                            <StatCard icon={<ShieldAlert size={20} />} label="SECURITY_BREACHES" value={candidates.filter(c => (c.proctoring_violations?.length || 0) > 0).length} sub="THREATS_DETECTED" color="text-red-500" variant="danger" />
                            <StatCard icon={<TrendingUp size={20} />} label="HEALTH_INDEX" value={`${Math.round(stats?.averageScore || 94)}%`} sub="INTEGRITY_SCORE" color="text-purple-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-1 glass-card p-8 space-y-8 border-teal-500/10 bg-gradient-to-b from-teal-500/5 to-transparent">
                                <form onSubmit={handleProvisionJob} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-teal-600 dark:text-teal-500/50 uppercase tracking-widest ml-1">MISSION_TITLE:</label>
                                        <input
                                            type="text"
                                            className="cyber-input py-3 bg-[var(--bg-primary)] border-[var(--border-primary)]"
                                            placeholder="e.g. SENIOR_BLOCKCHAIN_ENGINEER"
                                            value={jdForm.title}
                                            onChange={e => setJdForm({ ...jdForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-teal-600 dark:text-teal-500/50 uppercase tracking-widest ml-1">RAW_DATA_STREAM:</label>
                                        <textarea
                                            className="cyber-input h-40 resize-none text-[10px] bg-[var(--bg-primary)] border-[var(--border-primary)]"
                                            placeholder="PASTE_REQUIREMENTS_HERE..."
                                            value={jdForm.jdText}
                                            onChange={e => setJdForm({ ...jdForm, jdText: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Question Count Config */}
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[7px] font-black text-blue-500 uppercase tracking-widest ml-1">MCQ_QTY:</label>
                                            <input
                                                type="number"
                                                min="1" max="10"
                                                className="cyber-input py-2 text-center bg-[var(--bg-primary)] border-blue-500/20"
                                                value={jdForm.mcqCount}
                                                onChange={e => setJdForm({ ...jdForm, mcqCount: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[7px] font-black text-purple-500 uppercase tracking-widest ml-1">SUBJ_QTY:</label>
                                            <input
                                                type="number"
                                                min="1" max="5"
                                                className="cyber-input py-2 text-center bg-[var(--bg-primary)] border-purple-500/20"
                                                value={jdForm.subjectiveCount}
                                                onChange={e => setJdForm({ ...jdForm, subjectiveCount: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[7px] font-black text-teal-500 uppercase tracking-widest ml-1">CODE_QTY:</label>
                                            <input
                                                type="number"
                                                min="1" max="3"
                                                className="cyber-input py-2 text-center bg-[var(--bg-primary)] border-teal-500/20"
                                                value={jdForm.codingCount}
                                                onChange={e => setJdForm({ ...jdForm, codingCount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={provisioning}
                                        className="w-full cyber-button cyber-button-primary py-4 group bg-teal-500 text-white dark:text-black"
                                    >
                                        {provisioning ? 'INITIALIZING_KERNEL...' : <>EXEC_PROVISION <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" /> </>}
                                    </button>
                                </form>
                            </div>

                            <div className="lg:col-span-2 glass-card p-8 bg-[var(--bg-secondary)] shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-4 tracking-[0.3em] font-cyber">
                                        <Activity size={18} className="text-teal-600 dark:text-teal-500" /> ANALYTICS_FEED
                                    </h3>
                                    <button onClick={() => setActiveTab('CANDIDATES')} className="text-[9px] text-teal-600 dark:text-teal-500 font-black hover:text-[var(--text-primary)] transition tracking-[0.2em] border-b border-teal-500/20 pb-0.5">VIEW_ALL_METRICS &gt;</button>
                                </div>
                                <div className="h-72 flex items-center justify-center bg-[var(--bg-primary)] rounded-[1.5rem] border border-[var(--border-primary)] relative overflow-hidden group shadow-inner">
                                    <div className="scanline opacity-10"></div>
                                    {stats?.scoreDistribution ? (
                                        <HRCharts data={stats.scoreDistribution} />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest animate-pulse">PULLING_SCORE_CURVE...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="text-[8px] font-black text-gray-600 uppercase mb-1.5">SYSTEM_LOAD</div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 w-3/4 shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="text-[8px] font-black text-gray-600 uppercase mb-1.5">NEURAL_SYNC</div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-1/2 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'JOBS' && (
                    <div className="space-y-12">
                        <div className="flex justify-between items-center px-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-black text-[var(--text-primary)] italic tracking-tighter font-cyber uppercase leading-none mb-2">MISSION_REPOSITORY</h1>
                                <p className="text-[9px] text-teal-600 dark:text-teal-500/50 font-black uppercase tracking-[0.5em] opacity-60">Active_Operational_Profiles_v4.0</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm">
                                    <Filter size={18} />
                                </button>
                                <button className="p-3 bg-teal-500 text-white dark:text-black rounded-xl shadow-lg hover:bg-teal-400 transition-all font-black text-[9px] tracking-widest px-6">CREATE_NODE</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {jobs.map(job => (
                                <div key={job.id} className="glass-card p-7 group relative flex flex-col min-h-[400px] hover:border-teal-500/30 transition-all duration-500 shadow-sm hover:shadow-xl">
                                    <div className="scanline opacity-0 group-hover:opacity-5"></div>
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] group-hover:text-teal-600 dark:group-hover:text-teal-500 transition-colors shadow-sm">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-50">#{job.id.substring(0, 8)}</span>
                                                {job.assessments?.[0]?.id && (
                                                    <button 
                                                        onClick={() => handleDeleteAssessment(job.id, job.assessments[0].id)}
                                                        className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-all"
                                                        title="PURGE_NODE"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                                                <span className="text-[8px] font-black text-teal-600 dark:text-teal-500 tracking-widest uppercase">{job.difficulty_level}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition italic tracking-tighter uppercase leading-tight relative z-10">{job.title}</h3>

                                    <div className="space-y-3 mb-8 relative z-10">
                                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-widest opacity-70">
                                            <Cpu size={12} className="text-teal-600 dark:text-teal-500" /> STATUS: <span className="text-[var(--text-primary)]">{job.assessments?.[0]?.id ? 'DEPLOYED' : 'PENDING'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-widest opacity-70">
                                            <Shield size={12} className="text-blue-600 dark:text-blue-500" /> ENGINE: <span className="text-[var(--text-primary)]">NEURAL_v2</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {job.skills?.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[8px] font-black text-[var(--text-secondary)] uppercase opacity-70">
                                                    {typeof skill === 'object' ? skill.skill_name : skill}
                                                </span>
                                            ))}
                                            {job.skills?.length > 3 && <span className="px-2 py-0.5 text-[8px] font-black text-[var(--text-secondary)] opacity-50">+{job.skills.length - 3} MORE</span>}
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3 pt-6 border-t border-[var(--border-primary)] relative z-10">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.post('/api/recruiter/generate-assessment', { jobId: job.id });
                                                        toast.success('AI_ASSESSMENT_GENERATED');
                                                        fetchAllData();
                                                    } catch (e) {
                                                        toast.error('GENERATION_FAILED');
                                                    }
                                                }}
                                                className="py-3.5 text-[9px] font-black uppercase text-teal-600 dark:text-teal-500 bg-teal-500/5 border border-teal-500/20 rounded-xl hover:bg-teal-500/10 transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                <Zap size={12} className="group-hover/btn:scale-125 transition-transform" /> GEN_AI
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const assessmentId = job.assessments?.[0]?.id;
                                                    if (!assessmentId) return toast.error('INITIALIZE_ASSESSMENT_FIRST');
                                                    setSelectedAssessmentId(assessmentId);
                                                    setIsManualModalOpen(true);
                                                }}
                                                className="py-3.5 text-[9px] font-black uppercase text-blue-600 dark:text-blue-500 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={12} /> MANUAL
                                            </button>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const assessmentId = job.assessments?.[0]?.id;
                                                if (!assessmentId) return toast.error('NO_ASSESSMENT_FOUND');
                                                try {
                                                    await api.post('/api/recruiter/generate-results', { assessmentId });
                                                    toast.success('RE-EVAL_COMPLETE');
                                                    fetchAllData();
                                                } catch (e) {
                                                    toast.error('EVAL_FAILED');
                                                }
                                            }}
                                            className="w-full py-4 text-[9px] font-black uppercase text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl hover:border-teal-500/30 hover:bg-[var(--bg-primary)] transition-all flex items-center justify-center gap-3 shadow-sm"
                                        >
                                            <BarChart3 size={14} /> EXEC_RE_EVALUATION
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Candidates Tab */}
                {activeTab === 'CANDIDATES' && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-black text-[var(--text-primary)] italic tracking-tighter font-cyber uppercase leading-none mb-2">TALENT_AUDIT_TERMINAL</h1>
                                <p className="text-[9px] text-teal-600 dark:text-teal-500/50 font-black uppercase tracking-[0.5em] opacity-60">Forensic_Database / Session_Logs_v2.1</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" size={14} />
                                    <input className="cyber-input w-72 pl-14 py-3 text-[10px] bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-inner" placeholder="FILTER_IDENTIFIER..." />
                                </div>
                                <button className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm">
                                    <Filter size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="glass-card border-[var(--border-primary)] overflow-hidden shadow-2xl transition-colors duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
                                            <th className="px-8 py-5 text-[10px] font-black text-teal-600 dark:text-teal-500 font-cyber uppercase tracking-[0.3em]">Subject_Identifier</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] font-cyber uppercase tracking-[0.3em] opacity-50">Mission_Node</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] font-cyber uppercase tracking-[0.3em] opacity-50">Integrity_Flow</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] font-cyber uppercase tracking-[0.3em] text-center opacity-50">Score_Index</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] font-cyber uppercase tracking-[0.3em] text-right opacity-50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-primary)]">
                                        {aggregatedCandidates.map((c) => (
                                            <tr key={c.id} className="group hover:bg-teal-500/[0.05] transition-colors relative">
                                                <td className="px-8 py-5 min-w-[250px] relative">
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-teal-500 transition-all rounded-r-full duration-500"></div>
                                                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                        <span className="text-[var(--text-primary)] font-black uppercase text-sm tracking-tighter truncate">{c.users?.email?.split('@')[0] || 'ANON'}</span>
                                                        <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest truncate opacity-60">{c.users?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">{c.assessments?.jobs?.title || 'EVAL'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border ${(c.proctoring_violations?.length || 0) > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                                        <ShieldAlert size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{c.proctoring_violations?.length || 0} FLAGS</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className={`text-xl font-black italic font-cyber ${c.score > 70 ? 'text-teal-600 dark:text-teal-400' : 'text-[var(--text-secondary)] opacity-40'}`}>{Math.round(c.score || 0)}%</span>
                                                        <div className="w-20 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner">
                                                            <div className={`h-full ${c.score > 70 ? 'bg-teal-500 glow-teal' : 'bg-[var(--text-secondary)] opacity-20'}`} style={{ width: `${c.score}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => {
                                                                toast.success(`Accessing Audit Profile: ${c.users?.email || 'ANON'}`);
                                                                navigate(`/recruiter/candidates/${c.id}`);
                                                            }}
                                                            className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-secondary)] hover:text-teal-600 dark:hover:text-teal-500 hover:border-teal-500/40 transition-all hover:scale-110 shadow-sm"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {c.users?.resume_url && (
                                                            <a href={c.users.resume_url} target="_blank" className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40 transition-all hover:scale-110 shadow-sm">
                                                                <Download size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <ManualQuestionModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                assessmentId={selectedAssessmentId}
                onComplete={fetchAllData}
            />
        </div>
    );
};

const StatCard = ({ icon, label, value, sub, color, variant = 'default' }) => (
    <div className={`glass-card p-8 group hover:translate-y-[-5px] transition-all duration-700 relative overflow-hidden ${variant === 'danger' ? 'border-red-500/20 bg-red-500/5 shadow-sm' : 'shadow-sm border-[var(--border-primary)]'}`}>
        <div className="flex justify-between items-start mb-6 relative z-10 transition-colors duration-300">
            <div className={`p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] ${color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                {icon}
            </div>
            <div className="flex items-center gap-1 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-1 h-3 bg-current"></div>
                <div className="w-1 h-2 bg-current"></div>
                <div className="w-1 h-1 bg-current"></div>
            </div>
        </div>
        <div className="space-y-2 relative z-10">
            <div className={`text-3xl font-black font-cyber italic text-[var(--text-primary)] tracking-widest group-hover:text-teal-600 dark:group-hover:text-premium-gradient transition-colors animate-in slide-in-from-left duration-1000`}>{value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-50 group-hover:opacity-100 transition-opacity">{label}</div>
            <div className="pt-6 flex items-center justify-between border-t border-[var(--border-primary)] mt-6">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter opacity-40">{sub}</span>
                <Activity size={11} className="text-[var(--text-secondary)] opacity-20" />
            </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent group-hover:via-teal-500/50 transition-all duration-1000"></div>
    </div>
);

export default RecruiterDashboard;
