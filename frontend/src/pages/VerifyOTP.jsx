import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Shield, ArrowRight, Key, MessageSquare,
    Fingerprint, Activity, Lock, Search,
    Cpu, Radar, Target, ChevronRight
} from 'lucide-react';

const VerifyOTP = () => {
    const { verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const email = location.state?.email || '';

    const startCooldown = () => {
        setCooldown(60);
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        if (cooldown > 0 || !email) return;

        setResendLoading(true);
        try {
            await resendOTP(email);
            toast.success('NEW_TOKEN_PROVISIONED: CHECK_INBOX');
            startCooldown();
        } catch (err) {
            toast.error(err.response?.data?.error || 'TOKEN_PROVISION_FAILED: RETRY_LATER');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyOTP(email, otp);
            toast.success('IDENTITY_CYPHER_MATCH: ACCESS_UNLOCKED');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'TOKEN_DECRYPTION_ERROR: INVALID_INPUT');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[var(--bg-primary)] relative flex items-center justify-center font-sans py-20 px-8 overflow-hidden select-none transition-colors duration-300">
            {/* Cinematic Background Elements */}
            <div className="noise-overlay"></div>
            <div className="scanline"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[150px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <div className="glass-card p-0 overflow-hidden group">
                    {/* Identity Verification Header HUD */}
                    <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between transition-colors duration-300">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 border border-[var(--border-primary)] p-0.5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-glow"></div>
                            </div>
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] font-cyber ml-2">Identity_Handshake_v2.5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Lock size={10} className="text-teal-500/50" />
                            <span className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-50">TLS_SECURE_L4</span>
                        </div>
                    </div>

                    <div className="p-10 md:p-14 space-y-10 relative">
                        {/* Internal HUD Elements */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 italic text-[60px] font-black font-cyber select-none pointer-events-none underline decoration-teal-500/20 decoration-4 underline-offset-[-15px]">VERIFY</div>

                        <div className="text-center space-y-5 relative z-10">
                            <div className="mx-auto w-16 h-16 bg-teal-500 flex items-center justify-center rounded-[1.5rem] shadow-sm transition-transform duration-700 group-hover:scale-110 mb-6 border border-white/10 dark:shadow-[0_0_40px_rgba(20,184,166,0.4)]">
                                <Key className="text-white dark:text-black" size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase font-cyber leading-none transition-colors duration-300">VERIFY_STUB</h1>
                            <div className="flex flex-col items-center gap-2 px-6">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.4em] font-black">Decrypting Node Identity For:</p>
                                <div className="px-4 py-1.5 bg-teal-500/5 border border-teal-500/20 rounded-xl">
                                    <span className="text-[10px] text-teal-600 dark:text-teal-500 font-black uppercase tracking-widest font-mono italic">{email || 'UNKNOWN_NODE'}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="space-y-3 pt-4">
                                <div className="flex justify-between items-center ml-2 mb-2">
                                    <label className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em] font-cyber italic">INPUT_DECRYPTION_TOKEN:</label>
                                    <Activity size={10} className="text-teal-500/50 animate-pulse" />
                                </div>
                                <input
                                    type="text"
                                    maxLength="6"
                                    className="w-full text-center text-4xl font-black tracking-[0.6em] font-cyber py-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-teal-500/40 text-[var(--text-primary)] rounded-[1.5rem] transition-all duration-500 outline-none shadow-inner placeholder:text-[var(--border-primary)] group-hover:border-teal-500/20"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    required
                                />
                                <div className="flex items-center justify-center gap-2 pt-3 text-[var(--text-secondary)] font-bold uppercase text-[8px] tracking-widest opacity-50">
                                    <MessageSquare size={10} className="text-[var(--text-secondary)]" />
                                    <span>Token_Provisioned_To_Linked_Terminal</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className={`w-full py-4 text-sm font-black italic tracking-widest flex items-center justify-center gap-3 mt-4 transition-all duration-700 rounded-xl shadow-2xl group/btn ${loading || otp.length < 6 ? 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] opacity-50' : 'bg-teal-500 hover:bg-teal-400 text-white dark:text-black shadow-[0_20px_40px_rgba(20,184,166,0.3)] active:scale-95'}`}
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={16} />
                                ) : (
                                    <>CONFIRM_IDENTITY_HANDSHAKE <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform" /></>
                                )}
                            </button>

                            <div className="flex flex-col items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading || cooldown > 0}
                                    className={`text-[9px] font-black uppercase tracking-[0.3em] font-cyber transition-all duration-300 flex items-center gap-2 ${cooldown > 0 || resendLoading ? 'text-[var(--text-secondary)] opacity-50 cursor-not-allowed' : 'text-teal-500 hover:text-teal-400 hover:scale-105'}`}
                                >
                                    {resendLoading ? (
                                        <Activity size={10} className="animate-spin" />
                                    ) : (
                                        <Radar size={10} className={cooldown > 0 ? '' : 'animate-pulse'} />
                                    )}
                                    {cooldown > 0 ? `REGENERATE_TOKEN_IN_${cooldown}S` : 'REQUEST_NEW_DECRYPTION_TOKEN'}
                                </button>
                                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent"></div>
                            </div>

                        </form>

                        <div className="text-center pt-6 relative z-10 group/abort">
                            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] text-[var(--text-secondary)] hover:text-red-500 transition-all duration-500 uppercase font-black tracking-[0.4em] font-cyber italic border-b border-transparent hover:border-red-500/30 pb-2">
                                <span className="text-red-500 opacity-50 group-hover/abort:opacity-100 transition-opacity">&gt;</span> ABORT_VERIFICATION_PROTOCOL
                            </Link>

                            <div className="flex items-center justify-center gap-8 pt-12 border-t border-[var(--border-primary)] opacity-50">
                                <div className="flex flex-col items-center gap-2 transition-opacity hover:opacity-100">
                                    <Fingerprint size={14} className="text-[var(--text-secondary)]" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">BIO_KEY</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 transition-opacity hover:opacity-100">
                                    <Radar size={14} className="text-[var(--text-secondary)]" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">TRACE_V4</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center px-6 text-[var(--text-secondary)] font-black text-[8px] uppercase tracking-[0.6em] font-cyber italic opacity-50">
                    <span>Multi_Factor_Node_Sync</span>
                    <span>Identity_Assurance_L4</span>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
