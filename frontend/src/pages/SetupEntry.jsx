import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Settings, Plus, X, Save, ShieldCheck, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "../context/toast.context";
import IdCardOnboardModal from '../components/IdCardOnboardModal';

const SetupEntry = () => {
    const [keywords, setKeywords] = useState([]);
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

    const handleAnalysisComplete = (extractedKeywords) => {
        // Replace previous keywords with new ones
        setKeywords(extractedKeywords);
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

    if (loading) return <div className="min-h-screen pt-36 flex items-center justify-center text-lg font-medium text-gray-400">Loading settings...</div>;

    return (
        <div className="pt-36 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
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
                    {/* ID Card Configuration Section */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                                ID Card Configuration
                            </label>

                            <div className="group relative">
                                <HelpCircle size={18} className="text-gray-500 cursor-help" />
                                <div className="absolute right-0 w-64 p-3 bg-black/90 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 mt-2">
                                    Upload a valid ID card to automatically configure security patterns. This ensures only authentic cards are accepted.
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
                            {keywords.length >= 6 ? (
                                <div className="space-y-4 w-full">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                                        <ShieldCheck size={32} className="text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Reference ID Card Configured</h3>
                                        <p className="text-sm text-gray-400 mt-1">Security patterns have been extracted and saved.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsIdModalOpen(true)}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition shadow-lg shadow-indigo-600/20"
                                    >
                                        Update Reference ID Card
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                        <Settings size={32} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">No Reference ID Card</h3>
                                        <p className="text-sm text-gray-400 mt-1">Upload a valid ID card to set up verification.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsIdModalOpen(true)}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition shadow-lg shadow-indigo-600/20"
                                    >
                                        Upload Reference ID Card
                                    </button>
                                </div>
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
