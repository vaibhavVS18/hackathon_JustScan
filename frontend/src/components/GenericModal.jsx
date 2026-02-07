import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const GenericModal = ({ isOpen, onClose, type = 'info', title, message, actionLabel, onAction }) => {
    if (!isOpen) return null;

    const styles = {
        error: {
            icon: <AlertCircle size={32} />,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30'
        },
        success: {
            icon: <CheckCircle size={32} />,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/30'
        },
        info: {
            icon: <Info size={32} />,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30'
        }
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[#0a0a16] border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${currentStyle.bg} ${currentStyle.color} ring-1 ring-inset ${currentStyle.border}`}>
                        {currentStyle.icon}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {onAction && (
                            <button
                                onClick={() => { onAction(); onClose(); }}
                                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                            >
                                {actionLabel || "Confirm"}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`flex-1 py-2.5 rounded-xl text-black text-sm font-medium transition-colors ${type === 'error' ? 'bg-red-500 hover:bg-red-400' : 'bg-white hover:bg-gray-200'}`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericModal;
