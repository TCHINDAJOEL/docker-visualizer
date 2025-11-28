import React, { useState } from 'react';
import { Search, ChevronRight, Square, Play, RefreshCw, Terminal, Trash2, Activity, Settings, FileText, Pause, FolderOpen, AlertCircle } from 'lucide-react';

const InspectorPanel = ({ selectedItem, containers, volumes, setShowInspector, executeCommand }) => {
    const [activeTab, setActiveTab] = useState('info'); // info, logs, stats, exec, fs

    if (!selectedItem) return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <Search size={48} className="mb-4 opacity-20" />
            <p>Sélectionnez un conteneur ou un objet pour voir les détails.</p>
        </div>
    );

    const container = containers.find(c => c.id === selectedItem);
    const volume = volumes?.find(v => v.id === selectedItem || v.name === selectedItem);

    // --- VOLUME INSPECTOR ---
    if (volume) {
        return (
            <div className="h-full flex flex-col bg-slate-800 border-l border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <h2 className="font-bold text-lg text-white flex items-center gap-2">
                            <Database size={18} className="text-purple-400" />
                            {volume.name}
                        </h2>
                        <div className="font-mono text-xs text-slate-400 mt-1">{volume.driver}</div>
                    </div>
                    <button onClick={() => setShowInspector(false)} className="text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>

                <div className="flex border-b border-slate-700">
                    <button className="flex-1 py-2 text-xs font-medium uppercase tracking-wider border-b-2 border-purple-500 text-purple-400 bg-slate-800">
                        Info
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="bg-slate-900 rounded border border-slate-700 text-xs font-mono p-3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Created:</span>
                            <span className="text-slate-300">{new Date(volume.created).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Mountpoint:</span>
                            <span className="text-slate-300 truncate max-w-[150px]" title={volume.mountpoint}>{volume.mountpoint}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Size:</span>
                            <span className="text-purple-300">{volume.size}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Simulated Content</h3>
                        <div className="bg-black rounded border border-slate-700 p-2 font-mono text-xs text-slate-300">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                <FolderOpen size={14} /> <span>_data/</span>
                            </div>
                            <div className="pl-4 space-y-1">
                                <div className="flex items-center gap-2">
                                    <FileText size={12} className="text-slate-500" /> db.sqlite
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText size={12} className="text-slate-500" /> config.json
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText size={12} className="text-slate-500" /> data.bin
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!container) return null; // Item deleted

    return (
        <div className="h-full flex flex-col bg-slate-800 border-l border-slate-700">
            {/* Header Inspecteur */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
                <div>
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        {container.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${container.status === 'running' ? 'bg-green-500/20 text-green-400' :
                            container.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {container.status}
                        </span>
                    </h2>
                    <div className="font-mono text-xs text-slate-400 mt-1">{container.id}</div>
                </div>
                <button onClick={() => setShowInspector(false)} className="text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
            </div>

            {/* Actions Rapides */}
            <div className="p-2 grid grid-cols-5 gap-1 border-b border-slate-700 bg-slate-800">
                <button
                    onClick={() => executeCommand(container.status === 'running' ? `docker stop ${container.id}` : `docker start ${container.id}`, true)}
                    className={`p-1.5 rounded flex flex-col items-center gap-1 text-[10px] font-medium transition-colors
                        ${container.status === 'running' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}
                    `}
                    title={container.status === 'running' ? 'Stop' : 'Start'}
                >
                    {container.status === 'running' ? <Square size={14} /> : <Play size={14} />}
                </button>
                <button
                    onClick={() => executeCommand(container.status === 'paused' ? `docker unpause ${container.id}` : `docker pause ${container.id}`, true)}
                    className={`p-1.5 rounded flex flex-col items-center gap-1 text-[10px] font-medium transition-colors
                        ${container.status === 'paused' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}
                    `}
                    disabled={container.status === 'exited'}
                    title={container.status === 'paused' ? 'Unpause' : 'Pause'}
                >
                    {container.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                    onClick={() => executeCommand(`docker restart ${container.id}`, true)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white flex flex-col items-center gap-1 text-[10px]"
                    title="Restart"
                >
                    <RefreshCw size={14} />
                </button>
                <button
                    onClick={() => {
                        if (container.status === 'running') {
                            executeCommand(`docker exec -it ${container.id} /bin/sh`, true);
                            setActiveTab('exec');
                        }
                    }}
                    className={`p-1.5 rounded ${container.status === 'running' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} flex flex-col items-center gap-1 text-[10px]`}
                    disabled={container.status !== 'running'}
                    title="Exec"
                >
                    <Terminal size={14} />
                </button>
                <button
                    onClick={() => executeCommand(`docker rm ${container.id}`, true)}
                    className="p-1.5 rounded bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 flex flex-col items-center gap-1 text-[10px]"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-700">
                {['info', 'logs', 'stats', 'exec', 'fs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400 bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* INFO TAB */}
                {activeTab === 'info' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-slate-900 rounded border border-slate-700 text-xs font-mono p-3 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Image:</span>
                                <span className="text-yellow-300">{container.image}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Networks:</span>
                                <span className="text-blue-300 text-right">{container.networks?.join(', ') || 'none'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">IP Address:</span>
                                <span>172.17.0.{containers.findIndex(c => c.id === container.id) + 2}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Restart Policy:</span>
                                <span className="text-slate-300">{container.restartPolicy || 'no'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created:</span>
                                <span className="text-slate-300">{new Date(container.created).toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Environment</h3>
                            <div className="bg-slate-900 rounded border border-slate-700 p-2 text-xs font-mono space-y-1">
                                {container.env?.map((e, i) => (
                                    <div key={i} className="text-slate-300 break-all">{e}</div>
                                )) || <span className="text-slate-600 italic">No environment variables</span>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ports</h3>
                            <div className="bg-slate-900 rounded border border-slate-700 p-2 text-xs font-mono space-y-1">
                                {container.ports?.map((p, i) => (
                                    <div key={i} className="text-slate-300">{p}</div>
                                )) || <span className="text-slate-600 italic">No ports mapped</span>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mounts</h3>
                            <div className="bg-slate-900 rounded border border-slate-700 p-2 text-xs font-mono space-y-1">
                                {container.mounts?.map((m, i) => (
                                    <div key={i} className="text-slate-300 flex justify-between">
                                        <span className="text-purple-400">{m.source}</span>
                                        <span className="text-slate-500">→</span>
                                        <span>{m.target}</span>
                                    </div>
                                )) || <span className="text-slate-600 italic">No volumes mounted</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex-1 bg-black rounded border border-slate-700 p-2 font-mono text-xs text-slate-300 overflow-y-auto">
                            {container.logs?.map((log, i) => (
                                <div key={i} className="mb-0.5 border-l-2 border-transparent hover:border-blue-500 pl-1">{log}</div>
                            )) || <div className="text-slate-500 italic">No logs available</div>}
                            {container.status === 'running' && <div className="animate-pulse text-blue-500">_</div>}
                        </div>
                    </div>
                )}

                {/* STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-slate-900 rounded p-3 border border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-blue-400 flex items-center gap-2"><Activity size={14} /> CPU Usage</span>
                                <span className="font-mono">{container.stats?.cpu?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="h-24 flex items-end gap-0.5 mt-2 border-b border-slate-800 pb-1">
                                {container.stats?.cpuHistory?.map((val, i) => (
                                    <div key={i} className="flex-1 bg-blue-500/50 rounded-t transition-all duration-300" style={{ height: `${Math.min(100, val)}%` }}></div>
                                )) || <div className="w-full text-center text-slate-600 text-[10px]">No data</div>}
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded p-3 border border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-purple-400 flex items-center gap-2"><Activity size={14} /> Memory Usage</span>
                                <span className="font-mono">{container.stats?.mem?.toFixed(0) || 0}MB / 512MB</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                                <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${((container.stats?.mem || 0) / 512) * 100}%` }}></div>
                            </div>
                            <div className="h-16 flex items-end gap-0.5 mt-2">
                                {container.stats?.memHistory?.map((val, i) => (
                                    <div key={i} className="flex-1 bg-purple-500/30 rounded-t transition-all duration-300" style={{ height: `${Math.min(100, (val / 512) * 100)}%` }}></div>
                                )) || <div className="w-full text-center text-slate-600 text-[10px]">No data</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* EXEC TAB */}
                {activeTab === 'exec' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-black flex-1 rounded border border-slate-700 p-2 font-mono text-xs text-green-400">
                            <div className="mb-2">root@{container.id.substr(0, 12)}:/# ls -la</div>
                            <div className="text-slate-300 mb-2">
                                drwxr-xr-x   1 root root 4096 Nov 28 01:00 .<br />
                                drwxr-xr-x   1 root root 4096 Nov 28 01:00 ..<br />
                                -rwxr-xr-x   1 root root    0 Nov 28 01:00 .dockerenv<br />
                                drwxr-xr-x   2 root root 4096 Nov 28 01:00 bin<br />
                                drwxr-xr-x   2 root root 4096 Nov 28 01:00 boot<br />
                                drwxr-xr-x   5 root root  360 Nov 28 01:00 dev<br />
                                drwxr-xr-x   1 root root 4096 Nov 28 01:00 etc<br />
                                drwxr-xr-x   2 root root 4096 Nov 28 01:00 home<br />
                            </div>
                            <div className="flex items-center gap-1">
                                <span>root@{container.id.substr(0, 12)}:/#</span>
                                <span className="w-2 h-4 bg-green-400 animate-pulse"></span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">
                            * This is a simulated interactive terminal.
                        </p>
                    </div>
                )}

                {/* FILESYSTEM TAB */}
                {activeTab === 'fs' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-slate-900 rounded border border-slate-700 p-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FolderOpen size={14} /> Filesystem Changes (docker diff)
                            </h3>
                            <div className="space-y-1 font-mono text-xs">
                                <div className="flex gap-2 text-yellow-400">
                                    <span>C</span>
                                    <span>/etc/nginx/conf.d</span>
                                </div>
                                <div className="flex gap-2 text-green-400">
                                    <span>A</span>
                                    <span>/etc/nginx/conf.d/default.conf</span>
                                </div>
                                <div className="flex gap-2 text-yellow-400">
                                    <span>C</span>
                                    <span>/var/log/nginx</span>
                                </div>
                                <div className="flex gap-2 text-green-400">
                                    <span>A</span>
                                    <span>/var/log/nginx/access.log</span>
                                </div>
                                <div className="flex gap-2 text-green-400">
                                    <span>A</span>
                                    <span>/var/log/nginx/error.log</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-900/50 rounded p-3 flex gap-2 items-start">
                            <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-200">
                                'A' = Added, 'C' = Changed, 'D' = Deleted. These changes are ephemeral and will be lost if the container is removed.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InspectorPanel;
