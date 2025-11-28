import React, { useState } from 'react';
import { X, Box, Plus, Trash2 } from 'lucide-react';

const CreateContainerModal = ({ isOpen, onClose, images, networks, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        image: images[0]?.repository || '',
        network: 'bridge',
        ports: [{ host: '', container: '' }],
        env: [{ key: '', value: '' }],
        restartPolicy: 'no',
        cpuLimit: 0,
        memLimit: 0
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
    };

    const addPort = () => setFormData({ ...formData, ports: [...formData.ports, { host: '', container: '' }] });
    const removePort = (idx) => setFormData({ ...formData, ports: formData.ports.filter((_, i) => i !== idx) });
    const updatePort = (idx, field, val) => {
        const newPorts = [...formData.ports];
        newPorts[idx][field] = val;
        setFormData({ ...formData, ports: newPorts });
    };

    const addEnv = () => setFormData({ ...formData, env: [...formData.env, { key: '', value: '' }] });
    const removeEnv = (idx) => setFormData({ ...formData, env: formData.env.filter((_, i) => i !== idx) });
    const updateEnv = (idx, field, val) => {
        const newEnv = [...formData.env];
        newEnv[idx][field] = val;
        setFormData({ ...formData, env: newEnv });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 sticky top-0 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Box className="text-blue-500" /> Create New Container
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Container Name</label>
                            <input
                                type="text"
                                placeholder="e.g. my-web-server"
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                            >
                                {images.map(img => (
                                    <option key={img.id} value={img.repository}>{img.repository}:{img.tag}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Network & Restart */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Network</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={formData.network}
                                onChange={e => setFormData({ ...formData, network: e.target.value })}
                            >
                                {networks.map(net => (
                                    <option key={net.id} value={net.name}>{net.name} ({net.driver})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Restart Policy</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={formData.restartPolicy}
                                onChange={e => setFormData({ ...formData, restartPolicy: e.target.value })}
                            >
                                <option value="no">No</option>
                                <option value="always">Always</option>
                                <option value="on-failure">On Failure</option>
                                <option value="unless-stopped">Unless Stopped</option>
                            </select>
                        </div>
                    </div>

                    {/* Ports */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Port Mapping</label>
                            <button type="button" onClick={addPort} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Plus size={12} /> Add Port
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.ports.map((port, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Host Port (e.g. 8080)"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                                        value={port.host}
                                        onChange={e => updatePort(idx, 'host', e.target.value)}
                                    />
                                    <span className="text-slate-500">:</span>
                                    <input
                                        type="text"
                                        placeholder="Container Port (e.g. 80)"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                                        value={port.container}
                                        onChange={e => updatePort(idx, 'container', e.target.value)}
                                    />
                                    <button type="button" onClick={() => removePort(idx)} className="text-slate-500 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Env Vars */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Environment Variables</label>
                            <button type="button" onClick={addEnv} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Plus size={12} /> Add Env
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.env.map((env, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Key (e.g. DB_HOST)"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                                        value={env.key}
                                        onChange={e => updateEnv(idx, 'key', e.target.value)}
                                    />
                                    <span className="text-slate-500">=</span>
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                                        value={env.value}
                                        onChange={e => updateEnv(idx, 'value', e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeEnv(idx)} className="text-slate-500 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                            Create Container
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContainerModal;
