import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronDown, Lightbulb } from 'lucide-react';

const Terminal = ({ history, onExecute, onClear, context }) => {
    const [inputCmd, setInputCmd] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
    const [showHints, setShowHints] = useState(true);
    const terminalContentRef = useRef(null);
    const inputRef = useRef(null);

    // Commandes disponibles pour l'auto-complétion
    const dockerCommands = [
        'docker run',
        'docker ps',
        'docker ps -a',
        'docker stop',
        'docker start',
        'docker restart',
        'docker rm',
        'docker rm -f',
        'docker logs',
        'docker exec -it',
        'docker inspect',
        'docker images',
        'docker rmi',
        'docker network create',
        'docker network ls',
        'docker network rm',
        'docker network connect',
        'docker network disconnect',
        'docker volume create',
        'docker volume ls',
        'docker volume rm',
        'docker volume inspect',
        'docker volume prune',
        'help',
        'clear'
    ];

    // Suggestions populaires pour débutants
    const quickCommands = [
        { cmd: 'docker run nginx', desc: 'Créer un serveur web nginx' },
        { cmd: 'docker ps', desc: 'Lister les conteneurs actifs' },
        { cmd: 'docker run -d --name db postgres', desc: 'Base de données PostgreSQL' },
        { cmd: 'help', desc: 'Voir toutes les commandes' }
    ];

    const getPrompt = () => {
        if (context?.type === 'container') {
            return `root@${context.containerId.substring(0, 12)}:${context.cwd}#`;
        }
        return '➜';
    };

    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Gérer les suggestions d'auto-complétion
    const handleInputChange = (value) => {
        setInputCmd(value);

        if (value.trim()) {
            const filtered = dockerCommands.filter(cmd =>
                cmd.toLowerCase().startsWith(value.toLowerCase())
            );
            setSuggestions(filtered);
            setSelectedSuggestion(-1);
        } else {
            setSuggestions([]);
        }
    };

    // Gérer la navigation au clavier dans les suggestions
    const handleKeyDown = (e) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestion(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                if (selectedSuggestion >= 0) {
                    setInputCmd(suggestions[selectedSuggestion]);
                } else if (suggestions.length > 0) {
                    setInputCmd(suggestions[0]);
                }
                setSuggestions([]);
            } else if (e.key === 'Escape') {
                setSuggestions([]);
                setSelectedSuggestion(-1);
            }
        }
    };

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalContentRef.current) {
            terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div
            className="h-1/3 min-h-[200px] border-t border-white/10 bg-black/80 backdrop-blur-xl flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-10 cursor-text terminal-container relative"
            onClick={handleContainerClick}
        >
            <div className="bg-white/5 px-4 py-1 flex justify-between items-center text-xs text-zinc-400 border-b border-white/5 select-none">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={12} />
                    <span>{context?.type === 'container' ? `Container: ${context.containerId}` : 'Terminal local — /var/run/docker.sock'}</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowHints(!showHints)}
                        className="hover:text-white flex items-center gap-1"
                        title="Afficher/Masquer les suggestions"
                    >
                        <Lightbulb size={12} />
                        Hints
                    </button>
                    <button onClick={onClear} className="hover:text-white">Clear</button>
                    <button className="hover:text-white"><ChevronDown size={14} /></button>
                </div>
            </div>

            <div ref={terminalContentRef} className="flex-1 p-3 font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {/* Suggestions rapides pour débutants */}
                {showHints && history.length === 0 && (
                    <div className="mb-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Lightbulb size={14} />
                            <span className="font-semibold text-xs">Commandes rapides pour commencer:</span>
                        </div>
                        <div className="space-y-2">
                            {quickCommands.map((qc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInputCmd(qc.cmd);
                                        inputRef.current?.focus();
                                    }}
                                    className="block w-full text-left hover:bg-blue-500/10 p-2 rounded transition-colors"
                                >
                                    <code className="text-green-400 text-xs">{qc.cmd}</code>
                                    <p className="text-slate-400 text-xs mt-0.5">{qc.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {history.map((line, i) => (
                    <div key={i} className={`mb-1 break-words ${line.type === 'cmd' ? 'text-slate-300 mt-3 font-bold flex gap-2' :
                        line.type === 'error' ? 'text-red-400 bg-red-900/10 p-1 rounded' :
                            line.type === 'info' ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                        {line.type === 'cmd' && <span className="text-green-500 select-none mr-2">{line.prompt || getPrompt()}</span>}
                        <span className="whitespace-pre-wrap">{line.content}</span>
                    </div>
                ))}

            </div>

            <div className="relative">
                {/* Suggestions d'auto-complétion */}
                {suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 bg-slate-800 border border-slate-700 rounded-t-lg shadow-xl max-h-40 overflow-y-auto">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setInputCmd(suggestion);
                                    setSuggestions([]);
                                    inputRef.current?.focus();
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm font-mono transition-colors ${
                                    idx === selectedSuggestion
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {suggestion}
                            </button>
                        ))}
                        <div className="px-4 py-1 text-xs text-slate-500 bg-slate-900 border-t border-slate-700">
                            Utilisez ↑↓ pour naviguer, Tab pour compléter
                        </div>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!inputCmd.trim()) return;
                        onExecute(inputCmd);
                        setInputCmd('');
                        setSuggestions([]);
                    }}
                    className="p-2 bg-slate-900/50 border-t border-slate-800 flex items-center gap-2"
                >
                    <span className="text-green-500 font-bold select-none">{getPrompt()}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputCmd}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono text-sm placeholder-slate-600"
                        placeholder="Tapez une commande Docker ou 'help'"
                        spellCheck={false}
                        autoFocus
                    />
                </form>
            </div>
        </div>
    );
};

export default Terminal;
