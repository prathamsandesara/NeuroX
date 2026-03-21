import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    UserPlus, ArrowRight, Fingerprint, Database, Cpu, Activity, ShieldAlert,
    Key, Globe, ChevronRight, Lock
} from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', role: 'CANDIDATE' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('PROVISIONING_COMPLETE: VERIFICATION_REQUIRED');
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (error) {
            toast.error(error.response?.data?.error || 'PROVISIONING_INTERRUPTED: KERNEL_HALT');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] relative flex items-center justify-center p-6 overflow-hidden transition-colors duration-300">
            {/* Cinematic Background Elements */}
            <div className="noise-overlay" />
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-glow-teal opacity-20 dark:opacity-30 pointer-events-none" />

            <div className="w-full max-w-[460px] relative z-10">
                <div className="glass-card overflow-hidden">
                    {/* Kernel Provisioning Header HUD */}
                    <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] font-cyber">Node_Init_Sequence</span>
                        </div>
                        <Database size={12} className="text-blue-500/40" />
                    </div>

                    <div className="p-10 md:px-12 md:py-10 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-blue-500/10 flex items-center justify-center rounded-2xl border border-blue-500/20 shadow-sm mb-6">
                                <UserPlus className="text-blue-600 dark:text-blue-400" size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase font-cyber italic">
                                SYSTEM_ENROLL
                            </h1>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.4em] font-bold">
                                Establish_Secure_Identity
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400/80 uppercase tracking-widest ml-1 font-cyber">IDENTIFIER_LINK</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                    <input
                                        type="email"
                                        className="cyber-input pl-12 focus:border-blue-500/50"
                                        placeholder="subject@neurox.io"
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400/80 uppercase tracking-widest ml-1 font-cyber">ENCRYPTION_KEY</label>
                                <div className="relative">
                                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                    <input
                                        type="password"
                                        className="cyber-input pl-12 focus:border-blue-500/50"
                                        placeholder="••••••••••••"
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group/field">
                                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400/80 uppercase tracking-widest ml-1 font-cyber">ACCESS_LEVEL</label>
                                <div className="relative group/select">
                                    <Cpu size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] z-10" />
                                    <select
                                        className="cyber-input pl-12 pr-10 focus:border-blue-500/50 appearance-none cursor-pointer"
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        value={form.role}
                                    >
                                        <option value="CANDIDATE" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">L1_ACCESS: Candidate_Node</option>
                                        <option value="RECRUITER" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">L2_ACCESS: Recruiter_Node</option>
                                        <option value="ADMIN" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">L3_ACCESS: Admin_Forensics</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-hover/select:text-blue-500 transition-colors">
                                        <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cyber-button mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_25px_rgba(37,99,235,0.3)] border-transparent"
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={16} />
                                ) : (
                                    <>INITIALIZE_NODE <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <Link to="/login" className="text-[10px] text-[var(--text-secondary)] hover:text-blue-610 dark:hover:text-blue-400 transition-colors uppercase font-bold tracking-widest font-cyber italic border-b border-transparent hover:border-blue-500/50 pb-1">
                                Return_To_Gateway
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center px-4 text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--text-secondary)] font-cyber italic opacity-50 transition-colors duration-300">
                    <span>Provisioning_Service</span>
                    <span>NX_V3.5_CORE</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
