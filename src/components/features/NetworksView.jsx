import React from 'react';
import { Network, Trash2, Box } from 'lucide-react';

const NetworksView = ({ networks, containers, executeCommand }) => {
  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-950">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-200">
        <Network className="text-blue-500" />
        Networks ({networks.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {networks.map(network => {
          const netContainers = containers.filter(c => c.network === network.name);
          const canDelete = !['bridge', 'host', 'none'].includes(network.name) && netContainers.length === 0;

          return (
            <div
              key={network.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network size={18} className="text-blue-400" />
                  <div>
                    <h3 className="font-bold text-white">{network.name}</h3>
                    <div className="text-xs text-slate-400">{network.driver} driver</div>
                  </div>
                </div>
                {canDelete && (
                  <button
                    onClick={() => executeCommand(`docker network rm ${network.id}`, true)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete network"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Network ID</span>
                  <span className="font-mono text-slate-300">{network.id.substr(0, 12)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Subnet</span>
                  <span className="font-mono text-blue-300">{network.subnet}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Scope</span>
                  <span className="text-slate-300">{network.scope}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-xs text-slate-500 mb-2">
                  Connected Containers ({netContainers.length})
                </div>
                {netContainers.length === 0 ? (
                  <div className="text-xs text-slate-600 italic p-2 bg-slate-800/20 rounded text-center">
                    No containers
                  </div>
                ) : (
                  <div className="space-y-1">
                    {netContainers.slice(0, 3).map(container => (
                      <div
                        key={container.id}
                        className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-xs"
                      >
                        <Box
                          size={12}
                          className={container.status === 'running' ? 'text-green-400' : 'text-red-400'}
                        />
                        <span className="text-slate-300">{container.name}</span>
                        <span className="ml-auto text-slate-500 font-mono text-[10px]">
                          {container.status}
                        </span>
                      </div>
                    ))}
                    {netContainers.length > 3 && (
                      <div className="text-xs text-slate-500 text-center p-1">
                        +{netContainers.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const netName = `custom-net-${Date.now()}`;
          executeCommand(`docker network create ${netName}`, true);
        }}
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Network size={16} />
        Create New Network
      </button>
    </div>
  );
};

export default NetworksView;
