/**
 * Admin Settings Page - Premium Design
 */

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Database, Mail, Lock, Save, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const SystemConfigForm = ({ token }) => {
    const [config, setConfig] = useState({
        maintenanceMode: { isActive: false, message: '' },
        features: {
            allowUserLogin: true,
            allowOperatorLogin: true,
            enableCod: true,
            enableOnlinePayment: true,
            enableNewSignups: true
        },
        appVersions: {
            minAndroidVersion: '1.0.0',
            minIosVersion: '1.0.0'
        },
        platformCommissionPercent: 10,
        baseDeliveryFee: 40,
        surgeChargeMultiplier: 1.0,
        maxFileSizeMB: 50
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/system/config`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setConfig(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            // alert('Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/system/config`,
                config,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('System configuration updated successfully');
        } catch (error) {
            console.error('Error updating config:', error);
            alert('Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    const toggleFeature = (feature) => {
        setConfig(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feature]: !prev.features[feature]
            }
        }));
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading configuration...</div>;

    return (
        <form onSubmit={handleSave} className="space-y-8">
            {/* 1. Maintenance Mode (Critical) */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${config.maintenanceMode?.isActive ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${config.maintenanceMode?.isActive ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg ${config.maintenanceMode?.isActive ? 'text-rose-800' : 'text-slate-800'}`}>Maintenance Mode</h4>
                            <p className={`text-sm ${config.maintenanceMode?.isActive ? 'text-rose-600' : 'text-slate-500'}`}>
                                {config.maintenanceMode?.isActive ? 'System is currently offline for users' : 'System is running normally'}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.maintenanceMode?.isActive || false}
                            onChange={(e) => setConfig({
                                ...config,
                                maintenanceMode: { ...config.maintenanceMode, isActive: e.target.checked }
                            })}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                </div>
                {config.maintenanceMode?.isActive && (
                    <input
                        type="text"
                        value={config.maintenanceMode?.message}
                        onChange={(e) => setConfig({
                            ...config,
                            maintenanceMode: { ...config.maintenanceMode, message: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-rose-500 text-rose-800 placeholder-rose-300"
                        placeholder="Enter maintenance message..."
                    />
                )}
            </div>

            {/* 2. Feature Toggles */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                    <Database className="text-indigo-600" size={20} />
                    Feature Controls
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: 'enableCod', label: 'Cash on Delivery', desc: 'Allow users to pay with cash' },
                        { key: 'enableOnlinePayment', label: 'Online Payments', desc: 'Accept UPI, Cards, Netbanking' },
                        { key: 'enableNewSignups', label: 'User Registration', desc: 'Allow new users to sign up' },
                        { key: 'allowOperatorLogin', label: 'Operator Login', desc: 'Allow shop operators to access dashboard' }
                    ].map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <p className="font-semibold text-slate-800">{feature.label}</p>
                                <p className="text-xs text-slate-500">{feature.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.features?.[feature.key] || false}
                                    onChange={() => toggleFeature(feature.key)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Version Control */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                    <Shield className="text-indigo-600" size={20} />
                    App Version Control
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Min Android Version</label>
                        <input
                            type="text"
                            value={config.appVersions?.minAndroidVersion || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                appVersions: { ...config.appVersions, minAndroidVersion: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                            placeholder="1.0.0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Min iOS Version</label>
                        <input
                            type="text"
                            value={config.appVersions?.minIosVersion || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                appVersions: { ...config.appVersions, minIosVersion: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                            placeholder="1.0.0"
                        />
                    </div>
                </div>
            </div>



            <div className="flex justify-end pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 transform hover:scale-105 active:scale-95"
                >
                    <Save size={20} />
                    {saving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            </div>
        </form>
    );
};

function Settings() {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
        pin: ''
    });
    const [pinData, setPinData] = useState({
        oldPin: '',
        pin: '',
        confirmPin: ''
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'system', label: 'System', icon: Database },
    ];

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        // API call to update profile
        alert('Profile updated successfully');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('New passwords do not match');
            return;
        }
        if (passwords.pin.length !== 6) {
            alert('Please enter a valid 6-digit PIN');
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/update-password`,
                {
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                    pin: passwords.pin
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Password updated successfully');
            setPasswords({ current: '', new: '', confirm: '', pin: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update password');
        }
    };

    const handleUpdatePin = async (e) => {
        e.preventDefault();
        if (pinData.pin.length !== 6) {
            alert('PIN must be exactly 6 digits');
            return;
        }
        if (pinData.pin !== pinData.confirmPin) {
            alert('PINs do not match');
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/set-pin`,
                {
                    pin: pinData.pin,
                    oldPin: pinData.oldPin
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Security PIN updated successfully');
            setPinData({ oldPin: '', pin: '', confirmPin: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update Security PIN');
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                    <span className={`font-medium ${activeTab === tab.id ? 'font-semibold' : ''}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-6">Profile Settings</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Admin User"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue="admin@printvik.com"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            defaultValue="+91 9876543212"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-6">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Email Notifications', desc: 'Receive email updates about new orders' },
                                        { label: 'Push Notifications', desc: 'Get push notifications on your device' },
                                        { label: 'SMS Alerts', desc: 'Receive SMS for urgent updates' },
                                        { label: 'Weekly Reports', desc: 'Get weekly analytics reports via email' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-slate-800">{item.label}</p>
                                                <p className="text-sm text-slate-500">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={idx < 2} />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                {/* Password Section */}
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Security PIN (Required)</label>
                                            <input
                                                type="password"
                                                maxLength="6"
                                                value={passwords.pin}
                                                onChange={(e) => setPasswords({ ...passwords, pin: e.target.value.replace(/\D/g, '') })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all tracking-widest"
                                                placeholder="••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                                            Update Password
                                        </button>
                                    </div>
                                </form>

                                <div className="border-t border-slate-100 pt-8"></div>

                                {/* PIN Management Section */}
                                <form onSubmit={handleUpdatePin} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-800">Admin Security PIN</h3>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                            Required for sensitive actions
                                        </span>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-800">
                                            <strong>This PIN is used for:</strong>
                                        </p>
                                        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                                            <li>Verifying sensitive actions (suspending users, force password reset)</li>
                                            <li>Accessing critical admin functions</li>
                                            <li>All protected operations across the admin panel</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Current PIN (Leave empty if setting for first time)</label>
                                            <input
                                                type="password"
                                                maxLength="6"
                                                placeholder="••••••"
                                                value={pinData.oldPin}
                                                onChange={(e) => setPinData({ ...pinData, oldPin: e.target.value.replace(/\D/g, '') })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all tracking-widest"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">New 6-Digit PIN</label>
                                                <input
                                                    type="password"
                                                    maxLength="6"
                                                    pattern="\d{6}"
                                                    placeholder="••••••"
                                                    value={pinData.pin}
                                                    onChange={(e) => setPinData({ ...pinData, pin: e.target.value.replace(/\D/g, '') })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all tracking-widest"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm PIN</label>
                                                <input
                                                    type="password"
                                                    maxLength="6"
                                                    pattern="\d{6}"
                                                    placeholder="••••••"
                                                    value={pinData.confirmPin}
                                                    onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, '') })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all tracking-widest"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all shadow-md shadow-slate-200">
                                            Update Security PIN
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-6">Appearance</h2>
                                <p className="text-slate-600 mb-6">Customize the look and feel of your dashboard</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Light', 'Dark', 'Auto'].map((theme) => (
                                        <div key={theme} className="p-6 border-2 border-slate-200 rounded-xl hover:border-indigo-500 cursor-pointer transition-all">
                                            <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3"></div>
                                            <p className="font-semibold text-center">{theme} Mode</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-6">System Configuration</h2>
                                <SystemConfigForm token={token} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;
