import React from 'react';
import { Server, Clock, Globe, Box } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ mode, setMode }) => {
    const { t, toggleLanguage, language } = useLanguage();

    return (
        <header className="h-16 glass border-b-0 flex items-center px-6 justify-between shrink-0 z-30 relative">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Box size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                        {t('appName').toUpperCase()}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        Engine Running
                    </div>
                </div>
            </div>

            <div className="flex items-center bg-black/20 rounded-full p-1 border border-white/5 backdrop-blur-sm">
                <button
                    onClick={() => setMode('beginner')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === 'beginner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    {t('modeBeginner')}
                </button>
                <button
                    onClick={() => setMode('expert')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === 'expert' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    {t('modeExpert')}
                </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium"
                >
                    <Globe size={12} />
                    <span className="uppercase">{language}</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                    <Clock size={12} />
                    <span>2d 4h</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg shadow-purple-500/20 border border-white/10">
                    JS
                </div>
            </div>
        </header>
    );
};

export default Header;
