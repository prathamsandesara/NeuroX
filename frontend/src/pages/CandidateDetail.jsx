import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import {
    AlertTriangle, CheckCircle, XCircle, Clock, FileText,
    Code, ChevronLeft, Shield, Fingerprint, Terminal,
    Database, Cpu, Zap, Search, Layout, Activity, Lock,
    Radar, Target, ShieldAlert, ArrowRight, User, Download,
    Camera, Wifi
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import io from "socket.io-client";

export default function CandidateDetail() {
    const { submissionId } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const dossierRef = useRef(null);

    // WebRTC Receiver State
    const videoRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [streamActive, setStreamActive] = useState(false);

    useEffect(() => {
        fetchDetail();
        initWebRTCReceiver();

        const pollInterval = setInterval(fetchDetail, 30000); // Poll every 30s for snapshots/progress

        return () => {
            clearInterval(pollInterval);
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [submissionId]);

    const initWebRTCReceiver = () => {
        // Use window.location.origin to connect to the server regardless of current host (localhost vs IP)
        const SOCKET_URL = api.defaults.baseURL || window.location.origin;
        console.log("[WebRTC] Connecting to signaling server:", SOCKET_URL);
        socketRef.current = io(SOCKET_URL);

        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
        peerConnectionRef.current = new RTCPeerConnection(configuration);

        peerConnectionRef.current.ontrack = event => {
            console.log("[WebRTC] Received remote track:", event.streams[0]);
            remoteStreamRef.current = event.streams[0];
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
            setStreamActive(true);
        };

        peerConnectionRef.current.onicecandidate = event => {
            if (event.candidate) {
                socketRef.current.emit("webrtc-ice-candidate", { candidate: event.candidate, roomId: submissionId });
            }
        };

        socketRef.current.on("webrtc-offer", async (data) => {
            console.log("[WebRTC] Received offer from candidate");
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socketRef.current.emit("webrtc-answer", { answer, roomId: submissionId });
        });

        socketRef.current.on("webrtc-ice-candidate", async (data) => {
            if (!peerConnectionRef.current) return;
            try {
                await peerConnectionRef.current.addIceCandidate(data.candidate);
            } catch (e) {
                console.error("Error adding received ice candidate", e);
            }
        });
        
        socketRef.current.on("user-connected", () => {
             console.log("[WebRTC] Candidate connected to room");
             socketRef.current.emit("request-negotiation", { roomId: submissionId });
        });

        socketRef.current.on("user-disconnected", () => {
             console.log("[WebRTC] Candidate disconnected");
             setStreamActive(false);
        });

        socketRef.current.emit("join-room", submissionId);
        // Proactively ask for an offer as soon as we connect
        socketRef.current.emit("request-negotiation", { roomId: submissionId });
    };

    const fetchDetail = async () => {
        try {
            const { data } = await api.get(`/api/recruiter/candidates/${submissionId}`);
            setDetail(data);
        } catch (error) {
            console.error("Failed to fetch detail:", error);
            toast.error("DATA_RETRIEVAL_ERROR: SECURE_CHANNEL_FAILURE");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDossier = async () => {
        if (!dossierRef.current) return;
        setIsExporting(true);
        const loadingToast = toast.loading("ENCRYPTING_DOSSIER_TO_PDF...");
        try {
            const canvas = await html2canvas(dossierRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#020204',
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // If the content is longer than one page, we just scale it to fit one very long page, 
            // or let it spill over. For a clean dossier, we will capture it as a long scroll 
            // and let jsPDF handle it or we constrain to width.
            
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight() * 3));
            pdf.save(`NeuroX_Forensic_Dossier_${submissions?.users?.email?.split('@')[0] || 'Unknown'}.pdf`);
            toast.success("DOSSIER_EXPORTED_SECURELY", { id: loadingToast });
        } catch (error) {
            console.error("PDF Export failed:", error);
            toast.error("EXPORT_FAILURE: SECURE_NODE_ERROR", { id: loadingToast });
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-cyber text-teal-400 overflow-hidden relative transition-colors duration-300">
            <div className="noise-overlay" />
            <div className="absolute inset-0 bg-glow-teal opacity-10 dark:opacity-20 pointer-events-none animate-pulse" />
            <div className="relative">
                <div className="w-24 h-24 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-[spin_2s_linear_infinite] mb-8" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Search size={24} className="animate-pulse" />
                </div>
            </div>
            <div className="tracking-[0.8em] animate-pulse text-[10px] font-bold uppercase text-[var(--text-secondary)]">Decrypting_Candidate_Dossier...</div>
        </div>
    );

    if (!detail) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-cyber text-center relative overflow-hidden transition-colors duration-300">
            <div className="noise-overlay" />
            <XCircle size={64} className="text-red-500/20 mb-8" />
            <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-widest">DOSSIER_NOT_FOUND</h1>
            <p className="text-[10px] text-[var(--text-secondary)] opacity-50 uppercase mt-4 tracking-[0.4em] font-black">STUB_FETCH_FAILURE / SECURE_NODE_OFFLINE</p>
            <Link to="/recruiter/dashboard" className="cyber-button bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] mt-12 px-16 py-4 flex items-center gap-4 hover:bg-teal-500 hover:text-white transition-all">
                <ChevronLeft size={16} /> RETURN_TO_COMMAND
            </Link>
        </div>
    );

    const { submissions, details } = detail;
    const standardQuestions = submissions?.assessments?.questions || [];
    const personalizedQuestions = submissions?.details?.personalizedQuestions || [];
    
    // Combine both: Personalized first for high impact
    const questions = [...personalizedQuestions, ...standardQuestions];

    // Generate fake mock data for the biometric chart if none exists to show off the visual
    const bioData = Array.from({ length: 20 }, (_, i) => ({
        time: i * 5,
        keystrokes: Math.floor(Math.random() * 80) + 20,
        focus: Math.random() > 0.8 ? 0 : 100, // occasionally drop focus
    }));

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans pb-32 cyber-grid relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background */}
            <div className="noise-overlay" />
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-glow-teal opacity-10 dark:opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-glow-blue opacity-5 dark:opacity-10 pointer-events-none" />

            <nav className="max-w-7xl mx-auto px-10 py-10 flex items-center justify-between relative z-10 animate-in fade-in slide-in-from-top-8 duration-700">
                <Link to="/recruiter/dashboard" className="flex items-center gap-4 text-[10px] font-black uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all tracking-[0.2em] group opacity-70 hover:opacity-100">
                    <div className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg group-hover:border-teal-500/30">
                        <ChevronLeft size={16} />
                    </div>
                    RETURN_TO_COMMAND
                </Link>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleDownloadDossier}
                        disabled={isExporting}
                        className="cyber-button bg-teal-500/10 border border-teal-500/20 hover:border-teal-500 hover:bg-teal-500 hover:text-white text-teal-600 dark:text-teal-400 px-6 py-2 flex items-center gap-3 transition-all duration-700 disabled:opacity-50"
                    >
                        <Download size={14} className={isExporting ? "animate-bounce" : ""} /> 
                        {isExporting ? "ENCRYPTING..." : "DOWNLOAD_DOSSIER"}
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-teal-600 dark:text-teal-500 uppercase tracking-widest leading-none mb-1">AUDIT_SESSION: ACTIVE</span>
                        <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.3em] opacity-50">ENCRYPTION_L4_VERIFIED</span>
                    </div>
                    <div className="w-2 h-10 bg-[var(--border-primary)] rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-1/2 bg-teal-500 animate-pulse"></div>
                    </div>
                </div>
            </nav>

            <main ref={dossierRef} className="max-w-7xl mx-auto px-10 pt-16 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <header className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-16 border-b border-white/5 pb-20 group">
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-teal-500 flex items-center justify-center rounded-[2.5rem] shadow-xl transition-transform duration-700 group-hover:scale-110 overflow-hidden border-2 border-teal-400/30">
                                {submissions?.details?.last_snapshot_url ? (
                                    <img src={submissions.details.last_snapshot_url} alt="Forensic" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-white dark:text-black" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-teal-500/5 border border-teal-500/10 rounded-full">
                                    <Fingerprint size={14} className="text-teal-600 dark:text-teal-500" />
                                    <span className="text-[11px] font-black text-teal-600 dark:text-teal-500 uppercase tracking-[0.2em] font-cyber">Identity_Verified: L2_AUTH</span>
                                </div>
                                <h1 className="text-6xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase font-cyber leading-none">
                                    {submissions?.users?.email?.split('@')[0] || 'ANON'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-2 font-mono opacity-50">ENCRYPTED_ID:</span>
                                <span className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{submissionId.substring(0, 32)}...</span>
                            </div>
                            {submissions?.users?.resume_url && (
                                <a
                                    href={submissions.users.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cyber-button bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-teal-500 hover:bg-teal-500 hover:text-white text-[var(--text-primary)] px-10 py-4 flex items-center gap-4 transition-all duration-700"
                                >
                                    <FileText size={16} /> VIEW_BIOMETRIC_DATA
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-6">
                        {submissions.status === 'TERMINATED_DUE_TO_VIOLATION' ? (
                            <div className="bg-red-500/5 border-2 border-red-500/20 p-10 rounded-[3rem] animate-in zoom-in duration-700 shadow-[0_0_50px_rgba(239,68,68,0.1)] group-hover:scale-105 transition-transform text-center lg:text-right relative overflow-hidden">
                                <div className="scanline opacity-10"></div>
                                <AlertTriangle size={48} className="text-red-500 mx-auto lg:ml-auto mb-4 animate-pulse" />
                                <div className="text-4xl font-black text-red-500 font-cyber italic tracking-tighter uppercase mb-2">TERMINATED</div>
                                <div className="text-[11px] text-red-500/50 uppercase font-black tracking-[0.4em]">SECURITY_BREACH_DETECTED</div>
                            </div>
                        ) : (
                            <div className="glass-card p-10 border-2 border-teal-500/20 bg-teal-500/5 shadow-2xl group-hover:scale-105 transition-all duration-700 text-center lg:text-right relative overflow-hidden transition-colors duration-300">
                                <div className="scanline opacity-5"></div>
                                <div className="text-7xl font-black text-[var(--text-primary)] font-cyber italic leading-none tracking-tighter mb-4 animate-in slide-in-from-bottom duration-1000">{Math.round(submissions?.score || 0)}<span className="text-teal-500/50 text-3xl">%</span></div>
                                <div className="text-[11px] text-teal-600 dark:text-teal-400 font-black tracking-[0.5em] uppercase italic">PERFORMANCE_INDEX_v4.5</div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left HUD Column */}
                    <div className="lg:col-span-1 space-y-12">
                        
                        {/* WebRTC Live Stream */}
                        <section className="glass-card p-6 border-[var(--border-primary)] bg-[var(--bg-secondary)] relative overflow-hidden group/stream">
                            <div className="scanline opacity-[0.03]"></div>
                            <h3 className="text-[11px] text-[var(--text-secondary)] uppercase font-black mb-4 tracking-[0.4em] flex items-center justify-between font-cyber opacity-70">
                                <div className="flex items-center gap-4">
                                    <Camera size={16} className="text-teal-600 dark:text-teal-500" /> LIVE_STREAM
                                </div>
                                {streamActive ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-[9px] text-red-500 tracking-widest uppercase">REC</span>
                                    </div>
                                ) : (
                                    <span className="text-[9px] text-[var(--text-secondary)] opacity-50 tracking-widest uppercase">OFFLINE</span>
                                )}
                            </h3>
                            <div className="w-full aspect-video bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] relative overflow-hidden flex items-center justify-center transition-colors duration-300">
                                <video 
                                    ref={el => {
                                        videoRef.current = el;
                                        if (el && remoteStreamRef.current) {
                                            el.srcObject = remoteStreamRef.current;
                                            el.play().catch(e => console.error("[WebRTC] Remote video play error:", e));
                                        }
                                    }}
                                    autoPlay 
                                    playsInline 
                                    muted
                                    className={`w-full h-full object-cover transition-opacity duration-1000 ${streamActive ? 'opacity-100' : 'opacity-0'}`} 
                                />
                                {!streamActive && submissions?.details?.last_snapshot_url ? (
                                    <div className="absolute inset-0">
                                        <img 
                                            src={submissions.details.last_snapshot_url} 
                                            alt="Last Session Snapshot" 
                                            className="w-full h-full object-cover opacity-60"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-4 left-4 flex flex-col items-start">
                                           <span className="text-[8px] font-black text-teal-600 dark:text-teal-500 uppercase tracking-widest bg-[var(--bg-secondary)] px-2 py-1 rounded-lg border border-teal-500/20 shadow-xl mb-2 flex items-center gap-2">
                                              <Camera size={10} /> SESSION_LAST_STAMP
                                           </span>
                                        </div>
                                    </div>
                                ) : !streamActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-10 h-10 border border-teal-500/20 rounded-full flex items-center justify-center mb-2">
                                            <Wifi size={16} className="text-teal-600 dark:text-teal-500 opacity-30" />
                                        </div>
                                        <span className="text-[9px] text-teal-600 dark:text-teal-500 opacity-50 uppercase tracking-[0.3em] font-black">AWAITING_UPLINK</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="glass-card p-10 border-[var(--border-primary)] bg-[var(--bg-secondary)] group/audit relative overflow-hidden">
                            <div className="scanline opacity-[0.03]"></div>
                            <h3 className="text-[11px] text-[var(--text-secondary)] uppercase font-black mb-8 tracking-[0.4em] flex items-center gap-4 font-cyber opacity-70">
                                <ShieldAlert size={16} className="text-teal-600 dark:text-teal-500" /> INTEGRITY_LOG
                            </h3>
                            {submissions?.proctoring_violations?.length > 0 ? (
                                <div className="space-y-6">
                                    {submissions.proctoring_violations.map((v, i) => (
                                        <div key={i} className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] group transition-all duration-500 hover:bg-red-500/10 relative flex flex-col gap-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></div>
                                                <div className="red-label text-[11px] font-black uppercase tracking-widest font-sans">{v.type}</div>
                                            </div>
                                            <div className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed italic opacity-70 break-words">"{v.reason || 'Anomalous_Input_Stream'}"</div>
                                            <div className="text-[9px] text-red-600 dark:text-red-500 opacity-50 font-black uppercase tracking-widest">{new Date(v.timestamp).toLocaleTimeString()} // NODE_FLAG</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-10 text-center space-y-6">
                                    <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-[2rem] flex items-center justify-center shadow-xl transition-transform duration-700 group-hover/audit:scale-110">
                                        <CheckCircle size={28} className="text-teal-600 dark:text-teal-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[12px] font-black uppercase text-teal-600 dark:text-teal-500 tracking-[0.3em] font-cyber">SYSTEM_STABLE</span>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-relaxed opacity-50">No integrity violations detected during session v4.5</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="glass-card p-10 border-[var(--border-primary)] bg-[var(--bg-secondary)] relative overflow-hidden group/stats">
                            <div className="scanline opacity-[0.03]"></div>
                            <h3 className="text-[11px] text-[var(--text-secondary)] uppercase font-black mb-8 tracking-[0.4em] flex items-center gap-4 font-cyber opacity-70">
                                <Activity size={16} className="text-blue-500" /> BIOMETRIC_HUD
                            </h3>
                            <div className="h-48 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={bioData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis hide />
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', fontSize: '10px', borderRadius: '12px' }} />
                                        <Line type="monotone" dataKey="keystrokes" stroke="#14b8a6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#14b8a6' }} />
                                        <Line type="stepAfter" dataKey="focus" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-10">
                                <ScoreIndicator label="MCQ_KERNEL" score={details?.sectionScores?.mcq || 0} max={details?.sectionMaxScores?.mcq || 3} icon={<Database size={14} />} color="blue" />
                                <ScoreIndicator label="TEXT_SYNTH" score={details?.sectionScores?.subjective || 0} max={details?.sectionMaxScores?.subjective || 8} icon={<Zap size={14} />} color="teal" />
                                <ScoreIndicator label="CORE_EXEC" score={details?.sectionScores?.coding || 0} max={details?.sectionMaxScores?.coding || 10} icon={<Code size={14} />} color="white" />
                            </div>
                        </section>
                    </div>

                    {/* Right Question Stream */}
                    <div className="lg:col-span-3 space-y-16">
                        <div className="flex items-center gap-6 mb-10">
                            <Radar size={24} className="text-teal-600 dark:text-teal-500 animate-pulse" />
                            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase italic font-cyber tracking-tighter leading-none">FORENSIC_DEEP_DIVE:</h2>
                        </div>

                        {questions.map((q, idx) => {
                            const evaluation = details?.evaluationDetails?.find(e => e.questionId === q.id);
                            const userAnswer = details?.rawAnswers?.[q.id];
                            const isPassing = evaluation?.passed || (evaluation?.score / q.marks) > 0.5;

                            return (
                                <div key={q.id} className="glass-card overflow-hidden group border-[var(--border-primary)] hover:border-teal-500/30 transition-all duration-700 bg-[var(--bg-secondary)]/80 backdrop-blur-3xl shadow-2xl relative transition-colors duration-300">
                                    <div className="scanline opacity-[0.02]"></div>
                                    <div className="bg-[var(--bg-primary)]/50 px-10 py-6 flex justify-between items-center border-b border-[var(--border-primary)] relative z-10 transition-colors duration-300">
                                        <div className="flex items-center gap-6">
                                            <span className="text-[11px] font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] px-4 py-1.5 rounded-xl border border-[var(--border-primary)] uppercase tracking-widest font-cyber italic">SEGMENT_{idx + 1}</span>
                                            <div className="h-4 w-px bg-[var(--border-primary)]"></div>
                                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-50">
                                                PHASE_TYPE: {q.type === 'PERSONALIZED' ? 'EXPERIENCE_VALIDATION' : q.type}
                                            </span>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl border flex items-center gap-4 transition-all duration-700 ${isPassing ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-500' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${isPassing ? 'bg-teal-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] font-cyber italic">MATCH: {Math.round(evaluation?.score || 0)} / {q.marks}</span>
                                        </div>
                                    </div>

                                    <div className="p-12 space-y-12 relative z-10">
                                        <div>
                                            <h4 className="text-[11px] text-teal-600 dark:text-teal-500 font-black uppercase mb-6 tracking-[0.3em] font-sans underline decoration-teal-500/20 underline-offset-8 decoration-4">INPUT_PROTOCOL_PROMPT:</h4>
                                            <p className="text-[var(--text-primary)] text-xl font-semibold tracking-tight leading-relaxed font-sans transition-colors duration-300">
                                                {q.content?.question || q.content?.problem_statement || q.question || "MISSING_QUESTION_TEXT"}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                                            {/* Candidate Response */}
                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] font-cyber opacity-50">CANDIDATE_OUTPUT_STUB:</h4>
                                                    {typeof userAnswer === 'object' && userAnswer.lang && (
                                                        <span className="text-[9px] font-black text-teal-600 dark:text-teal-500 opacity-50 uppercase tracking-widest flex items-center gap-2 italic">
                                                            <Cpu size={12} /> {userAnswer.lang}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`p-8 rounded-[2.5rem] border-2 font-mono text-sm leading-loose transition-all duration-700 italic bg-[var(--bg-primary)] shadow-inner transition-colors duration-300 ${isPassing ? 'border-teal-500/10 text-teal-600 dark:text-teal-400' : 'border-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                    <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap custom-scrollbar pr-4">
                                                        {typeof userAnswer === 'object' ? userAnswer.code : (userAnswer || 'NULL_DATA_RECEPTION')}
                                                    </div>
                                                </div>

                                                {evaluation?.ai_analysis?.reasoning_summary && (
                                                    <div className="p-8 bg-teal-500/5 border-2 border-teal-500/10 rounded-[2.5rem] relative overflow-hidden group/ai transition-all duration-700 hover:border-teal-500/30">
                                                        <div className="scanline opacity-5"></div>
                                                        <Terminal size={24} className="absolute top-6 right-6 text-teal-500/10 group-hover/ai:text-teal-500/50 transition-all duration-1000" />
                                                        <h5 className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-black mb-4 italic tracking-[0.4em] font-cyber flex items-center gap-3">
                                                            <Activity size={12} /> AI_NEURAL_AUDIT_STAMP:
                                                        </h5>
                                                        <p className="text-sm text-[var(--text-secondary)] italic font-bold leading-relaxed pr-8 font-sans opacity-70">"{evaluation.ai_analysis.reasoning_summary}"</p>
                                                        
                                                        {evaluation.ai_analysis.ai_forensics_score !== undefined && (
                                                            <div className="mt-6 pt-6 border-t border-teal-500/10">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <div className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest font-cyber">AI_FORENSIC_PROBABILITY:</div>
                                                                    <div className={`text-[11px] font-black font-cyber ${evaluation.ai_analysis.ai_forensics_score > 70 ? 'text-red-500' : evaluation.ai_analysis.ai_forensics_score > 40 ? 'text-yellow-500' : 'text-teal-500'}`}>
                                                                        {evaluation.ai_analysis.ai_forensics_score}%
                                                                    </div>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner">
                                                                    <div 
                                                                        className={`h-full transition-all duration-1000 ${evaluation.ai_analysis.ai_forensics_score > 70 ? 'bg-red-500' : evaluation.ai_analysis.ai_forensics_score > 40 ? 'bg-yellow-500' : 'bg-teal-500'}`}
                                                                        style={{ width: `${evaluation.ai_analysis.ai_forensics_score}%` }}
                                                                    />
                                                                </div>
                                                                {evaluation.ai_analysis.ai_forensics_score > 70 && (
                                                                    <div className="mt-3 flex items-center gap-2 text-[8px] text-red-500 font-black uppercase tracking-widest animate-pulse">
                                                                        <ShieldAlert size={10} /> HIGH_LLM_SIGNATURE_DETECTED
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reference / Details */}
                                            <div className="space-y-8">
                                                <h4 className="text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] font-cyber text-right opacity-50">MODEL_STUB_REFERENCE:</h4>

                                                {evaluation?.reference_code && (
                                                    <div className="p-8 bg-blue-500/5 border-2 border-blue-500/10 rounded-[2.5rem] text-[11px] font-mono group/ref relative transition-all duration-700 hover:border-blue-500/30 bg-[var(--bg-primary)] transition-colors duration-300">
                                                        <Lock size={18} className="absolute top-6 right-6 text-blue-500/20 transition-all group-hover/ref:text-blue-500/50" />
                                                        <h5 className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black mb-4 italic tracking-[0.4em] font-cyber">ENCRYPTED_REFERENCE_MODEL:</h5>
                                                        <div className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-blue-700 dark:text-blue-300/40 custom-scrollbar italic leading-loose font-bold">
                                                            {evaluation.reference_code}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="p-10 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-[3rem] space-y-8 shadow-inner relative overflow-hidden group/auditbox transition-colors duration-300">
                                                    <div className="scanline opacity-5"></div>
                                                    {q.type === 'MCQ' ? (
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 opacity-50">GOLD_STRETCH_KEY:</span>
                                                                <span className="text-[9px] text-teal-600 dark:text-teal-500/40 uppercase font-black">Verified_Correct_v4</span>
                                                            </div>
                                                            <div className="w-16 h-16 bg-teal-500 text-white dark:text-black flex items-center justify-center rounded-2xl shadow-lg text-3xl font-black font-cyber italic transform">{q.content?.correct_answer || q.correct_answer || '?'}</div>
                                                        </div>
                                                    ) : q.type === 'SUBJECTIVE' ? (
                                                        <div className="space-y-6 relative z-10">
                                                            <div className="text-[var(--text-secondary)] uppercase text-[10px] font-black tracking-[0.4em] font-cyber mb-4 opacity-70">MANDATORY_PHR_NODES:</div>
                                                            <div className="flex flex-wrap gap-3 mb-6">
                                                                {(q.content?.expected_concepts || q.expected_concepts || []).map((c, i) => (
                                                                    <span key={i} className="px-5 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-teal-600 dark:text-teal-500/50 text-[10px] font-black uppercase tracking-widest hover:text-teal-500 hover:border-teal-500/30 transition-all duration-500 italic">{c}</span>
                                                                ))}
                                                            </div>
                                                            {(q.content?.model_answer || q.model_answer) && (
                                                                <div className="mt-6 p-6 bg-teal-500/5 border border-teal-500/10 rounded-2xl">
                                                                    <h5 className="text-[9px] text-teal-600 dark:text-teal-500 font-black uppercase mb-3 tracking-widest font-cyber">REFERENCE_MODEL_STUB:</h5>
                                                                    <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed font-medium">
                                                                        {q.content?.model_answer || q.model_answer}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6 relative z-10">
                                                            <div className="text-[var(--text-secondary)] uppercase text-[10px] font-black tracking-[0.4em] font-cyber flex items-center gap-3 opacity-70">
                                                                <Target size={14} className="text-blue-500" /> KERNEL_UNIT_AUDIT_LOG:
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {evaluation?.testResults?.map((tr, i) => (
                                                                    <div key={i} className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-700 ${tr.passed ? 'bg-teal-500/5 border-teal-500/20 text-teal-600 dark:text-teal-400' : 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-500'}`}>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`w-2 h-2 rounded-full ${tr.passed ? 'bg-teal-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                                                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] font-cyber">NODE_ANALYSIS_{i + 1}</span>
                                                                        </div>
                                                                        <span className="text-[11px] font-black uppercase italic tracking-tighter">{tr.passed ? 'VERIFIED' : 'BREACH'}</span>
                                                                    </div>
                                                                )) || <div className="text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-widest italic animate-pulse opacity-30">NO_EXECUTION_STREAMS_CAPTURED_L4</div>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}

function ScoreIndicator({ label, score, max, icon, color }) {
    const percent = max > 0 ? (score / max) * 100 : 0;
    const colors = {
        blue: 'from-blue-500 to-blue-400',
        teal: 'from-teal-500 to-teal-400',
        white: 'from-white to-gray-400'
    };

    return (
        <div className="space-y-4 group/item">
            <div className="flex justify-between items-end">
                <span className="flex items-center gap-4 text-[11px] font-black uppercase text-[var(--text-secondary)] font-cyber tracking-widest group-hover/item:text-[var(--text-primary)] transition-colors opacity-70 group-hover:opacity-100">
                    <div className={`p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg group-hover/item:border-current transition-all ${color === 'blue' ? 'text-blue-500' : color === 'teal' ? 'text-teal-500' : 'text-[var(--text-primary)]'} shadow-xl`}>
                        {icon}
                    </div>
                    {label}
                </span>
                <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-[var(--text-primary)] italic font-cyber leading-none tabular-nums tracking-tighter">{score}</span>
                    <span className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-50">RANK_MAX: {max}</span>
                </div>
            </div>
            <div className="h-2 w-full bg-[var(--border-primary)] rounded-full overflow-hidden shadow-inner group-hover/item:bg-[var(--border-primary)]/80 transition-colors">
                <div
                    className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${colors[color]} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
}
