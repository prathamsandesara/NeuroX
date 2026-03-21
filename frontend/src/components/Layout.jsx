import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, Search, Fingerprint, Terminal } from 'lucide-react';

import ThemeToggle from './ThemeToggle';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans selection:bg-teal-500/30 transition-colors duration-300">
            {/* 7-Star Cinematic Textures */}
            <div className="noise-overlay"></div>
            <div className="scanline"></div>
            <nav className="border-b border-[var(--border-primary)] bg-[var(--glass-bg)] backdrop-blur-2xl sticky top-0 z-[100] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-10">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-7 h-7 bg-teal-500 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center">
                                    <Shield size={16} className="text-white dark:text-black" />
                                </div>
                                <span className="text-lg font-black text-[var(--text-primary)] italic tracking-tighter font-cyber uppercase group-hover:text-teal-400 transition-colors">NeuroX</span>
                            </Link>

                            {user && (
                                <div className="hidden md:flex items-center gap-6 ml-4">
                                    {user.role === 'ADMIN' && (
                                        <NavLink to="/admin/dashboard" icon={<Fingerprint size={11} />} label="FOREN_HUD" />
                                    )}
                                    {(user.role === 'RECRUITER' || user.role === 'HR') && (
                                        <NavLink to="/recruiter/dashboard" icon={<LayoutDashboard size={11} />} label="COMMAND_CENTER" />
                                    )}
                                    {user.role === 'CANDIDATE' && (
                                        <NavLink to="/candidate/dashboard" icon={<Terminal size={11} />} label="MISSION_CTRL" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                            <ThemeToggle />
                            <div className="w-px h-6 bg-[var(--border-primary)]"></div>
                            {user ? (
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest">{user.email.split('@')[0]}</span>
                                        <span className="text-[7px] font-black text-teal-500/50 uppercase tracking-[0.2em]">{user.role}_NODE</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
                                        title="TERMINATE_SESSION"
                                    >
                                        <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors px-4 py-2">ACCESS_LOGIN</Link>
                                    <Link to="/register" className="cyber-button cyber-button-primary px-6 py-2.5 text-[10px]">INITIALIZE_NODE</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative">
                <Outlet />
            </main>
        </div>
    );
};

const NavLink = ({ to, label, icon }) => (
    <Link to={to} className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all group">
        <span className="text-teal-500/30 group-hover:text-teal-500 transition-colors">{icon}</span>
        {label}
    </Link>
);

export default Layout;
