import React from 'react';
import { Server, Clock } from 'lucide-react';

const Header = ({ mode, setMode }) => {
    return (
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <Server size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-sm tracking-wide">DOCKER<span className="text-blue-400">VISUALIZER</span></h1>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Engine Running
                    </div>
                </div>
            </div>

            <div className="flex items-center bg-slate-800 rounded-full p-1 border border-slate-700">
                <button
                    onClick={() => setMode('beginner')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${mode === 'beginner' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Débutant
                </button>
                <button
                    onClick={() => setMode('expert')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${mode === 'expert' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Expert
                </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50">
                    <Clock size={12} />
                    <span>Uptime: 2d 4h</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold cursor-pointer">
                    JS
                </div>
            </div>
        </header>
    );
};

export default Header;
