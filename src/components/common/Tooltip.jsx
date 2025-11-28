import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Composant Tooltip réutilisable pour afficher des informations contextuelles
 * Suit les meilleures pratiques UX pour les outils éducatifs
 */
const Tooltip = ({ children, content, position = 'top', showIcon = false, delay = 300 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800'
    };

    return (
        <div className="relative inline-flex items-center gap-1">
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-flex items-center"
            >
                {children}
                {showIcon && (
                    <HelpCircle size={14} className="text-blue-400/60 hover:text-blue-400 transition-colors ml-1" />
                )}
            </div>

            {isVisible && content && (
                <div className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}>
                    <div className="bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700 max-w-xs whitespace-normal">
                        {content}
                        <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
