import React, { useState } from 'react';
import { Layers, Play, Square, Trash2, Edit, Plus, Check, AlertTriangle, FileText, Activity } from 'lucide-react';
import { generateComposeYaml, parseComposeFile } from '../../utils/yamlParser';

const StacksView = ({ stacks, onDeploy, onStop, onRemove, onCreate }) => {
    const [selectedStackId, setSelectedStackId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editorContent, setEditorContent] = useState('');

    const selectedStack = stacks.find(s => s.id === selectedStackId);

    const handleCreate = () => {
        onCreate();
    };

    const handleEdit = (stack) => {
        setSelectedStackId(stack.id);
        setEditorContent(stack.fileContent || generateComposeYaml(stack.services || {}));
        setIsEditing(true);
    };

    const handleSave = () => {
        // In a real app, this would update the stack definition
        // For now, we'll just toggle edit mode off and pretend we saved
        setIsEditing(false);
        // onUpdate(selectedStackId, editorContent); // TODO: Implement update handler
    };

    return (
        <div className="flex h-full bg-slate-950 text-slate-200">
            {/* Sidebar List */}
            <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-slate-300 flex items-center gap-2">
                        <Layers size={18} className="text-blue-400" /> Stacks
                    </h2>
                    <button onClick={handleCreate} className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {stacks.map(stack => (
                        <button
                            key={stack.id}
                            onClick={() => { setSelectedStackId(stack.id); setIsEditing(false); }}
                            className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group
                                ${selectedStackId === stack.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
                            `}
                        >
                            <div>
                                <div className="font-medium text-sm text-slate-200">{stack.name}</div>
                                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${stack.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                                    {stack.status}
                                </div>
                            </div>
                            {stack.status === 'active' && <Activity size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                    {stacks.length === 0 && (
                        <div className="text-center text-slate-500 text-xs py-8 italic">
                            No stacks found. <br /> Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedStack ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                                    {selectedStack.name}
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${selectedStack.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                        {selectedStack.status}
                                    </span>
                                </h1>
                                <div className="text-xs text-slate-500 mt-1 font-mono">
                                    {Object.keys(selectedStack.services || {}).length} services • {selectedStack.networks?.length || 0} networks
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedStack.status !== 'active' ? (
                                    <button onClick={() => onDeploy(selectedStack.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium flex items-center gap-2">
                                        <Play size={16} /> Deploy
                                    </button>
                                ) : (
                                    <button onClick={() => onStop(selectedStack.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium flex items-center gap-2">
                                        <Square size={16} /> Stop
                                    </button>
                                )}
                                <button onClick={() => handleEdit(selectedStack)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium flex items-center gap-2">
                                    <Edit size={16} /> Edit
                                </button>
                                <button onClick={() => onRemove(selectedStack.id)} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-sm font-medium flex items-center gap-2">
                                    <Trash2 size={16} /> Remove
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex">
                            {isEditing ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-mono ml-2">docker-compose.yml</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">Cancel</button>
                                            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500">Save Changes</button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={editorContent}
                                        onChange={(e) => setEditorContent(e.target.value)}
                                        className="flex-1 bg-black text-slate-300 font-mono text-xs p-4 resize-none focus:outline-none"
                                        spellCheck="false"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Services List */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Services</h3>
                                            {Object.values(selectedStack.services || {}).map((service, idx) => (
                                                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-blue-400">{service.name}</div>
                                                        <div className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">{service.image}</div>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-slate-500 font-mono">
                                                        {service.ports?.length > 0 && (
                                                            <div className="flex gap-2">
                                                                <span className="w-16">Ports:</span>
                                                                <span className="text-slate-300">{service.ports.join(', ')}</span>
                                                            </div>
                                                        )}
                                                        {service.environment?.length > 0 && (
                                                            <div className="flex gap-2">
                                                                <span className="w-16">Env:</span>
                                                                <span className="text-slate-300">{service.environment.length} vars</span>
                                                            </div>
                                                        )}
                                                        {service.volumes?.length > 0 && (
                                                            <div className="flex gap-2">
                                                                <span className="w-16">Volumes:</span>
                                                                <span className="text-slate-300">{service.volumes.join(', ')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Visualization (Placeholder) */}
                                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                                            <Layers size={48} className="text-slate-700 mb-4" />
                                            <h3 className="text-slate-400 font-medium mb-2">Stack Visualization</h3>
                                            <p className="text-xs text-slate-500 max-w-xs">
                                                Visual representation of services, networks, and volumes would appear here.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <Layers size={64} className="opacity-20 mb-4" />
                        <p>Select a stack to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StacksView;
