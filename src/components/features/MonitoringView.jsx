import React, { useState, useMemo } from 'react';
import { Activity, Terminal, Clock, AlertTriangle, CheckCircle, XCircle, Filter, Pause, Play, Search } from 'lucide-react';

const MonitoringView = ({ containers, timeline }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'logs', 'events'
    const [logFilter, setLogFilter] = useState('');
    const [isPaused, setIsPaused] = useState(false);

    // --- Dashboard Stats ---
    const stats = useMemo(() => {
        const running = containers.filter(c => c.status === 'running');
        const totalCpu = running.reduce((acc, c) => acc + (c.stats?.cpu || 0), 0);
        const totalMem = running.reduce((acc, c) => acc + (c.stats?.mem || 0), 0);
        const healthy = running.filter(c => !c.health || c.health.status === 'healthy').length;
        const unhealthy = running.filter(c => c.health?.status === 'unhealthy').length;

        return {
            runningCount: running.length,
            totalCpu: totalCpu.toFixed(1),
            totalMem: totalMem.toFixed(0),
            healthy,
            unhealthy
        };
    }, [containers]);

    // --- Consolidated Logs ---
    const allLogs = useMemo(() => {
        let logs = [];
        containers.forEach(c => {
            if (c.logs) {
                c.logs.forEach((msg, idx) => {
                    logs.push({
                        id: `${c.id}-${idx}`,
                        containerName: c.name,
                        message: msg,
                        timestamp: new Date().toISOString(), // Mock timestamp if not present
                        type: msg.toLowerCase().includes('error') ? 'error' : 'info'
                    });
                });
            }
        });
        // Sort by "timestamp" (mock order for now)
        return logs.reverse(); // Newest first
    }, [containers]);

    const filteredLogs = allLogs.filter(log =>
        log.message.toLowerCase().includes(logFilter.toLowerCase()) ||
        log.containerName.toLowerCase().includes(logFilter.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-transparent text-zinc-200">
            {/* Header / Tabs */}
            <div className="flex items-center border-b border-white/10 bg-white/5 px-6 pt-4">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Activity size={16} /> Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Terminal size={16} /> Consolidated Logs
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'events' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Clock size={16} /> Event Timeline
                </button>
            </div>

            <div className="flex-1 overflow-hidden p-6">

                {/* DASHBOARD VIEW */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 h-full overflow-y-auto">
                        {/* Global Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="glass border border-white/10 p-4 rounded-xl">
                                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Total CPU Load</div>
                                <div className="text-2xl font-mono text-blue-400">{stats.totalCpu}%</div>
                                <div className="text-xs text-zinc-600 mt-1">Across {stats.runningCount} containers</div>
                            </div>
                            <div className="glass border border-white/10 p-4 rounded-xl">
                                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Total Memory</div>
                                <div className="text-2xl font-mono text-purple-400">{stats.totalMem} MB</div>
                                <div className="text-xs text-zinc-600 mt-1">Reserved</div>
                            </div>
                            <div className="glass border border-white/10 p-4 rounded-xl">
                                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Health Status</div>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1 text-green-400">
                                        <CheckCircle size={18} /> <span className="text-xl font-bold">{stats.healthy}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-red-400">
                                        <AlertTriangle size={18} /> <span className="text-xl font-bold">{stats.unhealthy}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="glass border border-white/10 p-4 rounded-xl">
                                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Events (24h)</div>
                                <div className="text-2xl font-mono text-zinc-300">{timeline.length}</div>
                                <div className="text-xs text-zinc-600 mt-1">System activities</div>
                            </div>
                        </div>

                        {/* Container Health List */}
                        <div className="glass border border-white/10 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/10 bg-white/5 font-bold text-sm text-zinc-300">
                                Container Health & Resources
                            </div>
                            <div className="divide-y divide-white/10">
                                {containers.filter(c => c.status === 'running').map(container => (
                                    <div key={container.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${container.health?.status === 'unhealthy' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                            <div>
                                                <div className="font-medium text-sm text-zinc-200">{container.name}</div>
                                                <div className="text-xs text-zinc-500 font-mono">{container.id.substring(0, 12)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="w-24">
                                                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                                    <span>CPU</span>
                                                    <span>{container.stats?.cpu?.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, container.stats?.cpu || 0)}%` }} />
                                                </div>
                                            </div>
                                            <div className="w-24">
                                                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                                    <span>MEM</span>
                                                    <span>{container.stats?.mem?.toFixed(0)}MB</span>
                                                </div>
                                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min(100, (container.stats?.mem || 0) / 512 * 100)}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className={`text-xs font-bold ${container.health?.status === 'unhealthy' ? 'text-red-400' : 'text-green-400'}`}>
                                                    {container.health?.status?.toUpperCase() || 'HEALTHY'}
                                                </div>
                                                <div className="text-[10px] text-zinc-500">
                                                    Restart: {container.restartCount || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {containers.filter(c => c.status === 'running').length === 0 && (
                                    <div className="p-8 text-center text-zinc-500 italic">No running containers to monitor.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* LOGS VIEW */}
                {activeTab === 'logs' && (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filter logs by container or keyword..."
                                    value={logFilter}
                                    onChange={e => setLogFilter(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className={`p-2 rounded-lg border ${isPaused ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'}`}
                                title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
                            >
                                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                            </button>
                        </div>

                        <div className="flex-1 bg-black/80 rounded-xl border border-white/10 p-4 font-mono text-xs overflow-y-auto">
                            {filteredLogs.length === 0 ? (
                                <div className="text-zinc-600 text-center mt-10">No logs found matching filters.</div>
                            ) : (
                                filteredLogs.map((log, idx) => (
                                    <div key={log.id || idx} className="mb-1 flex gap-3 hover:bg-white/5 p-0.5 rounded">
                                        <span className="text-zinc-600 shrink-0 w-32 truncate" title={log.timestamp}>
                                            {new Date().toLocaleTimeString()}
                                        </span>
                                        <span className="text-blue-400 shrink-0 w-32 truncate font-bold" title={log.containerName}>
                                            {log.containerName}
                                        </span>
                                        <span className={`break-all ${log.type === 'error' ? 'text-red-400' : 'text-zinc-300'}`}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                            {!isPaused && <div className="animate-pulse text-blue-500 mt-2">_</div>}
                        </div>
                    </div>
                )}

                {/* EVENTS VIEW */}
                {activeTab === 'events' && (
                    <div className="h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
                        <div className="relative border-l-2 border-white/10 ml-4 space-y-8 py-4">
                            {timeline.slice().reverse().map((event, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-slate-950 
                    ${event.type === 'error' ? 'bg-red-500' :
                                            event.type === 'success' ? 'bg-green-500' :
                                                event.type === 'create' ? 'bg-blue-500' :
                                                    event.type === 'delete' ? 'bg-orange-500' : 'bg-slate-500'}`}
                                    />
                                    <div className="glass border border-white/10 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded 
                        ${event.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                    event.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                                        'bg-white/5 text-zinc-400'}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm text-zinc-300">{event.content || event.message}</p>
                                    </div>
                                </div>
                            ))}
                            {timeline.length === 0 && (
                                <div className="pl-6 text-zinc-500 italic">No events recorded yet.</div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MonitoringView;
