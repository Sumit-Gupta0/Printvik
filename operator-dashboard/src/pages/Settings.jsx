import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle, Printer, Clock } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Settings() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        shopTimings: {
            openTime: '09:00',
            closeTime: '21:00',
            autoOffline: true,
            daysOfOperation: {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: false
            }
        },
        printerConfig: {
            defaultPrinter: 'HP LaserJet',
            printers: ['HP LaserJet', 'Canon Pixma', 'Epson EcoTank']
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/operators/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.data) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
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
                `${API_URL}/operators/settings`,
                settings,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateTimings = (field, value) => {
        setSettings(prev => ({
            ...prev,
            shopTimings: { ...prev.shopTimings, [field]: value }
        }));
    };

    const toggleDay = (day) => {
        setSettings(prev => ({
            ...prev,
            shopTimings: {
                ...prev.shopTimings,
                daysOfOperation: {
                    ...prev.shopTimings.daysOfOperation,
                    [day]: !prev.shopTimings.daysOfOperation[day]
                }
            }
        }));
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
                <h1 className="text-3xl font-bold text-gray-900 font-outfit">Shop Settings</h1>
                <p className="text-gray-500 mt-1">Configure your shop preferences</p>
            </div>

            {/* Printer Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Printer size={24} className="text-indigo-600" />
                    Printer Configuration
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Printer
                        </label>
                        <select
                            value={settings.printerConfig.defaultPrinter}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                printerConfig: { ...prev.printerConfig, defaultPrinter: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {settings.printerConfig.printers.map(printer => (
                                <option key={printer} value={printer}>{printer}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Shop Timings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={24} className="text-indigo-600" />
                    Shop Timings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opening Time
                        </label>
                        <input
                            type="time"
                            value={settings.shopTimings.openTime}
                            onChange={(e) => updateTimings('openTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Closing Time
                        </label>
                        <input
                            type="time"
                            value={settings.shopTimings.closeTime}
                            onChange={(e) => updateTimings('closeTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.shopTimings.autoOffline}
                            onChange={(e) => updateTimings('autoOffline', e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Auto-offline outside shop hours
                        </span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Days of Operation
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(settings.shopTimings.daysOfOperation).map(([day, active]) => (
                            <div
                                key={day}
                                onClick={() => toggleDay(day)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${active
                                        ? 'bg-indigo-50 border-indigo-500'
                                        : 'bg-gray-50 border-gray-300'
                                    }`}
                            >
                                <span className="font-bold capitalize">{day.substring(0, 3)}</span>
                            </div>
                        ))}
                    </div>
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

export default Settings;
