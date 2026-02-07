import React, { useState } from 'react';
import axios from '../config/axios';
import { Plus, X, Building2, Lock } from 'lucide-react';

const CreateOrganizationModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        accessCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('/api/organizations/create', formData);
            onClose();
            // Optionally trigger a refresh of the list in parent
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-4 ring-1 ring-blue-500/30">
                        <Plus size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Create Organization</h2>
                    <p className="text-gray-400 text-sm">
                        Launch a new secure workspace for your team.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Organization Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="My University"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Access Code</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                name="accessCode"
                                type="text"
                                value={formData.accessCode}
                                onChange={handleChange}
                                placeholder="SecretCode123"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 ml-1">Share this code with members to allow access.</p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating...' : 'Launch Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateOrganizationModal;
