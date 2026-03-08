import { Link } from 'react-router-dom';
import ParticlesBackground from '../components/ParticlesBackground';
import { Shield, Zap, Terminal, Cpu, ArrowRight, Activity, Disc } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden font-sans bg-transparent cyber-grid selection:bg-teal-500/30">
            <ParticlesBackground />

            {/* Cinematic Neural HUB Underlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-20">
                <div className="absolute inset-0 border border-teal-500/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute inset-[100px] border border-blue-500/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                <div className="absolute inset-[200px] border border-white/5 rounded-full animate-[spin_80s_linear_infinite]"></div>
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-24 text-center px-6">
                <div className="max-w-6xl space-y-12">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-teal-500/20 bg-teal-500/5 backdrop-blur-3xl animate-in fade-in slide-in-from-top duration-1000">
                        <div className="relative">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping absolute inset-0"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 relative"></div>
                        </div>
                        <span className="text-teal-400 text-[9px] font-black uppercase tracking-[0.5em] font-cyber">Neural_Network_Auth_Active</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase italic font-cyber animate-in zoom-in duration-1000">
                            <span className="text-premium-gradient block">SECURE</span>
                            <span className="text-cyber-gradient filter drop-shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                                TALENT_FORGE
                            </span>
                        </h1>
                        <p className="text-gray-500 max-w-xl mx-auto text-[10px] md:text-sm font-bold leading-relaxed uppercase tracking-tighter animate-in fade-in duration-1000 delay-300 opacity-60">
                            Enterprise-grade neural ecosystem for deep-learning assessment parsing, sandbox execution, and forensic candidate auditing.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                        <Link to="/register" className="cyber-button cyber-button-primary px-10 py-3 text-[10px] group">
                            INITIALIZE_PROTOCOL <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                        <Link to="/login" className="px-10 py-3 border border-white/5 bg-white/[0.02] text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/5 hover:border-white/10 transition-all rounded-[1rem] backdrop-blur-3xl shadow-2xl">
                            VIEW_GATEWAY
                        </Link>
                    </div>
                </div>

                {/* Industrial Feature Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-5 w-full max-w-6xl animate-in fade-in slide-in-from-bottom duration-1000 delay-700">
                    <FeatureCard
                        icon={<Terminal className="text-teal-400" size={24} />}
                        title="KERNEL_EXEC"
                        desc="Hardware-isolated sandbox supporting 50+ languages with O(1) boot time."
                    />
                    <FeatureCard
                        icon={<Cpu className="text-blue-400" size={24} />}
                        title="TRANSFORMER"
                        desc="Neural parsing engine with semantic skill mapping and JD intelligence."
                    />
                    <FeatureCard
                        icon={<Activity className="text-purple-400" size={24} />}
                        title="INTEGRITY_HUD"
                        desc="Real-time forensic auditing with behavioral anomaly detection."
                    />
                    <FeatureCard
                        icon={<Shield className="text-white opacity-40" size={24} />}
                        title="SECURE_VAULT"
                        desc="Tamper-proof result hashing and distributed identity management."
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card p-6 text-left group hover:translate-y-[-3px] transition-all duration-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Disc className="animate-spin-slow" size={80} />
        </div>

        <div className="mb-5 p-3 bg-white/5 rounded-[1rem] w-fit group-hover:bg-teal-500/10 transition-all duration-500 group-hover:scale-110">
            {icon}
        </div>

        <div className="text-white text-[9px] font-black mb-3 tracking-[0.5em] font-cyber uppercase">// {title}</div>
        <div className="text-gray-500 text-[10px] font-bold leading-relaxed tracking-tight group-hover:text-gray-300 transition-colors uppercase">{desc}</div>

        <div className="mt-6 h-[1px] w-8 bg-white/5 group-hover:w-full group-hover:bg-teal-500/20 transition-all duration-1000 ease-in-out"></div>
    </div>
);

export default LandingPage;
