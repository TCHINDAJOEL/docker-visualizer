import React, { useState } from 'react';
import { Network, Box } from 'lucide-react';
import Tooltip from '../common/Tooltip';

const TopologyMap = ({ networks, containers, selectedItem, setSelectedItem, setShowInspector }) => {
    const [hoveredContainer, setHoveredContainer] = useState(null);

    return (
        <div className="relative h-full w-full bg-transparent overflow-hidden flex flex-wrap content-start p-8 gap-8 overflow-y-auto topology-map">
            {networks.map(net => {
                const netContainers = containers.filter(c => c.networks.includes(net.name));
                return (
                    <div key={net.id} className="border border-white/10 rounded-xl glass p-4 min-w-[300px] min-h-[200px] relative group transition-all hover:border-blue-500/50">
                        <Tooltip
                            content={`Réseau ${net.name} - Driver: ${net.driver}, Subnet: ${net.subnet}, Gateway: ${net.gateway}`}
                            position="right"
                        >
                            <div className="absolute -top-3 left-4 px-2 bg-black/60 backdrop-blur text-blue-400 text-xs font-mono border border-white/10 rounded flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Network size={12} />
                                    <span>{net.name} ({net.driver})</span>
                                </div>
                            </div>
                        </Tooltip>
                        <div className="mt-2 text-xs text-zinc-500 font-mono mb-4">{net.subnet}</div>

                        <div className="flex flex-wrap gap-4">
                            {netContainers.length === 0 && (
                                <div className="w-full h-24 flex items-center justify-center text-zinc-600 text-xs italic border-2 border-dashed border-white/5 rounded">
                                    Réseau vide
                                </div>
                            )}
                            {netContainers.map(c => (
                                <Tooltip
                                    key={c.id}
                                    content={
                                        <div>
                                            <div className="font-semibold mb-1">{c.name}</div>
                                            <div>Image: {c.image}</div>
                                            <div>Status: {c.status}</div>
                                            <div>CPU: {c.stats?.cpu?.toFixed(1)}%</div>
                                            <div>RAM: {c.stats?.mem?.toFixed(0)}MB</div>
                                            <div className="mt-1 text-xs text-slate-400">Cliquez pour plus de détails</div>
                                        </div>
                                    }
                                    position="top"
                                >
                                    <div
                                        onClick={() => { setSelectedItem(c.id); setShowInspector(true); }}
                                        onMouseEnter={() => setHoveredContainer(c.id)}
                                        onMouseLeave={() => setHoveredContainer(null)}
                                        className={`w-24 h-24 rounded-lg border-2 cursor-pointer transition-all relative flex flex-col items-center justify-center gap-2
                                      ${selectedItem === c.id ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}
                                      ${c.status === 'running' ? 'bg-green-900/20 border-green-600/50 hover:bg-green-900/40 hover:scale-105' : 'bg-red-900/20 border-red-600/50 hover:bg-red-900/40 hover:scale-105'}
                                      ${hoveredContainer === c.id ? 'shadow-lg shadow-blue-500/20' : ''}
                                  `}
                                    >
                                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${c.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        <Box size={24} className={c.status === 'running' ? 'text-green-400' : 'text-red-400'} />
                                        <div className="text-[10px] font-bold text-slate-300 truncate w-full text-center px-1">{c.name}</div>
                                        <div className="text-[9px] text-slate-500 font-mono">{c.image}</div>
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )
            })}
            {/* Welcome message removed */}
        </div>
    );
};

export default TopologyMap;
