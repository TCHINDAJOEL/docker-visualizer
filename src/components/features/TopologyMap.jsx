import React, { useState, useRef, useEffect } from 'react';
import { Network, Box } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { detectConnections } from '../../utils/connectionDetector';

const TopologyMap = ({ networks, containers, selectedItem, setSelectedItem, setShowInspector }) => {
    const [hoveredContainer, setHoveredContainer] = useState(null);
    const [containerPositions, setContainerPositions] = useState({});
    const [showConnections, setShowConnections] = useState(true);
    const containerRefs = useRef({});

    // Calcule les positions des conteneurs pour dessiner les connexions
    useEffect(() => {
        const positions = {};
        Object.keys(containerRefs.current).forEach(id => {
            const el = containerRefs.current[id];
            if (el) {
                const rect = el.getBoundingClientRect();
                const parent = el.closest('.topology-map');
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    positions[id] = {
                        x: rect.left - parentRect.left + el.closest('.topology-map').scrollLeft,
                        y: rect.top - parentRect.top + el.closest('.topology-map').scrollTop,
                        width: rect.width,
                        height: rect.height
                    };
                }
            }
        });
        setContainerPositions(positions);
    }, [containers, networks]);

    // Détecte les connexions entre conteneurs
    const connections = detectConnections(containers);

    return (
        <div className="relative h-full w-full bg-transparent overflow-hidden overflow-y-auto topology-map">
            {/* Bouton toggle connexions */}
            <button
                onClick={() => setShowConnections(!showConnections)}
                className="absolute top-4 right-4 z-10 bg-slate-800/90 hover:bg-slate-700 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white transition-all"
                title={showConnections ? 'Masquer les connexions' : 'Afficher les connexions'}
            >
                {showConnections ? '🔗 Connexions ON' : '🔗 Connexions OFF'}
            </button>

            {/* SVG pour dessiner les connexions */}
            {showConnections && (
                <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
                    {connections.map((conn, idx) => {
                        const fromPos = containerPositions[conn.from];
                        const toPos = containerPositions[conn.to];

                        if (!fromPos || !toPos) return null;

                        const x1 = fromPos.x + fromPos.width / 2;
                        const y1 = fromPos.y + fromPos.height / 2;
                        const x2 = toPos.x + toPos.width / 2;
                        const y2 = toPos.y + toPos.height / 2;

                        // Calcul du point milieu pour le label
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;

                        return (
                            <g key={idx}>
                                {/* Ligne de connexion */}
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={conn.color}
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    opacity="0.6"
                                    markerEnd="url(#arrowhead)"
                                />
                                {/* Label au milieu */}
                                <g>
                                    <rect
                                        x={midX - 30}
                                        y={midY - 10}
                                        width="60"
                                        height="20"
                                        fill="#1e293b"
                                        rx="4"
                                        opacity="0.9"
                                    />
                                    <text
                                        x={midX}
                                        y={midY + 5}
                                        textAnchor="middle"
                                        fill={conn.color}
                                        fontSize="10"
                                        fontWeight="bold"
                                    >
                                        {conn.label}
                                    </text>
                                </g>
                            </g>
                        );
                    })}
                    {/* Définition de la flèche */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
                        </marker>
                    </defs>
                </svg>
            )}

            <div className="relative flex flex-wrap content-start p-8 gap-8 z-10">
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
                                        ref={el => containerRefs.current[c.id] = el}
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
            {/* Info sur les connexions */}
            {showConnections && connections.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-slate-800/90 border border-white/10 rounded-lg p-3 text-xs">
                    <div className="text-white font-semibold mb-1">🔗 Connexions détectées : {connections.length}</div>
                    <div className="text-slate-400 text-[10px]">
                        Les lignes montrent les communications entre conteneurs
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default TopologyMap;
