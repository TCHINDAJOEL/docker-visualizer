import React, { useState } from 'react';
import { X, Network, Plus, Shield, Globe, Server } from 'lucide-react';

const CreateNetworkModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        driver: 'bridge',
        subnet: '',
        gateway: '',
        scope: 'local',
        internal: false,
        attachable: true
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
        setFormData({
            name: '',
            driver: 'bridge',
            subnet: '',
            gateway: '',
            scope: 'local',
            internal: false,
            attachable: true
        });
    };

    const drivers = [
        { id: 'bridge', icon: Network, label: 'Bridge', desc: 'Default network driver. Containers can communicate on the same host.' },
        { id: 'host', icon: Server, label: 'Host', desc: 'Remove network isolation between the container and the Docker host.' },
        { id: 'overlay', icon: Globe, label: 'Overlay', desc: 'Enable swarm services to communicate with each other.' },
        { id: 'macvlan', icon: Shield, label: 'Macvlan', desc: 'Assign a MAC address to a container, making it appear as a physical device.' },
        { id: 'none', icon: X, label: 'None', desc: 'Disable all networking.' }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Network className="text-blue-400" size={24} />
                        </div>
                        Create Network
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Network Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="my-custom-network"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Driver Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Network Driver</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {drivers.map(driver => (
                                <button
                                    key={driver.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, driver: driver.id })}
                                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${formData.driver === driver.id
                                            ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/50'
                                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                                        }`}
                                >
                                    <driver.icon size={18} className={formData.driver === driver.id ? 'text-blue-400' : 'text-slate-400'} />
                                    <div>
                                        <div className={`text-sm font-medium ${formData.driver === driver.id ? 'text-blue-100' : 'text-slate-300'}`}>
                                            {driver.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                            {driver.desc}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Subnet (CIDR)</label>
                            <input
                                type="text"
                                value={formData.subnet}
                                onChange={e => setFormData({ ...formData, subnet: e.target.value })}
                                placeholder="172.20.0.0/16"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Gateway</label>
                            <input
                                type="text"
                                value={formData.gateway}
                                onChange={e => setFormData({ ...formData, gateway: e.target.value })}
                                placeholder="172.20.0.1"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.internal ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                                {formData.internal && <Plus size={10} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={formData.internal} onChange={e => setFormData({ ...formData, internal: e.target.checked })} />
                            <span className="text-sm text-slate-400 group-hover:text-slate-300">Internal Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.attachable ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                                {formData.attachable && <Plus size={10} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={formData.attachable} onChange={e => setFormData({ ...formData, attachable: e.target.checked })} />
                            <span className="text-sm text-slate-400 group-hover:text-slate-300">Attachable</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
                        >
                            Create Network
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNetworkModal;
