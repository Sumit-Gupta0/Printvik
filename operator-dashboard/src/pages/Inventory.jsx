import { useState, useEffect } from 'react';
import { Package, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Inventory() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Paper Stock
    const [paperStock, setPaperStock] = useState({
        a4: true,
        a3: false,
        letter: false,
        legal: false,
        glossy: false,
        bond: false
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/operators/inventory`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.data) {
                setPaperStock(response.data.data.paperStock || paperStock);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/operators/inventory`,
                { paperStock },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving inventory:', error);
            alert('Failed to save inventory settings');
        } finally {
            setSaving(false);
        }
    };

    const togglePaper = (type) => {
        setPaperStock(prev => ({ ...prev, [type]: !prev[type] }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 font-outfit">Inventory Management</h1>
                <p className="text-gray-500 mt-1">Manage paper stock and service preferences</p>
            </div>

            {/* Paper Stock Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={24} className="text-indigo-600" />
                    Paper Stock Availability
                </h2>
                <p className="text-sm text-gray-600 mb-6">Toggle paper types that are currently in stock</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(paperStock).map(([type, available]) => (
                        <div
                            key={type}
                            onClick={() => togglePaper(type)}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${available
                                ? 'bg-emerald-50 border-emerald-500'
                                : 'bg-gray-50 border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold uppercase">{type}</span>
                                <div className={`w-12 h-6 rounded-full transition-colors ${available ? 'bg-emerald-500' : 'bg-gray-300'
                                    }`}>
                                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${available ? 'translate-x-6' : 'translate-x-0'
                                        }`}></div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                {available ? '✓ Available' : '✗ Out of Stock'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${saved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {saved ? (
                        <>
                            <CheckCircle size={20} />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default Inventory;
