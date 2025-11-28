import React from 'react';
import { Database, Trash2, Box, HardDrive } from 'lucide-react';

const VolumesView = ({ volumes, containers, executeCommand, onCreate }) => {
  return (
    <div className="p-6 overflow-y-auto h-full bg-transparent">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-zinc-100">
        <Database className="text-purple-500" />
        Volumes ({volumes.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {volumes.map(volume => {
          const usedBy = containers.filter(c => c.mounts?.some(m => m.source === volume.name));
          const canDelete = usedBy.length === 0;

          return (
            <div
              key={volume.id}
              className="glass border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-purple-400" />
                  <div>
                    <h3 className="font-bold text-white">{volume.name}</h3>
                    <div className="text-xs text-zinc-400">{volume.driver} driver</div>
                  </div>
                </div>
                {canDelete && (
                  <button
                    onClick={() => executeCommand(`docker volume rm ${volume.name}`, true)}
                    className="p-1.5 rounded bg-white/5 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Delete volume"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between p-2 bg-black/40 rounded">
                  <span className="text-zinc-500">Mountpoint</span>
                  <span className="font-mono text-zinc-300 truncate max-w-[150px]" title={volume.mountpoint}>
                    {volume.mountpoint}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-black/40 rounded">
                  <span className="text-zinc-500">Size</span>
                  <span className="font-mono text-purple-300">{volume.size}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-300">{new Date(volume.created).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-xs text-slate-500 mb-2">
                  Used by Containers ({usedBy.length})
                </div>
                {usedBy.length === 0 ? (
                  <div className="text-xs text-slate-600 italic p-2 bg-slate-800/20 rounded text-center">
                    Unused
                  </div>
                ) : (
                  <div className="space-y-1">
                    {usedBy.map(container => (
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
                          {container.mounts.find(m => m.source === volume.name)?.target}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onCreate}
        className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <HardDrive size={16} />
        Create New Volume
      </button>
    </div>
  );
};

export default VolumesView;
