import React from 'react';
import { BookOpen, X, CheckCircle, Circle } from 'lucide-react';

/**
 * Bannière flottante qui montre le scénario actif et la progression
 * Visible sur toutes les vues pour garder l'utilisateur informé
 */
const ActiveScenarioBanner = ({ activeScenario, currentStepIndex, validationState, onViewScenario, onCancel }) => {
    if (!activeScenario) return null;

    const currentStep = activeScenario.steps[currentStepIndex];
    if (!currentStep) return null;
    const progress = ((currentStepIndex + 1) / activeScenario.steps.length) * 100;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full px-4 animate-slideInUp">
            <div className="bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-xl border border-blue-500/50 rounded-xl shadow-2xl shadow-blue-900/50 overflow-hidden">
                {/* Barre de progression */}
                <div className="h-1 bg-black/30">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen size={20} className="text-blue-300" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-white font-bold text-sm truncate">
                                        {activeScenario.title}
                                    </h3>
                                    <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                        Étape {currentStepIndex + 1}/{activeScenario.steps.length}
                                    </span>
                                </div>

                                <p className="text-blue-200 text-xs mb-2 line-clamp-1">
                                    {currentStep.instruction}
                                </p>

                                <div className="flex items-center gap-2">
                                    {validationState ? (
                                        <div className="flex items-center gap-1 text-green-400 text-xs animate-scaleIn">
                                            <CheckCircle size={14} />
                                            <span className="font-medium">Complété !</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                            <Circle size={14} className="animate-pulse" />
                                            <span>En cours...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={onViewScenario}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all"
                            >
                                Voir Détails
                            </button>
                            <button
                                onClick={onCancel}
                                className="w-8 h-8 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 rounded-lg transition-all flex items-center justify-center"
                                title="Annuler le scénario"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveScenarioBanner;
