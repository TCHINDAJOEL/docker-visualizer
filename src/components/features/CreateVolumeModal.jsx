import React, { useState } from 'react';
import { X, Database, Tag } from 'lucide-react';

const CreateVolumeModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        driver: 'local',
        labels: []
    });

    const [labelInput, setLabelInput] = useState({ key: '', value: '' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
        setFormData({ name: '', driver: 'local', labels: [] });
    };

    const addLabel = () => {
        if (labelInput.key) {
            setFormData({
                ...formData,
                labels: [...formData.labels, { ...labelInput }]
            });
            setLabelInput({ key: '', value: '' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Database className="text-purple-400" size={24} />
                        </div>
                        Create Volume
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Volume Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="my-data-volume"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        />
                    </div>

                    {/* Driver Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Driver</label>
                        <select
                            value={formData.driver}
                            onChange={e => setFormData({ ...formData, driver: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
                        >
                            <option value="local">local</option>
                            <option value="nfs">nfs (simulated)</option>
                            <option value="cifs">cifs (simulated)</option>
                        </select>
                    </div>

                    {/* Labels */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Tag size={14} /> Labels
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Key"
                                value={labelInput.key}
                                onChange={e => setLabelInput({ ...labelInput, key: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={labelInput.value}
                                onChange={e => setLabelInput({ ...labelInput, value: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addLabel}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {formData.labels.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.labels.map((label, idx) => (
                                    <span key={idx} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                                        {label.key}={label.value}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, labels: formData.labels.filter((_, i) => i !== idx) })}
                                            className="hover:text-red-400"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
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
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-900/20"
                        >
                            Create Volume
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVolumeModal;
