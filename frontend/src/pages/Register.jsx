import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    UserPlus, Shield, ArrowRight, Fingerprint,
    Database, Cpu, Zap, Activity, ShieldAlert,
    Key, User, Globe, ChevronRight
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
        <div className="min-h-screen bg-[#030303] relative flex items-center justify-center font-sans py-20 px-8 overflow-hidden select-none">
            {/* Cinematic Background Elements */}
            <div className="noise-overlay"></div>
            <div className="scanline"></div>
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 blur-[150px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <div className="glass-card p-0 bg-black/60 border-blue-500/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden group">
                    {/* Kernel Provisioning Header HUD */}
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 border border-white/10 p-0.5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-glow"></div>
                            </div>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] font-cyber ml-2">Kernel_Provisioning_v3.5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Database size={10} className="text-blue-500/50" />
                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">ECC_VAULT_ACTIVE</span>
                        </div>
                    </div>

                    <div className="p-10 md:p-14 space-y-10 relative">
                        {/* Internal HUD Elements */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 italic text-[60px] font-black font-cyber select-none pointer-events-none underline decoration-blue-500/20 decoration-4 underline-offset-[-15px]">INIT</div>

                        <div className="text-center space-y-5 relative z-10">
                            <div className="mx-auto w-16 h-16 bg-blue-500 flex items-center justify-center rounded-[1.5rem] shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-transform duration-700 group-hover:scale-110 mb-6 border border-white/10">
                                <UserPlus className="text-black" size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase font-cyber leading-none">NODE_INIT</h1>
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-px w-6 bg-blue-500/20"></div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.5em] font-black">Register_Protocol_Identity</p>
                                <div className="h-px w-6 bg-blue-500/20"></div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2 group/field">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] font-cyber italic">IDENTIFIER_LINK:</label>
                                    <Globe size={10} className="text-gray-700 group-focus-within/field:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className="cyber-input py-4 bg-black/60 border border-white/5 focus:border-blue-500/40 text-xs font-bold tracking-tight rounded-[1rem] transition-all duration-500 placeholder:text-gray-800"
                                    placeholder="subject@neurox.net"
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 group/field">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] font-cyber italic">ENCRYPTION_KEY:</label>
                                    <Key size={10} className="text-gray-700 group-focus-within/field:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="cyber-input py-4 bg-black/60 border border-white/5 focus:border-blue-500/40 text-xs font-bold tracking-tight rounded-[1rem] transition-all duration-500 placeholder:text-gray-800"
                                    placeholder="••••••••••••"
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 group/field">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] font-cyber italic">NODE_PERM_LEVEL:</label>
                                    <Cpu size={10} className="text-gray-700 group-focus-within/field:text-blue-500 transition-colors" />
                                </div>
                                <div className="relative group/select">
                                    <select
                                        className="cyber-input py-4 bg-black/60 border border-white/5 focus:border-blue-500/40 text-xs font-bold tracking-tight rounded-[1rem] transition-all duration-500 appearance-none cursor-pointer pr-10 outline-none"
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        value={form.role}
                                    >
                                        <option value="CANDIDATE" className="bg-[#0f172a] text-white">L1_ACCESS: Candidate_Node</option>
                                        <option value="RECRUITER" className="bg-[#0f172a] text-white">L2_ACCESS: Recruiter_Node</option>
                                        <option value="ADMIN" className="bg-[#0f172a] text-white">L3_ACCESS: Admin_Forensics</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500/40 group-hover/select:text-blue-500 transition-colors">
                                        <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cyber-button bg-blue-600 hover:bg-blue-500 text-white py-4 text-sm font-black italic tracking-widest flex items-center justify-center gap-3 mt-8 shadow-[0_20px_40px_rgba(37,99,235,0.2)] group/btn transition-all duration-500 active:scale-95"
                            >
                                {loading ? (
                                    <Activity className="animate-spin text-white" size={16} />
                                ) : (
                                    <>EXEC_PROVISION_NODE <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        <div className="text-center space-y-10 relative z-10 pt-2">
                            <Link to="/login" className="inline-block text-[10px] text-gray-600 hover:text-white transition-all duration-500 uppercase font-black tracking-[0.4em] font-cyber italic hover:underline underline-offset-8 decoration-blue-500/50">
                                <span className="text-blue-500 mr-2">&lt;</span> Return_To_Gateway_Portal
                            </Link>

                            <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/5 opacity-20">
                                <div className="flex flex-col items-center gap-2 group/icon transition-opacity hover:opacity-100">
                                    <Shield size={14} className="text-gray-500" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">AES_256</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 group/icon transition-opacity hover:opacity-100">
                                    <Database size={14} className="text-gray-500" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">VAULT_L4</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 group/icon transition-opacity hover:opacity-100">
                                    <Fingerprint size={14} className="text-gray-500" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">BIO_SYNC</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center px-6 text-gray-800 font-black text-[8px] uppercase tracking-[0.6em] font-cyber italic">
                    <span>Provisioning_Service_Sovereign</span>
                    <span>L3_Kernel_Access</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
