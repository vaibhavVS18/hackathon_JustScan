import React, { useState, useRef } from 'react';
import axios from '../config/axios';
import { X, Upload, Check, Loader, AlertTriangle, FileText, Shield } from 'lucide-react';

const IdCardOnboardModal = ({ isOpen, onClose, onAnalysisComplete }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setAnalysis(null);
    };

    const analyzeImage = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('idCardImage', file);

        try {
            // Using public route to match TestIdCard functionality
            const res = await axios.post('/api/organizations/analyze-id-card-public', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setAnalysis(res.data.analysis);
            }
        } catch (err) {
            console.error("Analysis failed", err);
            // Enhanced error handling
            alert(err.response?.data?.message || err.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (analysis && analysis.signature && analysis.signature.keywords) {
            // Pass keywords back to parent
            onAnalysisComplete(analysis.signature.keywords);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f0b15] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-teal-400" /> ID Card Analysis
                        </h2>
                        <p className="text-gray-400 text-sm">Upload an ID card to extract validation keywords automatically.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 grid lg:grid-cols-2 gap-8">

                    {/* Left: Upload */}
                    <div className="space-y-4">
                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[300px] cursor-pointer
                                ${dragActive ? "border-teal-500 bg-teal-500/10" : "border-white/10 hover:border-white/20 bg-white/5"}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleChange}
                                accept="image/*"
                            />

                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-[250px] rounded-lg shadow-lg object-contain" />
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-[#1a1625] flex items-center justify-center mb-4 shadow-lg border border-white/5">
                                        <Upload className="text-teal-400" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Upload ID Card</h3>
                                    <p className="text-gray-500 text-sm mt-2">Drag & drop or click to browse</p>
                                </>
                            )}
                        </div>

                        {preview && (
                            <button
                                onClick={analyzeImage}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
                                    ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-gradient-to-r from-teal-500 to-purple-600 hover:opacity-90"}
                                `}
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <span className="flex items-center gap-2">Analyze <FileText size={18} /></span>}
                            </button>
                        )}
                    </div>

                    {/* Right: Results */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                            Analysis Results
                        </h3>

                        {!analysis ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center opacity-60">
                                <FileText size={48} className="mb-4 text-gray-700" />
                                <p>Results will appear here after analysis.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className={`p-4 rounded-xl border ${analysis.is_id_card ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Confidence</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-lg font-bold ${analysis.is_id_card ? "text-green-400" : "text-red-400"}`}>
                                            {analysis.is_id_card ? "Valid ID Card" : "Invalid Document"}
                                        </span>
                                        <span className="text-2xl font-black text-white">{analysis.confidence_score}%</span>
                                    </div>

                                    {/* Institution & Layout Details */}
                                    {analysis.is_id_card && (
                                        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 gap-3">
                                            <div className="bg-white/5 p-3 rounded-lg">
                                                <h4 className="text-xs text-gray-500 uppercase mb-1 font-bold">Institution</h4>
                                                <p className="font-medium text-sm text-gray-200">{analysis.institution_name || 'N/A'}</p>
                                            </div>
                                            {analysis.signature?.validation_signals?.layout && (
                                                <div className="bg-white/5 p-3 rounded-lg">
                                                    <h4 className="text-xs text-gray-500 uppercase mb-1 font-bold">Layout Analysis</h4>
                                                    <p className="text-xs text-gray-400">{analysis.signature.validation_signals.layout}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {analysis.is_id_card && (
                                    <>
                                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg mb-4">
                                            <p className="text-green-400 text-sm flex items-center gap-2">
                                                <Check size={16} /> ID Card Pattern Recognized
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleConfirm}
                                            className="w-full mt-auto py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                        >
                                            <Check size={20} /> Confirm Reference ID Card
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdCardOnboardModal;
