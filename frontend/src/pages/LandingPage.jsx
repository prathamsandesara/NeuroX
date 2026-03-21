import { Link } from 'react-router-dom';
import { Shield, Zap, Terminal, Cpu, ArrowRight, Activity, Disc, Lock, Fingerprint } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300">
            {/* Background Effects */}
            <div className="noise-overlay" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-glow-teal opacity-30 dark:opacity-50 pointer-events-none" />
            
            {/* Neural Background Elements */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-[0.03] dark:opacity-10">
                <div className="absolute inset-0 border border-teal-500/20 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-[150px] border border-blue-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24 px-6 max-w-7xl mx-auto">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] backdrop-blur-xl mb-12 animate-soft-float shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400/80 font-cyber">System_Status: Operational</span>
                </div>

                <div className="text-center space-y-8 mb-20">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none uppercase font-cyber italic">
                        <span className="text-gradient-premium block mb-2">NEUROX</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-emerald-500 to-blue-600 dark:from-teal-400 dark:via-emerald-400 dark:to-blue-500 animate-pulse">
                            SECURE_V3
                        </span>
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-[var(--text-secondary)] text-sm md:text-base font-medium leading-relaxed">
                        The ultimate AI-driven assessment ecosystem. Engineered for <span className="text-teal-600 dark:text-teal-400 font-bold">Zero-Trust</span> integrity, 
                        automated forensic auditing, and enterprise-grade sandbox execution.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                        <Link to="/register" className="cyber-button cyber-button-primary group w-64">
                            INITIALIZE_PROTOCOL <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                        <Link to="/login" className="cyber-button cyber-button-secondary w-64">
                            ACCESS_GATEWAY
                        </Link>
                    </div>
                </div>

                {/* Industrial Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <FeatureCard
                        icon={<Fingerprint className="text-teal-500" size={24} />}
                        title="Biometric_Auth"
                        desc="Advanced typing dynamics and behavioral analysis for foolproof candidate verification."
                    />
                    <FeatureCard
                        icon={<Terminal className="text-blue-500" size={24} />}
                        title="Sandbox_Exec"
                        desc="Hardware-isolated kernel environments for secure, real-time code evaluation."
                    />
                    <FeatureCard
                        icon={<Activity className="text-emerald-500" size={24} />}
                        title="Forensic_Audit"
                        desc="Live 360° monitoring with automated threat detection and focus-loss tracking."
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card p-8 group hover:border-teal-500/40 relative overflow-hidden bg-[var(--bg-secondary)] border-[var(--border-primary)] transition-colors duration-300">
        <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <Disc className="animate-[spin_10s_linear_infinite]" size={120} />
        </div>

        <div className="mb-6 p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500 shadow-sm">
            {icon}
        </div>

        <h3 className="text-[var(--text-primary)] text-xs font-black mb-4 tracking-[0.3em] font-cyber uppercase transition-colors duration-300">// {title}</h3>
        <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed group-hover:text-[var(--text-primary)] transition-colors duration-300 opacity-70 group-hover:opacity-100">
            {desc}
        </p>

        <div className="mt-8 h-px w-10 bg-teal-500/20 group-hover:w-full group-hover:bg-teal-500/40 transition-all duration-700" />
    </div>
);

export default LandingPage;

