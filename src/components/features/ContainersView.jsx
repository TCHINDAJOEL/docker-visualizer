import React from 'react';
import { Box, Play, Square, Trash2, Activity } from 'lucide-react';

const ContainersView = ({ containers, setSelectedItem, setShowInspector, executeCommand }) => {
  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-950">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-200">
        <Box className="text-blue-500" />
        Containers ({containers.length})
      </h2>

      {containers.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-slate-500">
            <Box size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Aucun conteneur</p>
            <p className="text-sm mt-2">Utilisez 'docker run' pour créer un conteneur</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {containers.map(container => (
            <div
              key={container.id}
              onClick={() => { setSelectedItem(container.id); setShowInspector(true); }}
              className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/50 ${
                container.status === 'running' ? 'border-green-900/50' : 'border-red-900/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Box
                      size={20}
                      className={container.status === 'running' ? 'text-green-400' : 'text-red-400'}
                    />
                    <h3 className="font-bold text-lg text-white">{container.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                        container.status === 'running'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {container.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono space-y-1">
                    <div>ID: {container.id}</div>
                    <div>Image: <span className="text-yellow-300">{container.image}</span></div>
                    <div>Network: <span className="text-blue-300">{container.network}</span></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      executeCommand(
                        container.status === 'running'
                          ? `docker stop ${container.id}`
                          : `docker start ${container.id}`,
                        true
                      );
                    }}
                    className={`p-2 rounded transition-colors ${
                      container.status === 'running'
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                    }`}
                  >
                    {container.status === 'running' ? <Square size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      executeCommand(`docker rm ${container.id}`, true);
                    }}
                    className="p-2 rounded bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {container.status === 'running' && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="flex items-center gap-2 text-xs text-blue-400 mb-1">
                      <Activity size={12} />
                      CPU Usage
                    </div>
                    <div className="text-lg font-bold text-white">{container.stats.cpu.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-xs text-purple-400 mb-1">Memory</div>
                    <div className="text-lg font-bold text-white">{container.stats.mem.toFixed(0)} MB</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContainersView;
