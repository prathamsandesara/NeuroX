import React, { useState } from 'react';
import { X, Plus, Trash2, Zap, Cpu, Code, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

const ManualQuestionModal = ({ isOpen, onClose, assessmentId, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        problem_statement: '',
        constraints: '',
        topic: 'DSA',
        marks: 10,
        difficulty: 'INTERMEDIATE',
        starter_code: "// Write your code here\nfunction solution() {\n\n}",
        test_cases: [
            { input: '', expected_output: '' }
        ]
    });

    if (!isOpen) return null;

    const handleAddTestCase = () => {
        setFormData({
            ...formData,
            test_cases: [...formData.test_cases, { input: '', expected_output: '' }]
        });
    };

    const handleRemoveTestCase = (index) => {
        const newTestCases = formData.test_cases.filter((_, i) => i !== index);
        setFormData({ ...formData, test_cases: newTestCases });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.test_cases];
        newTestCases[index][field] = value;
        setFormData({ ...formData, test_cases: newTestCases });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/recruiter/add-coding-question', {
                assessmentId,
                questionData: {
                    title: formData.title,
                    problem_statement: formData.problem_statement,
                    constraints: formData.constraints,
                    starter_code: formData.starter_code,
                    marks: formData.marks,
                    topic: formData.topic,
                    test_cases: formData.test_cases,
                    difficulty: formData.difficulty
                }
            });
            toast.success('MANUAL_QUESTION_ADDED');
            onComplete();
            onClose();
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error('SUBMISSION_FAILED: DATABASE_REJECTION');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl glass-card border-teal-500/20 bg-[#050505] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                            <Code className="text-blue-500" size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase font-cyber">Add_Manual_Question</h3>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Module: CODING_KERNEL_v1.2</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Problem_Identity</label>
                                <input
                                    type="text"
                                    required
                                    className="cyber-input w-full"
                                    placeholder="E.G. REVERSE_BINARY_TREE"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description_Node</label>
                                <textarea
                                    required
                                    className="cyber-input w-full h-40 resize-none text-xs"
                                    placeholder="EXPLAIN_THE_CHALLENGE..."
                                    value={formData.problem_statement}
                                    onChange={e => setFormData({ ...formData, problem_statement: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Marking_Weight</label>
                                    <input
                                        type="number"
                                        className="cyber-input w-full"
                                        value={formData.marks}
                                        onChange={e => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Complexity_Class</label>
                                    <select
                                        className="cyber-input w-full text-xs"
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="JUNIOR">JUNIOR</option>
                                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                                        <option value="SENIOR">SENIOR</option>
                                        <option value="EXPERT">EXPERT</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Technical Spec */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Starter_Kernel_Code</label>
                                <textarea
                                    className="cyber-input w-full h-40 font-mono text-xs leading-relaxed"
                                    placeholder="// INITIAL_CODE_STUB..."
                                    value={formData.starter_code}
                                    onChange={e => setFormData({ ...formData, starter_code: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Audit_Test_Cases</label>
                                    <button
                                        type="button"
                                        onClick={handleAddTestCase}
                                        className="text-[9px] font-black text-teal-400 flex items-center gap-2 hover:bg-teal-400/10 px-2 py-1 rounded transition"
                                    >
                                        <Plus size={12} /> ADD_CASE
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.test_cases.map((tc, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3 relative group">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTestCase(idx)}
                                                className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    className="cyber-input text-[10px] p-2"
                                                    placeholder="RAW_INPUT"
                                                    value={tc.input}
                                                    onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                                                />
                                                <input
                                                    className="cyber-input text-[10px] p-2"
                                                    placeholder="EXPECTED_STDOUT"
                                                    value={tc.expected_output}
                                                    onChange={e => handleTestCaseChange(idx, 'expected_output', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Footer */}
                    <div className="pt-8 border-t border-white/5 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-[10px] font-black uppercase text-gray-500 border border-white/5 rounded-2xl hover:bg-white/5 transition"
                        >
                            ABORT_PROCESS
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 text-[10px] font-black uppercase text-white bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Cpu className="animate-spin" size={14} /> INITIALIZING_WRITE...
                                </>
                            ) : (
                                <>
                                    <Zap size={14} className="fill-current" /> COMMIT_TO_REPOSITORY
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualQuestionModal;
