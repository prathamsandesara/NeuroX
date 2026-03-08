import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
    Shield, ArrowRight, Fingerprint, Activity, Key, User
} from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Compute device fingerprint for Admin forensic logging
            const fingerprint = {
                screen: `${window.screen.width}x${window.screen.height}`,
                colorDepth: window.screen.colorDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                platform: navigator.platform,
                language: navigator.language,
                cores: navigator.hardwareConcurrency || 'N/A',
                touch: navigator.maxTouchPoints > 0,
                memory: navigator.deviceMemory || 'N/A',
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
        <div className="min-h-screen bg-[#030303] relative flex items-center justify-center font-sans py-10 px-6 overflow-hidden select-none">
            {/* Cinematic Background */}
            <div className="noise-overlay"></div>
            <div className="scanline"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[150px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <div className="glass-card p-0 bg-black/60 border-teal-500/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden group">

                    {/* Security Header HUD */}
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/20"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/20"></div>
                            </div>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] font-cyber ml-2">Secure_Auth_Gateway_v4.5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Shield size={10} className="text-teal-500/50" />
                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">AES_256_ACTIVE</span>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 space-y-6 relative">
                        {/* Watermark */}
                        <div className="absolute top-0 right-0 p-6 opacity-5 italic text-[50px] font-black font-cyber select-none pointer-events-none">LOGIN</div>

                        {/* Logo & Title */}
                        <div className="text-center space-y-3 relative z-10">
                            <div className="mx-auto w-12 h-12 bg-teal-500 flex items-center justify-center rounded-xl shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-transform duration-700 group-hover:scale-110 mb-4 border border-white/10">
                                <Fingerprint className="text-black" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase font-cyber leading-none">NODE_ACCESS</h1>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-px w-4 bg-teal-500/20"></div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em] font-black">Authorized_Credentials_Only</p>
                                <div className="h-px w-4 bg-teal-500/20"></div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            <div className="space-y-1.5 group/field">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="text-[8px] font-black text-teal-400 uppercase tracking-[0.3em] font-cyber italic">IDENTIFIER_STUB:</label>
                                    <User size={10} className="text-gray-700 group-focus-within/field:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className="cyber-input py-3 bg-black/60 border border-white/5 focus:border-teal-500/40 text-xs font-bold tracking-tight rounded-xl transition-all duration-500 placeholder:text-gray-800"
                                    placeholder="root@neurox.cloud"
                                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5 group/field">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="text-[8px] font-black text-teal-400 uppercase tracking-[0.3em] font-cyber italic">PASSPHRASE_KEY:</label>
                                    <Key size={10} className="text-gray-700 group-focus-within/field:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="cyber-input py-3 bg-black/60 border border-white/5 focus:border-teal-500/40 text-xs font-bold tracking-tight rounded-xl transition-all duration-500 placeholder:text-gray-800"
                                    placeholder="••••••••••••"
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cyber-button cyber-button-primary py-3.5 text-xs font-black italic tracking-widest flex items-center justify-center gap-2 mt-6 shadow-[0_20px_40px_rgba(20,184,166,0.2)] group/btn"
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={14} />
                                ) : (
                                    <>EXEC_DECRYPT_LOGIN <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="text-center pt-2 relative z-10">
                            <Link to="/register" className="inline-block text-[9px] text-gray-600 hover:text-white transition-all duration-500 uppercase font-black tracking-[0.3em] font-cyber italic hover:underline underline-offset-8 decoration-teal-500/50">
                                <span className="text-teal-500 mr-2">&gt;</span> Initialize_New_Protocol_Node
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-between items-center px-6 text-gray-800 font-black text-[8px] uppercase tracking-[0.5em] font-cyber italic">
                    <span>NeuroX_Security_Group_OS</span>
                    <span>v4.5.2_Build_Final</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
