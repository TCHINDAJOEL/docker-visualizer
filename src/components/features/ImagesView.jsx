import React, { useState } from 'react';
import { Layers, Trash2, Download, Upload, Tag, Shield, ShieldAlert, Search, MoreVertical, FileText, Clock } from 'lucide-react';

const ImagesView = ({ images, executeCommand, onPull, onPush, onTag, onRemove, onProtect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pullTerm, setPullTerm] = useState('');
  const [selectedImageId, setSelectedImageId] = useState(null);

  const filteredImages = images.filter(img =>
    img.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePullSubmit = (e) => {
    e.preventDefault();
    if (pullTerm.trim()) {
      onPull(pullTerm);
      setPullTerm('');
    }
  };

  return (
    <div className="flex h-full bg-transparent">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header / Toolbar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Layers className="text-blue-500" />
            <h2 className="text-xl font-bold text-zinc-100">Images ({images.length})</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Local */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 w-48"
              />
            </div>

            {/* Pull Image */}
            <form onSubmit={handlePullSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="image:tag"
                value={pullTerm}
                onChange={(e) => setPullTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-48"
              />
              <button type="submit" className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
                <Download size={14} />
                <span>Pull</span>
              </button>
            </form>
          </div>
        </div>

        {/* Image List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Layers size={48} className="mb-4 opacity-20" />
              <p>No images found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImageId(image.id === selectedImageId ? null : image.id)}
                  className={`group relative glass border rounded-xl p-4 transition-all cursor-pointer ${selectedImageId === image.id ? 'border-blue-500 bg-blue-900/10' : 'border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-yellow-500">
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-zinc-200">{image.repository}</h3>
                          <span className="px-1.5 py-0.5 bg-white/5 text-zinc-400 text-xs rounded font-mono">:{image.tag}</span>
                          {image.protected && <Shield size={12} className="text-green-500" title="Protected" />}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                          <span className="font-mono">{image.id.substr(0, 12)}</span>
                          <span>•</span>
                          <span>{image.size}</span>
                          <span>•</span>
                          <span>{new Date(image.created || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); executeCommand(`docker run -d ${image.repository}:${image.tag}`, true); }}
                        className="p-2 hover:bg-blue-900/30 text-zinc-400 hover:text-blue-400 rounded transition-colors"
                        title="Run"
                      >
                        <div className="font-bold text-xs">RUN</div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onPush(image.id); }}
                        className="p-2 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                        title="Push"
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newTag = prompt('Enter new tag (repo:tag):', `${image.repository}:${image.tag}`);
                          if (newTag) onTag(image.id, newTag);
                        }}
                        className="p-2 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                        title="Tag"
                      >
                        <Tag size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onProtect(image.id); }}
                        className={`p-2 hover:bg-white/10 rounded transition-colors ${image.protected ? 'text-green-500' : 'text-zinc-400 hover:text-green-400'}`}
                        title={image.protected ? "Unprotect" : "Protect"}
                      >
                        {image.protected ? <Shield size={16} /> : <ShieldAlert size={16} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
                        className="p-2 hover:bg-red-900/20 text-zinc-400 hover:text-red-400 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedImageId === image.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs animate-in fade-in slide-in-from-top-2">
                      <div>
                        <h4 className="font-bold text-slate-400 mb-2 flex items-center gap-2">
                          <Layers size={12} /> Layers History
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                          {image.layers?.map((layer, idx) => (
                            <div key={idx} className="flex gap-2 p-1.5 bg-black/40 rounded border border-white/10">
                              <span className="text-slate-500 w-4">{idx + 1}.</span>
                              <code className="flex-1 font-mono text-slate-300 truncate" title={layer.cmd}>{layer.cmd}</code>
                              <span className="text-slate-500">{layer.size}</span>
                            </div>
                          )) || <span className="text-slate-500 italic">No layer history available</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-400 mb-2 flex items-center gap-2">
                          <FileText size={12} /> Configuration
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-500 block mb-1">CMD</span>
                            <code className="bg-black/40 px-1.5 py-0.5 rounded text-green-300 font-mono block truncate">
                              {JSON.stringify(image.config?.cmd || [])}
                            </code>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-1">ENV</span>
                            <div className="flex flex-col gap-1">
                              {image.config?.env?.slice(0, 3).map((e, i) => (
                                <code key={i} className="bg-black/40 px-1.5 py-0.5 rounded text-blue-300 font-mono truncate">{e}</code>
                              ))}
                              {(image.config?.env?.length || 0) > 3 && <span className="text-slate-600 italic">+{image.config.env.length - 3} more...</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagesView;
