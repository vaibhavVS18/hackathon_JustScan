import React, { useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const AccessCodeModal = ({ isOpen, onClose, organization }) => {
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen || !organization) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/organizations/verify', {
                organizationId: organization._id,
                accessCode
            });

            const { sessionId } = response.data;

            localStorage.setItem('portal-session-id', sessionId);
            localStorage.setItem('current-org-id', organization._id);
            localStorage.setItem('current-org-name', organization.name);

            onClose();
            navigate(`/portal`);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Access Code');
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

            <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.1)]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-4 ring-1 ring-purple-500/30">
                        <span className="text-2xl font-bold">#</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Private Workspace</h2>
                    <p className="text-gray-400 text-sm">
                        Enter access code for <span className="text-white font-medium">{organization.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="Enter Access Code"
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-center tracking-widest text-lg"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {loading ? 'Verifying...' : 'Unlock Portal'}
                    </button>

                    <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
                        End-to-End Encrypted Session
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AccessCodeModal;
