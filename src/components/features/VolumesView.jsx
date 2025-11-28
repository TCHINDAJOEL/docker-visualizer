import React from 'react';
import { Database } from 'lucide-react';

const VolumesView = () => {
  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-950">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-200">
        <Database className="text-blue-500" />
        Volumes (0)
      </h2>

      <div className="flex items-center justify-center h-64">
        <div className="text-center text-slate-500">
          <Database size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Aucun volume</p>
          <p className="text-sm mt-2">Les volumes Docker apparaîtront ici</p>
          <p className="text-xs mt-4 text-slate-600">Fonctionnalité en développement</p>
        </div>
      </div>
    </div>
  );
};

export default VolumesView;
