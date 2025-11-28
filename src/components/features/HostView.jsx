import React, { useState } from 'react';
import { Server, Shield, Activity, HardDrive, Cpu, AlertTriangle, CheckCircle, XCircle, Info, Trash2 } from 'lucide-react';

const HostView = ({ hostInfo, onPrune, onSecurityCheck, securityReport }) => {
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'resources', 'security'

    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Server className="text-blue-500" />
                        Docker Host
                    </h1>
                    <div className="text-sm text-slate-500 mt-1 flex gap-4">
                        <span>{hostInfo.os} ({hostInfo.arch})</span>
                        <span>Kernel: {hostInfo.kernel}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onPrune}
                        className="px-4 py-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 border border-orange-900/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} /> System Prune
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/30 px-6">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    System Info
                </button>
                <button
                    onClick={() => setActiveTab('resources')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resources' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    Resources
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    Security & Compliance
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Info size={20} className="text-blue-400" /> Engine Details
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Docker Version</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.serverVersion}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">API Version</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.api}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Go Version</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.goVersion}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Git Commit</span>
                                    <span className="text-slate-300 font-mono">a5e6543</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Storage Driver</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.storageDriver}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Root Dir</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.rootDir}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-green-400" /> Daemon Configuration
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Debug Mode</span>
                                    <span className={hostInfo.daemonOptions.debug ? "text-orange-400" : "text-slate-300"}>{hostInfo.daemonOptions.debug ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Experimental</span>
                                    <span className={hostInfo.daemonOptions.experimental ? "text-blue-400" : "text-slate-300"}>{hostInfo.daemonOptions.experimental ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Log Driver</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.daemonOptions.logDriver}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Cgroup Driver</span>
                                    <span className="text-slate-300 font-mono">{hostInfo.daemonOptions.cgroupDriver}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Live Restore</span>
                                    <span className="text-green-400">{hostInfo.daemonOptions.liveRestore ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Cpu size={20} className="text-purple-400" /> CPU Usage
                                </h3>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-bold text-white">{hostInfo.cpuLoad?.toFixed(1)}%</span>
                                    <span className="text-slate-500 mb-1">of {hostInfo.cpus} Cores</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full transition-all duration-500"
                                        style={{ width: `${hostInfo.cpuLoad}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <HardDrive size={20} className="text-cyan-400" /> Memory Usage
                                </h3>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-bold text-white">{hostInfo.memLoad?.toFixed(1)}%</span>
                                    <span className="text-slate-500 mb-1">of {hostInfo.memory}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-cyan-500 h-full transition-all duration-500"
                                        style={{ width: `${hostInfo.memLoad}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Host Security Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${hostInfo.security.appArmor === 'enabled' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">AppArmor</div>
                                    <div className="text-lg font-medium text-white capitalize">{hostInfo.security.appArmor}</div>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${hostInfo.security.rootless ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Rootless Mode</div>
                                    <div className="text-lg font-medium text-white">{hostInfo.security.rootless ? 'Enabled' : 'Disabled'}</div>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${!hostInfo.security.apiExposed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">API Exposure</div>
                                    <div className="text-lg font-medium text-white">{hostInfo.security.apiExposed ? 'Exposed (Risk)' : 'Protected'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Section */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Shield className="text-blue-500" /> Security Audit
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1">Scan your environment for common security risks and misconfigurations.</p>
                                </div>
                                <button
                                    onClick={onSecurityCheck}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Run Audit
                                </button>
                            </div>

                            {securityReport ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Score */}
                                    <div className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                                                <circle
                                                    cx="40" cy="40" r="36"
                                                    stroke="currentColor" strokeWidth="8" fill="transparent"
                                                    strokeDasharray={226}
                                                    strokeDashoffset={226 - (226 * securityReport.score) / 100}
                                                    className={`${securityReport.score > 80 ? 'text-green-500' : securityReport.score > 50 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                                />
                                            </svg>
                                            <span className="absolute text-xl font-bold text-white">{securityReport.score}</span>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-white">Security Score</div>
                                            <div className="text-sm text-slate-400">
                                                {securityReport.findings.length === 0
                                                    ? "Great job! No issues found."
                                                    : `Found ${securityReport.findings.length} potential issues.`}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">Last scan: {new Date(securityReport.date).toLocaleTimeString()}</div>
                                        </div>
                                    </div>

                                    {/* Findings List */}
                                    <div className="space-y-3">
                                        {securityReport.findings.map(finding => (
                                            <div key={finding.id} className="bg-black/20 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 ${finding.level === 'critical' ? 'text-red-500' : finding.level === 'high' ? 'text-orange-500' : 'text-yellow-500'}`}>
                                                            <AlertTriangle size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-200 flex items-center gap-2">
                                                                {finding.title}
                                                                <span className="text-xs font-normal px-2 py-0.5 bg-slate-800 rounded text-slate-400">{finding.category}</span>
                                                                {finding.target && <span className="text-xs font-normal px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded font-mono">{finding.target}</span>}
                                                            </h4>
                                                            <p className="text-sm text-slate-400 mt-1">{finding.description}</p>

                                                            <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-700/50">
                                                                <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                    <CheckCircle size={12} /> Recommendation
                                                                </div>
                                                                <p className="text-sm text-slate-300">{finding.fix}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${finding.level === 'critical' ? 'bg-red-900/20 text-red-400 border border-red-900/50' :
                                                            finding.level === 'high' ? 'bg-orange-900/20 text-orange-400 border border-orange-900/50' :
                                                                'bg-yellow-900/20 text-yellow-400 border border-yellow-900/50'
                                                        }`}>
                                                        {finding.level}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Shield size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No audit report available.</p>
                                    <p className="text-sm">Click "Run Audit" to scan your environment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostView;
