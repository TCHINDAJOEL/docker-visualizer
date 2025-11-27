import React from 'react';
import { Search, ChevronRight, Square, Play, RefreshCw, Terminal, Trash2, Activity, Settings, FileText } from 'lucide-react';

const InspectorPanel = ({ selectedItem, containers, setShowInspector, executeCommand }) => {
    if (!selectedItem) return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <Search size={48} className="mb-4 opacity-20" />
            <p>Sélectionnez un conteneur ou un objet pour voir les détails.</p>
        </div>
    );

    const container = containers.find(c => c.id === selectedItem);
    if (!container) return null; // Item deleted

    return (
        <div className="h-full flex flex-col bg-slate-800 border-l border-slate-700">
            {/* Header Inspecteur */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
                <div>
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        {container.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${container.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {container.status}
                        </span>
                    </h2>
                    <div className="font-mono text-xs text-slate-400 mt-1">{container.id}</div>
                </div>
                <button onClick={() => setShowInspector(false)} className="text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Actions Rapides */}
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => executeCommand(container.status === 'running' ? `docker stop ${container.id}` : `docker start ${container.id}`, true)}
                        className={`p-2 rounded flex flex-col items-center gap-1 text-xs font-medium transition-colors
                            ${container.status === 'running' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}
                        `}
                    >
                        {container.status === 'running' ? <Square size={16} /> : <Play size={16} />}
                        {container.status === 'running' ? 'Stop' : 'Start'}
                    </button>
                    <button
                        onClick={() => executeCommand(`docker restart ${container.id}`, true)}
                        className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white flex flex-col items-center gap-1 text-xs"
                    >
                        <RefreshCw size={16} /> Restart
                    </button>
                    <button className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white flex flex-col items-center gap-1 text-xs">
                        <Terminal size={16} /> Exec
                    </button>
                    <button
                        onClick={() => executeCommand(`docker rm ${container.id}`, true)}
                        className="p-2 rounded bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 flex flex-col items-center gap-1 text-xs"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>

                {/* Ressources (Simulées) */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} /> Live Resources
                    </h3>
                    <div className="bg-slate-900 rounded p-3 border border-slate-700">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-blue-400">CPU Usage</span>
                            <span>{container.stats.cpu.toFixed(1)}%</span>
                        </div>
                        <div className="h-16 flex items-end gap-0.5 mt-2">
                            {container.stats.cpuHistory.map((val, i) => (
                                <div key={i} className="flex-1 bg-blue-500/50 rounded-t" style={{ height: `${val}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded p-3 border border-slate-700">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-purple-400">Memory Usage</span>
                            <span>{container.stats.mem.toFixed(0)}MB / 512MB</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${(container.stats.mem / 512) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Settings size={14} /> Configuration
                    </h3>
                    <div className="bg-slate-900 rounded border border-slate-700 text-xs font-mono p-3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Image:</span>
                            <span className="text-yellow-300">{container.image}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Network:</span>
                            <span className="text-blue-300">{container.network}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">IP Address:</span>
                            <span>172.17.0.{containers.findIndex(c => c.id === container.id) + 2}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-2 mt-2">
                            <span className="text-slate-500 block mb-1">Environment:</span>
                            {container.env.map((e, i) => (
                                <div key={i} className="text-slate-300 pl-2 border-l-2 border-slate-700">{e}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Logs */}
                <div className="flex-1 min-h-[150px] flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <FileText size={14} /> Logs (stdout/stderr)
                    </h3>
                    <div className="flex-1 bg-black rounded border border-slate-700 p-2 font-mono text-xs text-slate-300 overflow-y-auto max-h-[200px]">
                        {container.logs.map((log, i) => (
                            <div key={i} className="mb-0.5">{log}</div>
                        ))}
                        {container.status === 'running' && <div className="animate-pulse">_</div>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InspectorPanel;
