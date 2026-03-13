import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Fingerprint, Activity, Key, User, Lock } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fingerprint = {
                screen: `${window.screen.width}x${window.screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                platform: navigator.platform,
                cores: navigator.hardwareConcurrency || 'N/A',
            };
            const data = await login(credentials.email, credentials.password, fingerprint);
            const role = data.user.role;

            if (role === 'ADMIN') navigate('/admin/dashboard');
            else if (role === 'RECRUITER' || role === 'HR') navigate('/recruiter/dashboard');
            else if (role === 'CANDIDATE') navigate('/candidate/dashboard');
            else navigate('/');

            toast.success('DECRYPTION_SUCCESS: ACCESS_GRANTED');
        } catch (err) {
            toast.error(err.response?.data?.error || 'AUTH_FAILURE: INVALID_CREDENTIALS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020204] relative flex items-center justify-center p-6 overflow-hidden">
            <div className="noise-overlay" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-glow-teal opacity-30 pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10">
                <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
                    {/* HUD Header */}
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                                <div className="w-1 h-1 rounded-full bg-teal-500/20" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-cyber">Auth_Protocol_v3</span>
                        </div>
                        <Lock size={12} className="text-teal-500/40" />
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-teal-500/10 flex items-center justify-center rounded-2xl border border-teal-500/20 shadow-neon mb-6">
                                <Fingerprint className="text-teal-400" size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase font-cyber italic">
                                SECURE_LOGIN
                            </h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-bold">
                                Identity_Verification_Required
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest ml-1 font-cyber">IDENTIFIER</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="email"
                                        className="cyber-input pl-12"
                                        placeholder="user@neurox.io"
                                        onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest ml-1 font-cyber">PASSPHRASE</label>
                                <div className="relative">
                                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="password"
                                        className="cyber-input pl-12"
                                        placeholder="••••••••"
                                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cyber-button cyber-button-primary mt-4 py-4"
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={16} />
                                ) : (
                                    <>AUTHORIZE_ACCESS <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <Link to="/register" className="text-[10px] text-slate-500 hover:text-teal-400 transition-colors uppercase font-bold tracking-widest font-cyber italic border-b border-transparent hover:border-teal-500/50 pb-1">
                                Initialize_New_Node
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Technical Footer */}
                <div className="mt-8 flex justify-between items-center px-2 text-[10px] uppercase font-bold tracking-[0.4em] text-slate-700 font-cyber italic">
                    <span>NX_OS_TERMINAL</span>
                    <span>B_704_FINAL</span>
                </div>
            </div>
        </div>
    );
};

export default Login;

