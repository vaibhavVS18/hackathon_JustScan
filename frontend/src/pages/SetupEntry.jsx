import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Settings, Plus, X, Save, ShieldCheck, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "../context/toast.context";

const SetupEntry = () => {
    const [keywords, setKeywords] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [rollNoLength, setRollNoLength] = useState(5);
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const orgId = localStorage.getItem("current-org-id");
        if (orgId) {
            fetchSettings(orgId);
        } else {
            navigate("/portal");
        }
    }, [navigate]);

    const fetchSettings = async (id) => {
        try {
            const res = await axios.get(`/api/organizations/${id}`);
            setKeywords(res.data.validationKeywords || []);
            setRollNoLength(res.data.rollNoLength || 5);
        } catch (err) {
            console.error(err);
            addToast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddKeyword = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            if (keywords.includes(inputValue.trim())) {
                addToast("Keyword already exists", "warning");
                return;
            }
            setKeywords([...keywords, inputValue.trim()]);
            setInputValue("");
        }
    };

    const removeKeyword = (index) => {
        setKeywords(keywords.filter((_, i) => i !== index));
    };

    const handleAnalysisComplete = (extractedKeywords) => {
        // Merge unique keywords
        const uniqueKeywords = [...new Set([...keywords, ...extractedKeywords])];
        setKeywords(uniqueKeywords);
    };


    const handleSave = async () => {
        // Validate minimum keywords requirement
        if (keywords.length < 6) {
            addToast(`Please add at least 6 validation keywords. You have ${keywords.length}.`, "warning");
            return;
        }

        try {
            const orgId = localStorage.getItem("current-org-id");
            await axios.put(`/api/organizations/${orgId}/settings`, {
                validationKeywords: keywords,
                rollNoLength
            });
            addToast("Settings saved successfully!", "success");
            navigate("/portal");
        } catch (err) {
            console.error("Error saving settings", err);
            addToast(err.response?.data?.message || "Error saving settings", "error");
        }
    };

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-lg font-medium text-gray-400">Loading settings...</div>;

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
            <div className="mb-8 flex items-center space-x-4">
                <Link to="/portal" className="p-3 rounded-xl glass-panel hover:bg-white/10 transition border border-white/5 group">
                    <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Entry System Setup</h1>
                    <p className="text-gray-400 text-sm mt-1">Configure security settings for ID scanning.</p>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-32 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 space-y-8">
                    {/* Keywords Section */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                                Validation Keywords
                            </label>
                            <div className="group relative">
                                <HelpCircle size={18} className="text-gray-500 cursor-help" />
                                <div className="absolute right-0 w-64 p-3 bg-black/90 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 mt-2">
                                    Add identifying words found on ID cards (e.g., "Student", "College", "Identity", "Valid", "Signature"). At least 6 keywords are required for accurate verification.
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleAddKeyword}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all font-medium placeholder-gray-600"
                                placeholder="Type a keyword & press Enter"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <kbd className="hidden sm:inline-block px-2 py-1 bg-white/10 rounded text-xs text-gray-400 font-mono">ENTER</kbd>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 min-h-[100px]">
                            {keywords.length === 0 ? (
                                <p className="text-gray-600 text-sm p-2 italic">No keywords added yet. Add common words found on your ID cards.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {keywords.map((k, i) => (
                                        <span key={i} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 group hover:bg-indigo-500/20 transition-colors">
                                            {k}
                                            <button
                                                onClick={() => removeKeyword(i)}
                                                className="text-indigo-400 hover:text-white transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${keywords.length >= 6 ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                            {keywords.length >= 6 ? (
                                <><ShieldCheck size={14} /> Security Requirements Met ({keywords.length}/6+)</>
                            ) : (
                                <><Info size={14} /> {6 - keywords.length} more keywords needed for security</>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    {/* Roll No Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                            Roll Number Format
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="w-full sm:w-32">
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={rollNoLength}
                                    onChange={(e) => setRollNoLength(parseInt(e.target.value) || 5)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-mono font-bold text-lg"
                                />
                            </div>
                            <p className="text-sm text-gray-400 flex-1">
                                Specify the exact character length of student entries (e.g. Roll No/Registration ID) to help the AI accurately detect and validate IDs.
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={keywords.length < 6}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${keywords.length >= 6
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        <Save size={20} />
                        Save Configuration
                    </button>
                </div>
            </div>


            <IdCardOnboardModal
                isOpen={isIdModalOpen}
                onClose={() => setIsIdModalOpen(false)}
                onAnalysisComplete={handleAnalysisComplete}
            />
        </div>
    );
};


export default SetupEntry;
