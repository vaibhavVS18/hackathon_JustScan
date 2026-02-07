import React, { createContext, useState, useCallback, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ id, type, message, onClose }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />
    };

    const styles = {
        success: "border-green-500/20 bg-green-500/10",
        error: "border-red-500/20 bg-red-500/10",
        info: "border-blue-500/20 bg-blue-500/10",
        warning: "border-yellow-500/20 bg-yellow-500/10"
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-in slide-in-from-right-10 fade-in w-80 mb-3 ${styles[type] || styles.info}`}>
            <div className="shrink-0">{icons[type] || icons.info}</div>
            <p className="flex-1 text-sm text-white font-medium">{message}</p>
            <button onClick={() => onClose(id)} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000); // Auto close after 3s
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-24 right-6 z-[100] flex flex-col items-end pointer-events-none">
                <div className="pointer-events-auto">
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={removeToast} />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};
