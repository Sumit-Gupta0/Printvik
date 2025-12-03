import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, Package,
    Image as ImageIcon, Grid, List, Tag,
    CheckCircle, XCircle, Upload, AlertTriangle,
    TrendingUp, DollarSign, Layers, ChevronDown, ChevronUp,
    MoreVertical, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Products = () => {
    const { token } = useAuthStore();
    const [viewMode, setViewMode] = useState('list'); // Default to list for Inventory Console
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStock, setFilterStock] = useState('all'); // all, low, out

    // Product Form State
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        basePrice: '',
        discountPrice: '',
        costPrice: '',
        taxRate: 0,
        isTaxApplicable: true,
        stockQuantity: '',
        lowStockThreshold: 10,
        locationInWarehouse: '',
        category: 'stationery',
        tags: '',
        isActive: true,
        hasVariants: false,
        variants: []
    });

    // Variant Form State (temporary for adding new variant)
    const [newVariant, setNewVariant] = useState({
        name: '',
        sku: '',
        stock: 0,
        priceModifier: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        setSelectedImages(Array.from(e.target.files));
    };

    const handleAddVariant = () => {
        if (!newVariant.name) return;
        setFormData({
            ...formData,
            variants: [...formData.variants, { ...newVariant }]
        });
        setNewVariant({ name: '', sku: '', stock: 0, priceModifier: 0 });
    };

    const handleRemoveVariant = (index) => {
        const updatedVariants = [...formData.variants];
        updatedVariants.splice(index, 1);
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const data = new FormData();
        // Append simple fields
        Object.keys(formData).forEach(key => {
            if (key !== 'variants' && key !== 'images') {
                // Ensure undefined/null values are handled, but allow empty strings
                const value = formData[key] === undefined || formData[key] === null ? '' : formData[key];
                data.append(key, value);
            }
        });

        // Append variants as JSON string
        data.append('variants', JSON.stringify(formData.variants));

        // Append images
        selectedImages.forEach(image => {
            data.append('images', image);
        });

        try {
            if (editingProduct) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/products/${editingProduct._id}`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/products`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }
            fetchProducts();
            setShowModal(false);
            setEditingProduct(null);
            resetForm();
        } catch (err) {
            console.error(err);
            setError('Failed to save product');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchProducts();
            } catch (err) {
                setError('Failed to delete product');
            }
        }
    };

    const handleQuickStockUpdate = async (id, adjustment) => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/products/${id}/stock`,
                { stockAdjustment: adjustment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update with server response
            const updatedProductData = response.data.data; // Contains currentStock and _id

            setProducts(products.map(p => {
                if (p._id === id) {
                    return {
                        ...p,
                        stockQuantity: updatedProductData.currentStock,
                        inventory: { ...p.inventory, currentStock: updatedProductData.currentStock }
                    };
                }
                return p;
            }));
        } catch (err) {
            console.error('Failed to update stock', err);
            alert('Failed to update stock');
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/products/${product._id}`,
                { isActive: !product.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update with server response
            const updatedProduct = response.data.data;
            setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sku: '',
            description: '',
            basePrice: '',
            discountPrice: '',
            costPrice: '',
            taxRate: 0,
            isTaxApplicable: true,
            stockQuantity: '',
            lowStockThreshold: 10,
            category: 'stationery',
            tags: '',
            isActive: true,
            hasVariants: false,
            variants: []
        });
        setSelectedImages([]);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku || '',
            description: product.description,
            basePrice: product.basePrice,
            discountPrice: product.discountPrice || '',
            costPrice: product.costPrice || '',
            taxRate: product.taxRate || 0,
            isTaxApplicable: product.isTaxApplicable,
            stockQuantity: product.inventory?.currentStock || product.stockQuantity,
            lowStockThreshold: product.inventory?.lowStockThreshold || 10,
            locationInWarehouse: product.inventory?.locationInWarehouse || '',
            category: product.category,
            tags: product.tags.join(', '),
            isActive: product.isActive,
            hasVariants: product.hasVariants || false,
            variants: product.variants || []
        });
        setShowModal(true);
    };

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

        let matchesStock = true;
        const stock = product.inventory?.currentStock || product.stockQuantity || 0;
        const threshold = product.inventory?.lowStockThreshold || 10;

        if (filterStock === 'low') matchesStock = stock <= threshold && stock > 0;
        if (filterStock === 'out') matchesStock = stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-outfit flex items-center gap-2">
                        <Package className="text-indigo-600" /> Inventory Console
                    </h1>
                    <p className="text-slate-500 mt-1">Manage products, stock levels, and variants</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="stationery">Stationery</option>
                        <option value="merchandise">Merchandise</option>
                        <option value="accessories">Accessories</option>
                        <option value="paper">Paper</option>
                    </select>
                    <select
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Stock Status</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory List View */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product Identity</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price & Margin</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => {
                                    const stock = product.inventory?.currentStock || product.stockQuantity || 0;
                                    const threshold = product.inventory?.lowStockThreshold || 10;
                                    const isLowStock = stock <= threshold;
                                    const isOutOfStock = stock === 0;

                                    return (
                                        <tr key={product._id} className={`hover:bg-slate-50/80 transition-colors ${isLowStock ? 'bg-red-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 rounded-lg bg-slate-100 mr-4 overflow-hidden border border-slate-200 flex-shrink-0">
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${product.images[0].url}`}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <ImageIcon className="w-5 h-5 text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{product.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku || 'N/A'}</div>
                                                        {product.hasVariants && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 mt-1">
                                                                <Layers className="w-3 h-3 mr-1" /> {product.variants?.length || 0} Variants
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold uppercase tracking-wide">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="group relative cursor-help">
                                                    <div className="font-bold text-slate-800">
                                                        ₹{product.discountPrice || product.basePrice}
                                                    </div>
                                                    {product.costPrice && (
                                                        <div className="absolute hidden group-hover:block bg-slate-800 text-white text-xs p-2 rounded shadow-lg -top-8 left-0 z-10 whitespace-nowrap">
                                                            Cost: ₹{product.costPrice} | Margin: {Math.round(((product.basePrice - product.costPrice) / product.basePrice) * 100)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {stock} Units
                                                    </div>
                                                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                                                        <button
                                                            onClick={() => handleQuickStockUpdate(product._id, -1)}
                                                            className="p-1 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-red-600 transition-all"
                                                        >
                                                            <ChevronDown size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickStockUpdate(product._id, 1)}
                                                            className="p-1 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-emerald-600 transition-all"
                                                        >
                                                            <ChevronUp size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {isLowStock && (
                                                    <div className="text-[10px] text-red-500 font-medium mt-1 flex items-center">
                                                        <AlertTriangle size={10} className="mr-1" /> Low Stock
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.isActive ? 'bg-emerald-500' : 'bg-slate-200'
                                                        }`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.isActive ? 'translate-x-5' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Grid View (Simplified for now, can be enhanced later)
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* ... (Keep existing grid card logic or simplify) ... */}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800">{product.name}</h3>
                                <p className="text-sm text-slate-500">Stock: {product.inventory?.currentStock || product.stockQuantity}</p>
                                <button onClick={() => openEditModal(product)} className="mt-2 text-indigo-600 text-sm font-medium">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <p className="text-sm text-slate-500">Configure product details, inventory, and variants</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Section 1: Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Package size={16} /> Basic Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                placeholder="e.g. Classmate Notebook"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Stock Keeping Unit)</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                                                placeholder="e.g. NB-A4-001"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                            <textarea
                                                required
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            >
                                                <option value="stationery">Stationery</option>
                                                <option value="merchandise">Merchandise</option>
                                                <option value="accessories">Accessories</option>
                                                <option value="paper">Paper</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                                            <input
                                                type="text"
                                                value={formData.tags}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                placeholder="comma, separated, tags"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Section 2: Financials & Inventory */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <DollarSign size={16} /> Pricing & Financials
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (₹)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.basePrice}
                                                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={formData.discountPrice}
                                                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (₹)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.costPrice}
                                                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                        placeholder="Internal use"
                                                    />
                                                    {formData.basePrice && formData.costPrice && (
                                                        <div className="absolute right-0 -bottom-5 text-xs font-medium text-emerald-600">
                                                            Margin: {Math.round(((formData.basePrice - formData.costPrice) / formData.basePrice) * 100)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                                                <input
                                                    type="number"
                                                    value={formData.taxRate}
                                                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <TrendingUp size={16} /> Inventory Settings
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.stockQuantity}
                                                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert</label>
                                                <input
                                                    type="number"
                                                    value={formData.lowStockThreshold}
                                                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Bin/Rack Location</label>
                                                <input
                                                    type="text"
                                                    value={formData.locationInWarehouse}
                                                    onChange={(e) => setFormData({ ...formData, locationInWarehouse: e.target.value })}
                                                    placeholder="e.g. Rack A-2, Shelf 4"
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700">Product Active</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isTaxApplicable}
                                                    onChange={(e) => setFormData({ ...formData, isTaxApplicable: e.target.checked })}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700">Tax Applicable</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Section 3: Variants */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <Layers size={16} /> Product Variants
                                        </h4>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.hasVariants}
                                                onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Enable Variants</span>
                                        </label>
                                    </div>

                                    {formData.hasVariants && (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            {/* Add Variant Inputs */}
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end">
                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Variant Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Blue, XL"
                                                        value={newVariant.name}
                                                        onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">SKU</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. PEN-BLU"
                                                        value={newVariant.sku}
                                                        onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newVariant.stock}
                                                        onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Price (+/-)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newVariant.priceModifier}
                                                        onChange={(e) => setNewVariant({ ...newVariant, priceModifier: parseFloat(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddVariant}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {/* Variants List */}
                                            {formData.variants.length > 0 ? (
                                                <div className="space-y-2">
                                                    {formData.variants.map((variant, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-medium text-slate-800">{variant.name}</span>
                                                                <span className="text-xs text-slate-500 font-mono">{variant.sku}</span>
                                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Stock: {variant.stock}</span>
                                                                {variant.priceModifier !== 0 && (
                                                                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                                        {variant.priceModifier > 0 ? '+' : ''}₹{variant.priceModifier}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveVariant(index)}
                                                                className="text-rose-500 hover:text-rose-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-sm text-slate-400 py-4">No variants added yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <hr className="border-slate-100" />

                                {/* Section 4: Images */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                                                <Upload size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Click to upload images</span>
                                            <span className="text-xs text-slate-400 mt-1">{selectedImages.length} files selected</span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={uploading}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                {editingProduct ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
