import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les notifications toast
 * Permet d'afficher des messages de feedback à l'utilisateur
 */
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) => {
        addToast(message, 'success', duration);
    }, [addToast]);

    const showError = useCallback((message, duration) => {
        addToast(message, 'error', duration);
    }, [addToast]);

    const showWarning = useCallback((message, duration) => {
        addToast(message, 'warning', duration);
    }, [addToast]);

    const showInfo = useCallback((message, duration) => {
        addToast(message, 'info', duration);
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};
