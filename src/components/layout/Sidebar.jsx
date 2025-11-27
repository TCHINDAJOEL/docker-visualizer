import React from 'react';
import { Layout, Box, Layers, Network, Database, Activity } from 'lucide-react';
import { SCENARIOS } from '../../data/mockData';

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);

const Sidebar = ({
    mode, activeView, setActiveView,
    containers, images, networks,
    activeScenario, setActiveScenario,
    currentStepIndex, setCurrentStepIndex,
    executeCommand, timeline
}) => {
    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all">

            {/* Menu Principal */}
            <div className="p-3 space-y-1">
                {[
                    { id: 'dashboard', icon: Layout, label: 'Dashboard' },
                    { id: 'containers', icon: Box, label: 'Containers', count: containers.length },
                    { id: 'images', icon: Layers, label: 'Images', count: images.length },
                    { id: 'networks', icon: Network, label: 'Networks', count: networks.length },
                    { id: 'volumes', icon: Database, label: 'Volumes', count: 0 },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeView === item.id ? 'bg-blue-900/30 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={16} />
                            {item.label}
                        </div>
                        {item.count !== undefined && <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">{item.count}</span>}
                    </button>
                ))}
            </div>

            {/* Zone Scénarios (Mode Débutant) */}
            {mode === 'beginner' && (
                <div className="mt-6 px-3 flex-1 overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                        <BookIcon /> Scénarios d'apprentissage
                    </h3>
                    <div className="space-y-3">
                        {SCENARIOS.map(sc => (
                            <div
                                key={sc.id}
                                onClick={() => { setActiveScenario(sc); setCurrentStepIndex(0); }}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${activeScenario?.id === sc.id ? 'border-blue-500 bg-blue-900/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-sm text-slate-200">{sc.title}</h4>
                                    {activeScenario?.id === sc.id && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">Actif</span>}
                                </div>

                                {activeScenario?.id === sc.id ? (
                                    <div className="space-y-2 mt-2">
                                        {sc.steps.map((step, idx) => (
                                            <div key={idx} className={`text-xs flex gap-2 ${idx === currentStepIndex ? 'text-blue-300 font-medium' : idx < currentStepIndex ? 'text-green-500 line-through opacity-50' : 'text-slate-500'}`}>
                                                <span>{idx + 1}.</span>
                                                <span>{step.desc}</span>
                                            </div>
                                        ))}
                                        <div className="mt-3 p-2 bg-slate-900 rounded border border-blue-900/50">
                                            <p className="text-[10px] text-slate-400 mb-1">Commande à taper :</p>
                                            <code className="text-xs text-green-400 font-mono block bg-black/30 p-1 rounded">
                                                {sc.steps[currentStepIndex]?.cmd || "Scénario terminé ! 🎉"}
                                            </code>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); executeCommand(sc.steps[currentStepIndex]?.cmd, true); }}
                                                className="w-full mt-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                                                disabled={currentStepIndex >= sc.steps.length}
                                            >
                                                Exécuter Auto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">{sc.steps.length} étapes • Débutant</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline (Mode Expert) */}
            {mode === 'expert' && (
                <div className="mt-auto border-t border-slate-800 p-3 h-1/3 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity size={12} /> Timeline
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px]">
                        {timeline.map((event, i) => (
                            <div key={i} className="flex gap-2 text-slate-400">
                                <span className="opacity-50">{event.time}</span>
                                <span className={event.type === 'error' ? 'text-red-400' : event.type === 'create' ? 'text-green-400' : 'text-blue-400'}>
                                    {event.message}
                                </span>
                            </div>
                        ))}
                        {timeline.length === 0 && <span className="text-slate-600 italic">Aucun événement récent</span>}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
