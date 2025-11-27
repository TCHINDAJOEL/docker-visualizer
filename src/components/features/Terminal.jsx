import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronDown } from 'lucide-react';

const Terminal = ({ history, onExecute, onClear, mode }) => {
    const [inputCmd, setInputCmd] = useState('');
    const terminalEndRef = useRef(null);

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    return (
        <div className="h-1/3 min-h-[200px] border-t border-slate-800 bg-black flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-10">
            <div className="bg-slate-900 px-4 py-1 flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 select-none">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={12} />
                    <span>Terminal local — /var/run/docker.sock</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClear} className="hover:text-white">Clear</button>
                    <button className="hover:text-white"><ChevronDown size={14} /></button>
                </div>
            </div>

            <div className="flex-1 p-3 font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {history.map((line, i) => (
                    <div key={i} className={`mb-1 break-words ${line.type === 'cmd' ? 'text-slate-300 mt-3 font-bold flex gap-2' :
                            line.type === 'error' ? 'text-red-400 bg-red-900/10 p-1 rounded' :
                                line.type === 'info' ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                        {line.type === 'cmd' && <span className="text-blue-500 select-none">➜</span>}
                        <span className="whitespace-pre-wrap">{line.content}</span>
                    </div>
                ))}
                <div ref={terminalEndRef} />
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!inputCmd.trim()) return;
                    onExecute(inputCmd);
                    setInputCmd('');
                }}
                className="p-2 bg-slate-900/50 border-t border-slate-800 flex items-center gap-2"
            >
                <span className="text-blue-500 font-bold select-none">➜</span>
                <input
                    type="text"
                    value={inputCmd}
                    onChange={(e) => setInputCmd(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono text-sm placeholder-slate-600"
                    placeholder={mode === 'beginner' ? "Tapez 'help' pour la liste des commandes ou suivez le scénario..." : "docker run -it ubuntu bash"}
                    spellCheck={false}
                    autoFocus
                />
            </form>
        </div>
    );
};

export default Terminal;
