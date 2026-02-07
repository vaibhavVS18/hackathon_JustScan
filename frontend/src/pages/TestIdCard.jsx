import React, { useState } from 'react';
import axios from '../config/axios';
import { Upload, FileText, Loader, AlertTriangle, Check } from 'lucide-react';

const TestIdCard = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setResult(null);
        setError(null);
    };

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

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('idCardImage', file);

        try {
            // Use the PUBLIC route for testing
            const res = await axios.post('/api/organizations/analyze-id-card-public', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FileText className="text-teal-400" /> ID Card Extraction Test
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Upload Section */}
                    <div className="space-y-6">
                        <div
                            className={`bg-gray-800 p-6 rounded-xl border transition-all ${dragActive ? 'border-teal-500 bg-teal-500/10' : 'border-gray-700'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <label className="block w-full cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-gray-700/50 transition h-64">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="max-h-full object-contain rounded" />
                                    ) : (
                                        <>
                                            <Upload size={48} className="text-gray-400 mb-4" />
                                            <span className="text-gray-400">Click or Drag to upload ID Card Image</span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition
                                ${!file || loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/50'}
                            `}
                        >
                            {loading ? <Loader className="animate-spin" /> : 'Analyze Image'}
                        </button>

                        {error && (
                            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <p className="text-sm opacity-80">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Results Section */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 min-h-[500px]">
                        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Analysis Results</h2>

                        {loading && (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500 animate-pulse">
                                <Loader size={48} className="mb-4 animate-spin text-teal-500" />
                                <p>Processing image with Gemini AI...</p>
                            </div>
                        )}

                        {!loading && !result && !error && (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <FileText size={48} className="mb-4" />
                                <p>Upload an image to see results</p>
                            </div>
                        )}

                        {result && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${result.analysis.is_id_card ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 'bg-red-900/50 text-red-400 border border-red-500/30'}`}>
                                        {result.analysis.is_id_card ? <Check size={18} /> : <AlertTriangle size={18} />}
                                        {result.analysis.is_id_card ? 'Valid ID Card' : 'Invalid Document'}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Confidence: <span className="text-white font-bold">{result.analysis.confidence_score}%</span>
                                    </div>
                                </div>

                                {result.analysis.signature && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-2">Detected Keywords</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {result.analysis.signature.keywords.map((k, i) => (
                                                    <span key={i} className="bg-purple-900/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-sm">
                                                        {k}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                                <h4 className="text-xs text-gray-500 uppercase mb-1">Institution</h4>
                                                <p className="font-medium">{result.analysis.institution_name || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                                <h4 className="text-xs text-gray-500 uppercase mb-1">Layout Analysis</h4>
                                                <p className="text-sm text-gray-300">{result.analysis.signature.validation_signals.layout}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-4 border-t border-gray-700">
                                    <details>
                                        <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">View Raw JSON</summary>
                                        <pre className="mt-2 bg-black p-4 rounded-lg text-xs text-green-400 overflow-auto max-h-60">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestIdCard;
