import { useState, useEffect } from 'react';
import { Save, CheckCircle, Filter } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ServicePreferences() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Services (only admin-enabled services will be shown)
    const [adminServices, setAdminServices] = useState([]);
    const [enabledServices, setEnabledServices] = useState({});

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/operators/service-preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.data) {
                setAdminServices(response.data.data.adminServices || []);
                setEnabledServices(response.data.data.enabledServices || {});
            }
        } catch (error) {
            console.error('Error fetching service preferences:', error);
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
                `${API_URL}/operators/service-preferences`,
                { enabledServices },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving service preferences:', error);
            alert('Failed to save service preferences');
        } finally {
            setSaving(false);
        }
    };

    const toggleService = (service) => {
        setEnabledServices(prev => ({ ...prev, [service]: !prev[service] }));
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
                <div className="flex items-center gap-3 mb-2">
                    <Filter size={32} className="text-indigo-600" />
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">Service Order Preferences</h1>
                </div>
                <p className="text-gray-500 mt-1">Choose which types of service orders you want to receive</p>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                    <div className="text-blue-600 mt-1">ℹ️</div>
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
                        <p className="text-sm text-blue-800">
                            Only services enabled by the admin are shown here. Toggle the services you want to accept orders for.
                            This helps you manage your workload based on current capacity and available resources.
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Available Services</h2>

                {adminServices.length === 0 ? (
                    <div className="text-center py-12">
                        <Filter size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No services enabled by admin yet</p>
                        <p className="text-sm text-gray-400 mt-2">Contact your admin to enable services</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminServices.map((service) => (
                            <div
                                key={service}
                                onClick={() => toggleService(service)}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${enabledServices[service]
                                        ? 'bg-indigo-50 border-indigo-500 shadow-md'
                                        : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold capitalize text-gray-900">{service}</span>
                                    <div className={`w-14 h-7 rounded-full transition-colors relative ${enabledServices[service] ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}>
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${enabledServices[service] ? 'translate-x-7' : 'translate-x-0.5'
                                            }`}></div>
                                    </div>
                                </div>
                                <p className={`text-sm font-medium ${enabledServices[service] ? 'text-indigo-700' : 'text-gray-500'
                                    }`}>
                                    {enabledServices[service] ? '✓ Accepting Orders' : '✗ Not Accepting'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Button */}
            {adminServices.length > 0 && (
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
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ServicePreferences;
