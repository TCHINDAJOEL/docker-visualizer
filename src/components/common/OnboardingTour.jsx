import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

/**
 * Composant Onboarding Tour pour guider les nouveaux utilisateurs
 * Utilise un système de 3 étapes (taux de complétion optimal selon les recherches)
 */
const OnboardingTour = ({ isActive, onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const steps = [
        {
            id: 'welcome',
            title: 'Bienvenue dans Docker Visualizer!',
            description: 'Apprenez Docker de manière interactive et visuelle. Ce simulateur fonctionne entièrement dans votre navigateur.',
            action: 'Commencer',
            position: 'center',
            highlight: null
        },
        {
            id: 'terminal',
            title: 'Terminal Docker',
            description: 'Tapez des commandes Docker ici. Essayez "docker run nginx" pour créer votre premier conteneur. Utilisez "help" pour voir toutes les commandes disponibles.',
            action: 'Suivant',
            position: 'bottom-center',
            highlight: '.terminal-container',
            tip: '💡 Astuce: Appuyez sur Tab pour l\'auto-complétion des commandes'
        },
        {
            id: 'topology',
            title: 'Carte Topologique',
            description: 'Visualisez vos conteneurs et réseaux en temps réel. Cliquez sur un conteneur pour voir ses détails, statistiques et logs.',
            action: 'Suivant',
            position: 'top-center',
            highlight: '.topology-map',
            tip: '🎯 Les conteneurs en cours d\'exécution sont en vert'
        },
        {
            id: 'scenarios',
            title: 'Scénarios Guidés',
            description: 'Suivez des scénarios pas-à-pas pour apprendre Docker. Parfait pour les débutants! Allez dans "Scenarios" dans la barre latérale.',
            action: 'Terminer',
            position: 'left',
            highlight: '.sidebar',
            tip: '🎓 Commencez par le scénario "Batch Processing Job"'
        }
    ];

    const currentStepData = steps[currentStep];

    useEffect(() => {
        if (!isActive) return;

        // Calculer la position du tooltip selon l'élément highlighté
        if (currentStepData.highlight) {
            const element = document.querySelector(currentStepData.highlight);
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            }
        }
    }, [currentStep, isActive, currentStepData.highlight]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('onboarding-completed', 'true');
        onComplete();
    };

    const handleSkip = () => {
        localStorage.setItem('onboarding-completed', 'true');
        onSkip();
    };

    if (!isActive) return null;

    // Position centrée pour le premier step
    if (currentStepData.position === 'center') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-scaleIn">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
                                <p className="text-sm text-slate-400">Étape {currentStep + 1} sur {steps.length}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">{currentStepData.description}</p>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
                        >
                            Passer le tutoriel
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/50"
                        >
                            {currentStepData.action}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Position avec highlight pour les autres steps
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Overlay avec highlight */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={handleSkip} />

            {currentStepData.highlight && position.width && (
                <div
                    className="absolute border-4 border-blue-500 rounded-xl pointer-events-none animate-pulse"
                    style={{
                        top: `${position.top - 8}px`,
                        left: `${position.left - 8}px`,
                        width: `${position.width + 16}px`,
                        height: `${position.height + 16}px`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
                    }}
                />
            )}

            {/* Tooltip */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 pointer-events-auto animate-scaleIn">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{currentStepData.title}</h3>
                        <p className="text-sm text-slate-400">Étape {currentStep + 1} sur {steps.length}</p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="text-slate-300 mb-4 leading-relaxed">{currentStepData.description}</p>

                {currentStepData.tip && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-300">{currentStepData.tip}</p>
                    </div>
                )}

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 flex-1 rounded-full transition-all ${
                                    idx <= currentStep ? 'bg-blue-500' : 'bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Précédent
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/50"
                    >
                        {currentStepData.action}
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
