import React from 'react';
import { Layers, Trash2 } from 'lucide-react';

const ImagesView = ({ images, executeCommand }) => {
  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-950">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-200">
        <Layers className="text-blue-500" />
        Images ({images.length})
      </h2>

      {images.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-slate-500">
            <Layers size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Aucune image</p>
            <p className="text-sm mt-2">Les images apparaîtront ici après un 'docker run'</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(image => (
            <div
              key={image.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-yellow-400" />
                  <div>
                    <h3 className="font-bold text-white">{image.repository}</h3>
                    <div className="text-xs text-slate-400 font-mono">:{image.tag}</div>
                  </div>
                </div>
                <button
                  onClick={() => executeCommand(`docker rmi ${image.id}`, true)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Image ID</span>
                  <span className="font-mono text-slate-300">{image.id.substr(0, 12)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Size</span>
                  <span className="font-mono text-blue-300">{image.size}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-500">Layers</span>
                  <span className="text-slate-300">{image.layers}</span>
                </div>
              </div>

              <button
                onClick={() => executeCommand(`docker run -d ${image.repository}`, true)}
                className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
              >
                Run Container
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesView;
