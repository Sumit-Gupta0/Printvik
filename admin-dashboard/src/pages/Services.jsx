import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Settings, DollarSign, FileText, Layers, Clock, Tag, Image as ImageIcon, X, ChevronRight, ChevronDown, Store, Smartphone, Upload, CheckSquare, Eye
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Services = () => {
    const { token } = useAuthStore();
    const [services, setServices] = useState([]);
    const [operators, setOperators] = useState([]); // For Availability Tab
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // general, config, pricing, availability
    const [previewImage, setPreviewImage] = useState(null); // For Image Preview Modal

    // Service Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'printing',
        icon: '📄', // Default emoji icon
        turnaroundTime: '24 Hours',
        isActive: true,
        options: [], // Form Builder Options
        allowedOperators: [], // Shop IDs
        pricing: {
            basePrice: 0,
            perUnit: 'per-page',
            bulkTiers: [] // Bulk Pricing Tiers
        }
    });

    useEffect(() => {
        fetchServices();
        fetchOperators();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/services`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch services');
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users?role=operator`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Assuming the API returns users in data.data or similar structure. Adjust based on actual API response.
            // If the API returns { success: true, count: N, data: [...] }
            setOperators(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch operators", err);
        }
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/admin/services/${editingService._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/admin/services`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            fetchServices();
            setShowModal(false);
            setEditingService(null);
            resetForm();
        } catch (err) {
            setError('Failed to save service');
        }
    };

    const handleDeleteService = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/services/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchServices();
            } catch (err) {
                setError('Failed to delete service');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'printing',
            icon: '📄',
            turnaroundTime: '24 Hours',
            isActive: true,
            options: [],
            allowedOperators: [],
            pricing: {
                basePrice: 0,
                perUnit: 'per-page',
                bulkTiers: []
            }
        });
        setActiveTab('general');
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            category: service.category || 'printing',
            icon: service.icon || '📄',
            turnaroundTime: service.turnaroundTime || '24 Hours',
            isActive: service.isActive,
            options: service.options || [],
            allowedOperators: service.allowedOperators || [],
            pricing: {
                basePrice: service.pricing?.basePrice || 0,
                perUnit: service.pricing?.perUnit || 'per-page',
                bulkTiers: service.pricing?.bulkTiers || []
            }
        });
        setShowModal(true);
    };

    // --- Form Builder Helpers ---
    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { label: 'New Option', type: 'DROPDOWN', required: false, values: [] }]
        });
    };

    const removeOption = (index) => {
        const newOptions = [...formData.options];
        newOptions.splice(index, 1);
        setFormData({ ...formData, options: newOptions });
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOptionValue = (optionIndex) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex].values.push({ name: 'New Value', priceModifier: 0 });
        setFormData({ ...formData, options: newOptions });
    };

    const removeOptionValue = (optionIndex, valueIndex) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex].values.splice(valueIndex, 1);
        setFormData({ ...formData, options: newOptions });
    };

    const updateOptionValue = (optionIndex, valueIndex, field, value) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex].values[valueIndex][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    // --- Pricing Helpers ---
    const addBulkTier = () => {
        setFormData({
            ...formData,
            pricing: {
                ...formData.pricing,
                bulkTiers: [...formData.pricing.bulkTiers, { minQty: 10, pricePerUnit: 0 }]
            }
        });
    };

    const removeBulkTier = (index) => {
        const newTiers = [...formData.pricing.bulkTiers];
        newTiers.splice(index, 1);
        setFormData({
            ...formData,
            pricing: { ...formData.pricing, bulkTiers: newTiers }
        });
    };

    const updateBulkTier = (index, field, value) => {
        const newTiers = [...formData.pricing.bulkTiers];
        newTiers[index][field] = value;
        setFormData({
            ...formData,
            pricing: { ...formData.pricing, bulkTiers: newTiers }
        });
    };

    // --- Availability Helpers ---
    const toggleOperator = (operatorId) => {
        const currentOperators = formData.allowedOperators || [];
        if (currentOperators.includes(operatorId)) {
            setFormData({
                ...formData,
                allowedOperators: currentOperators.filter(id => id !== operatorId)
            });
        } else {
            setFormData({
                ...formData,
                allowedOperators: [...currentOperators, operatorId]
            });
        }
    };

    const getCategoryBadgeColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'printing': return 'bg-purple-100 text-purple-700';
            case 'merchandise': return 'bg-blue-100 text-blue-700';
            case 'design': return 'bg-pink-100 text-pink-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Service Configuration
                    </h1>
                    <p className="text-slate-600 mt-1">Manage services, pricing, and shop availability</p>
                </div>
                <button
                    onClick={() => {
                        setEditingService(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </button>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.map((service) => (
                                <tr key={service._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl">
                                                {service.icon || '📄'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{service.name}</div>
                                                <div className="text-sm text-slate-500 truncate max-w-xs">{service.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getCategoryBadgeColor(service.category)}`}>
                                            {service.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-600 text-sm">
                                            <Clock size={14} className="mr-1.5" />
                                            {service.turnaroundTime || 'Instant'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        ₹{service.pricing?.basePrice} <span className="text-xs text-slate-400 font-normal">/ {service.pricing?.perUnit?.replace('per-', '')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(service)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Service Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-fade-in">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">
                                    <Smartphone size={16} /> Mobile Preview
                                </button>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 px-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <FileText size={16} /> General
                            </button>
                            <button
                                onClick={() => setActiveTab('config')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'config' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Settings size={16} /> Configuration
                            </button>
                            <button
                                onClick={() => setActiveTab('pricing')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'pricing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <DollarSign size={16} /> Pricing
                            </button>
                            <button
                                onClick={() => setActiveTab('availability')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'availability' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Store size={16} /> Availability
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="serviceForm" onSubmit={handleSaveService} className="space-y-6">

                                {/* GENERAL TAB */}
                                {activeTab === 'general' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="e.g., T-Shirt Printing"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                                <input
                                                    type="text"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="e.g., Merchandise"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Service Icon</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                                        {formData.icon && formData.icon.length > 5 ? (
                                                            <img src={formData.icon} alt="Service Icon" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl">{formData.icon || '📄'}</span>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {formData.icon && formData.icon.length > 5 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewImage(formData.icon)}
                                                                    className="text-white hover:text-blue-400"
                                                                    title="Preview"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, icon: '' })}
                                                                className="text-white hover:text-red-400"
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                                                <p className="text-xs text-slate-500">Click to upload icon</p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setFormData({ ...formData, icon: reader.result });
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <p className="text-xs text-slate-400 mt-1">Recommended: 200x200px PNG or JPG</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image Preview Modal */}
                                            {previewImage && (
                                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
                                                    <div className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center">
                                                        <button
                                                            onClick={() => setPreviewImage(null)}
                                                            className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
                                                        >
                                                            <X size={32} />
                                                        </button>
                                                        <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Turnaround Time (SLA)</label>
                                                <input
                                                    type="text"
                                                    value={formData.turnaroundTime}
                                                    onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="e.g., 2 Days"
                                                />
                                            </div>
                                            <div className="flex items-center mt-6">
                                                <input
                                                    type="checkbox"
                                                    id="isActive"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">Active</label>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    rows="3"
                                                    placeholder="Describe the service..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONFIGURATION TAB (Form Builder) */}
                                {activeTab === 'config' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium text-slate-900">Custom User Inputs</h4>
                                            <button
                                                type="button"
                                                onClick={addOption}
                                                className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Add Input
                                            </button>
                                        </div>

                                        {formData.options.length === 0 && (
                                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <p className="text-slate-500 text-sm">No custom inputs defined.</p>
                                                <p className="text-slate-400 text-xs mt-1">Add inputs like Size, Color, Material etc.</p>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {formData.options.map((option, idx) => (
                                                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(idx)}
                                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                    <div className="grid grid-cols-12 gap-4 mb-3">
                                                        <div className="col-span-5">
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Input Label</label>
                                                            <input
                                                                type="text"
                                                                value={option.label}
                                                                onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                                                                placeholder="e.g. Size"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Input Type</label>
                                                            <select
                                                                value={option.type}
                                                                onChange={(e) => updateOption(idx, 'type', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                                                            >
                                                                <option value="DROPDOWN">Dropdown</option>
                                                                <option value="TOGGLE">Toggle</option>
                                                                <option value="TEXT">Text Field</option>
                                                                <option value="FILE">File Upload</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-3 flex items-end pb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={option.required}
                                                                    onChange={(e) => updateOption(idx, 'required', e.target.checked)}
                                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                                />
                                                                <span className="text-sm text-slate-600">Required</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Option Values (for Dropdown/Toggle) */}
                                                    {['DROPDOWN', 'TOGGLE'].includes(option.type) && (
                                                        <div className="pl-4 border-l-2 border-slate-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs font-medium text-slate-500">Options & Price Modifiers</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addOptionValue(idx)}
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                                >
                                                                    <Plus size={12} /> Add Value
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {option.values.map((val, vIdx) => (
                                                                    <div key={vIdx} className="flex gap-2 items-center">
                                                                        <input
                                                                            type="text"
                                                                            value={val.name}
                                                                            onChange={(e) => updateOptionValue(idx, vIdx, 'name', e.target.value)}
                                                                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                                                                            placeholder="Option Name (e.g. XL)"
                                                                        />
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-slate-400 text-sm">+₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={val.priceModifier}
                                                                                onChange={(e) => updateOptionValue(idx, vIdx, 'priceModifier', Number(e.target.value))}
                                                                                className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                                                                                placeholder="0"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeOptionValue(idx, vIdx)}
                                                                            className="text-slate-400 hover:text-red-500"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* PRICING TAB */}
                                {activeTab === 'pricing' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (₹)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.pricing.basePrice}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        pricing: { ...formData.pricing, basePrice: Number(e.target.value) }
                                                    })}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                                <select
                                                    value={formData.pricing.perUnit}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        pricing: { ...formData.pricing, perUnit: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="per-page">Per Page</option>
                                                    <option value="per-item">Per Item</option>
                                                    <option value="flat">Flat Rate</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Bulk Pricing Tiers */}
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium text-slate-900">Bulk Discounts (Tiered Pricing)</h4>
                                                <button
                                                    type="button"
                                                    onClick={addBulkTier}
                                                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                                                >
                                                    <Plus size={16} /> Add Tier
                                                </button>
                                            </div>

                                            {formData.pricing.bulkTiers.length === 0 && (
                                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                    <p className="text-slate-500 text-sm">No bulk pricing tiers.</p>
                                                    <p className="text-slate-400 text-xs mt-1">Add tiers to offer discounts for larger quantities.</p>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                {formData.pricing.bulkTiers.map((tier, idx) => (
                                                    <div key={idx} className="flex gap-4 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Min Qty</label>
                                                            <input
                                                                type="number"
                                                                value={tier.minQty}
                                                                onChange={(e) => updateBulkTier(idx, 'minQty', Number(e.target.value))}
                                                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Price Per Unit (₹)</label>
                                                            <input
                                                                type="number"
                                                                value={tier.pricePerUnit}
                                                                onChange={(e) => updateBulkTier(idx, 'pricePerUnit', Number(e.target.value))}
                                                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBulkTier(idx)}
                                                            className="p-2 text-slate-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AVAILABILITY TAB */}
                                {activeTab === 'availability' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                            <Store className="text-blue-600 shrink-0" size={20} />
                                            <div>
                                                <h4 className="font-medium text-blue-900">Shop Assignment</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Select which shops (operators) can fulfill this service. This service will only be visible to customers when they select one of these shops.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {operators.map((operator) => (
                                                <label key={operator._id}
                                                    onClick={() => toggleOperator(operator._id)}
                                                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${formData.allowedOperators.includes(operator._id)
                                                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${formData.allowedOperators.includes(operator._id)
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                        }`}>
                                                        {formData.allowedOperators.includes(operator._id) && <CheckSquare size={14} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{operator.name}</div>
                                                        <div className="text-xs text-slate-500">{operator.email}</div>
                                                    </div>
                                                </label>
                                            ))}
                                            {operators.length === 0 && (
                                                <div className="col-span-2 text-center py-8 text-slate-500">
                                                    No operators found. Please create operator accounts first.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="serviceForm"
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                {editingService ? 'Update Service' : 'Create Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
