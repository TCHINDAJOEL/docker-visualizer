import React from 'react';
import { Layout, Box, Layers, Network, Database, Activity, Server } from 'lucide-react';
import { SCENARIOS } from '../../data/scenarios';
import { useLanguage } from '../../context/LanguageContext';

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
    const { t } = useLanguage();

    return (
        <aside className="w-64 glass border-r-0 flex flex-col shrink-0 transition-all z-20">

            {/* Menu Principal */}
            <div className="p-3 space-y-1 mt-2">
                {[
                    { id: 'dashboard', icon: Layout, label: t('dashboard') },
                    { id: 'host', icon: Server, label: t('host') },
                    { id: 'containers', icon: Box, label: t('containers'), count: containers.length },
                    { id: 'images', icon: Layers, label: t('images'), count: images.length },
                    { id: 'networks', icon: Network, label: t('networks'), count: networks.length },
                    { id: 'volumes', icon: Database, label: t('volumes'), count: 0 },
                    { id: 'monitoring', icon: Activity, label: t('monitoring') },
                    { id: 'stacks', icon: Layers, label: t('stacks'), count: 1 },
                    { id: 'scenarios', icon: BookIcon, label: t('scenarios'), count: SCENARIOS.length },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 
                            ${activeView === item.id
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-900/20'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'}`}
                    >
                        <div className="flex items-center gap-3">
                            {item.id === 'scenarios' ? <BookIcon /> : <item.icon size={16} />}
                            {item.label}
                        </div>
                        {item.count !== undefined && <span className="bg-black/30 text-zinc-500 px-1.5 py-0.5 rounded text-[10px] border border-white/5">{item.count}</span>}
                    </button>
                ))}
            </div>

            {/* Timeline (Mode Expert) */}
            {mode === 'expert' && (
                <div className="mt-auto border-t border-white/10 p-3 h-1/3 flex flex-col bg-black/20">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity size={12} /> {t('timeline')}
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px]">
                        {timeline.map((event, i) => (
                            <div key={i} className="flex gap-2 text-zinc-400">
                                <span className="opacity-50">{event.time}</span>
                                <span className={event.type === 'error' ? 'text-red-400' : event.type === 'create' ? 'text-green-400' : 'text-blue-400'}>
                                    {event.message}
                                </span>
                            </div>
                        ))}
                        {timeline.length === 0 && <span className="text-zinc-600 italic">Aucun événement récent</span>}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
