import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Composant Toast pour afficher des notifications visuelles
 * Améliore le feedback utilisateur selon les meilleures pratiques UX
 */
const Toast = ({ message, type = 'info', onClose, duration = 2000 }) => {
    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, duration);
            return () => {
                clearTimeout(timer);
            };
        }
    }, []);

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-900/90',
            borderColor: 'border-green-500',
            iconColor: 'text-green-400'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-900/90',
            borderColor: 'border-red-500',
            iconColor: 'text-red-400'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-900/90',
            borderColor: 'border-yellow-500',
            iconColor: 'text-yellow-400'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-900/90',
            borderColor: 'border-blue-500',
            iconColor: 'text-blue-400'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor } = config[type];

    return (
        <div className={`${bgColor} ${borderColor} border-l-4 backdrop-blur-xl rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md animate-slideInRight`}>
            <div className="flex items-start gap-3">
                <Icon className={`${iconColor} flex-shrink-0`} size={20} />
                <p className="text-sm text-slate-100 flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

/**
 * Container pour gérer plusieurs toasts
 */
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default Toast;
