import React from 'react';
import { BookOpen, CheckCircle, Circle, ArrowRight, Play, Layers, Server, Terminal, Activity, Trash2, ChevronRight } from 'lucide-react';

const ScenariosView = ({ scenarios, activeScenario, onStartScenario, onNextStep, currentStepIndex, validationState }) => {

    // Icon mapping
    const getIcon = (iconName) => {
        const icons = { Layers, Server, Terminal, Activity, Trash2 };
        const Icon = icons[iconName] || BookOpen;
        return <Icon size={24} />;
    };

    if (activeScenario) {
        // Active Scenario Mode (Overlay/Guide)
        // Note: In the main App, this view might be hidden if user navigates away, 
        // but we can also render a summary here if they come back to "Scenarios" tab.
        // For now, let's assume this view shows the detailed progress when "Scenarios" tab is active.
        const currentStep = activeScenario.steps[currentStepIndex];
        const isLastStep = currentStepIndex === activeScenario.steps.length - 1;

        return (
            <div className="h-full flex flex-col bg-slate-950 text-slate-200 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            {getIcon(activeScenario.icon)}
                            {activeScenario.title}
                        </h1>
                        <p className="text-slate-400">{activeScenario.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Progress */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-4">Progress</h3>
                                <div className="space-y-4">
                                    {activeScenario.steps.map((step, idx) => (
                                        <div key={step.id} className={`flex gap-3 ${idx > currentStepIndex ? 'opacity-50' : ''}`}>
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
                                                    ${idx < currentStepIndex ? 'bg-green-500 border-green-500 text-black' :
                                                        idx === currentStepIndex ? 'bg-blue-600 border-blue-500 text-white' :
                                                            'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    {idx < currentStepIndex ? <CheckCircle size={16} /> : idx + 1}
                                                </div>
                                                {idx < activeScenario.steps.length - 1 && (
                                                    <div className={`w-0.5 h-full my-1 ${idx < currentStepIndex ? 'bg-green-500/50' : 'bg-slate-800'}`}></div>
                                                )}
                                            </div>
                                            <div className="pb-6">
                                                <div className={`text-sm font-medium ${idx === currentStepIndex ? 'text-blue-400' : 'text-slate-300'}`}>
                                                    Step {idx + 1}
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-2">
                                                    {step.instruction}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Current Step */}
                        <div className="lg:col-span-2">
                            <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-8 shadow-lg shadow-blue-900/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                        Current Task
                                    </span>
                                    <span className="text-slate-400 text-sm">Step {currentStepIndex + 1} of {activeScenario.steps.length}</span>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-6">
                                    {currentStep.instruction}
                                </h2>

                                {currentStep.hint && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8">
                                        <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                            <BookOpen size={16} className="text-blue-400" /> Hint
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                            {currentStep.hint}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-800">
                                    <div className="flex items-center gap-2">
                                        {validationState ? (
                                            <span className="text-green-400 flex items-center gap-2 font-medium animate-in fade-in">
                                                <CheckCircle size={20} /> Task Completed
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 flex items-center gap-2 text-sm">
                                                <Circle size={16} /> Waiting for action...
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={onNextStep}
                                        disabled={!validationState && currentStep.autoAdvance !== false}
                                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
                                            ${validationState || currentStep.autoAdvance === false
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        {isLastStep ? 'Finish Scenario' : 'Next Step'}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List Mode
    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-200 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Educational Scenarios</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Learn Docker concepts by doing. Follow these guided interactive scenarios to master containers, networking, and orchestration.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scenarios.map(scenario => (
                        <div key={scenario.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-800 rounded-lg text-blue-400 group-hover:bg-blue-900/20 group-hover:text-blue-300 transition-colors">
                                    {getIcon(scenario.icon)}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${scenario.difficulty === 'Beginner' ? 'bg-green-900/30 text-green-400' :
                                        scenario.difficulty === 'Intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                                            'bg-red-900/30 text-red-400'}`}>
                                    {scenario.difficulty}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>
                            <p className="text-slate-400 text-sm mb-6 h-10 line-clamp-2">
                                {scenario.description}
                            </p>
                            <button
                                onClick={() => onStartScenario(scenario.id)}
                                className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600"
                            >
                                <Play size={18} /> Start Scenario
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScenariosView;
