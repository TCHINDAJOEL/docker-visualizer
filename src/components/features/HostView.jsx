import React from 'react';
import { Server, Shield, Trash2, Activity, Cpu, HardDrive, Globe } from 'lucide-react';

const HostView = ({ hostInfo, onPrune, onSecurityCheck }) => {
    return (
        <div className="p-6 overflow-y-auto h-full bg-slate-950 text-slate-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Server className="text-blue-500" />
                Host / Engine Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Version Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Activity size={16} /> Versions
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Client Version</span>
                            <span className="font-mono text-blue-300">{hostInfo.clientVersion}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Server Version</span>
                            <span className="font-mono text-blue-300">{hostInfo.serverVersion}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">API Version</span>
                            <span className="font-mono text-slate-300">{hostInfo.api}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Go Version</span>
                            <span className="font-mono text-slate-300">{hostInfo.goVersion}</span>
                        </div>
                    </div>
                </div>

                {/* System Resources */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Cpu size={16} /> System State
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">OS / Arch</span>
                            <span className="text-slate-300">{hostInfo.os} ({hostInfo.arch})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Kernel</span>
                            <span className="text-slate-300">{hostInfo.kernel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">CPUs</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${hostInfo.cpuLoad || 0}%` }}></div>
                                </div>
                                <span className="text-slate-300 text-xs">{hostInfo.cpus} ({Math.round(hostInfo.cpuLoad || 0)}%)</span>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total Memory</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${hostInfo.memLoad || 0}%` }}></div>
                                </div>
                                <span className="text-slate-300 text-xs">{hostInfo.memory} ({Math.round(hostInfo.memLoad || 0)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage & Network */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <HardDrive size={16} /> Storage & Network
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Storage Driver</span>
                            <span className="text-yellow-300">{hostInfo.storageDriver}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Root Dir</span>
                            <span className="text-slate-300 font-mono text-xs truncate max-w-[150px]" title={hostInfo.rootDir}>{hostInfo.rootDir}</span>
                        </div>
                        <div className="mt-3">
                            <span className="text-slate-500 block mb-1">Network Drivers</span>
                            <div className="flex flex-wrap gap-1">
                                {hostInfo.networkDrivers.map(d => (
                                    <span key={d} className="px-1.5 py-0.5 bg-slate-800 rounded text-xs text-slate-400">{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daemon Options & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Globe size={16} /> Daemon Configuration
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-500">Log Driver</span>
                            <span className="text-slate-300">{hostInfo.daemonOptions.logDriver}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-500">Cgroup Driver</span>
                            <span className="text-slate-300">{hostInfo.daemonOptions.cgroupDriver}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-slate-500 block mb-1">API Listeners</span>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {hostInfo.daemonOptions.hosts.map(h => (
                                    <code key={h} className="px-2 py-1 bg-slate-800 rounded text-xs text-blue-300 font-mono">{h}</code>
                                ))}
                            </div>
                            <span className="text-slate-500 block mb-1">Features</span>
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${hostInfo.daemonOptions.debug ? 'bg-yellow-900/30 text-yellow-500' : 'bg-slate-800 text-slate-500'}`}>Debug</span>
                                <span className={`px-2 py-1 rounded text-xs ${hostInfo.daemonOptions.experimental ? 'bg-blue-900/30 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>Experimental</span>
                                <span className={`px-2 py-1 rounded text-xs ${hostInfo.daemonOptions.liveRestore ? 'bg-green-900/30 text-green-500' : 'bg-slate-800 text-slate-500'}`}>Live Restore</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Shield size={16} /> Security State
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                            <span className="text-slate-400">AppArmor Profile</span>
                            <span className={`font-medium ${hostInfo.security.appArmor === 'enabled' ? 'text-green-400' : 'text-red-400'}`}>
                                {hostInfo.security.appArmor}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                            <span className="text-slate-400">SELinux</span>
                            <span className={`font-medium ${hostInfo.security.seLinux === 'enabled' ? 'text-green-400' : 'text-slate-500'}`}>
                                {hostInfo.security.seLinux}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                            <span className="text-slate-400">Rootless Mode</span>
                            <span className={`font-medium ${hostInfo.security.rootless ? 'text-green-400' : 'text-slate-500'}`}>
                                {hostInfo.security.rootless ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-800 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Maintenance Actions</h3>
                <div className="flex gap-4">
                    <button
                        onClick={onPrune}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                        <span>System Prune (Force)</span>
                    </button>
                    <button
                        onClick={onSecurityCheck}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50 rounded-lg transition-colors"
                    >
                        <Shield size={18} />
                        <span>Run Security Audit</span>
                    </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    * System Prune will remove all stopped containers, all networks not used by at least one container, all dangling images, and all build cache.
                </p>
            </div>
        </div>
    );
};

export default HostView;
