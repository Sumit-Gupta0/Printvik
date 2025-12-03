import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, Truck, FileText, Settings, Users, ArrowRight, CheckCircle, AlertCircle, RefreshCw, Store
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Finance = () => {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState('pricing'); // pricing, payouts, reports
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [payouts, setPayouts] = useState({ operators: [], riders: [] });
    const [message, setMessage] = useState(null);
    const [customRatesModal, setCustomRatesModal] = useState({ open: false, operator: null });
    const [customRates, setCustomRates] = useState({});
    const [pinModal, setPinModal] = useState({ open: false, entityId: null, amount: null });
    const [pin, setPin] = useState('');
    const [settlements, setSettlements] = useState([]);
    const [settlementsPage, setSettlementsPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, [activeTab, settlementsPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pricing') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/config/global`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSettings(res.data.data);
            } else if (activeTab === 'payouts') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/finance/payouts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayouts(res.data.data);
            } else if (activeTab === 'settlements') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/finance/settlements?page=${settlementsPage}&limit=20`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSettlements(res.data.data.settlements || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        // Update local state immediately for smooth UI
        setSettings(newSettings);

        console.log('Saving settings:', JSON.stringify(newSettings.platformFee, null, 2));

        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/config/global`, newSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Received from backend:', JSON.stringify(res.data.data.platformFee, null, 2));
            setSettings(res.data.data);
            setMessage({ type: 'success', text: 'Settings updated successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
            // Revert to previous state on error
            fetchData();
        }
    };

    const openSettleModal = (entityId, amount) => {
        setPinModal({ open: true, entityId, amount });
        setPin('');
    };

    const settlePayout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/finance/settle`, {
                entityId: pinModal.entityId,
                amount: pinModal.amount,
                transactionRef: `TXN-${Date.now()}`,
                pin
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPinModal({ open: false, entityId: null, amount: null });
            setPin('');
            fetchData(); // Refresh
            setMessage({ type: 'success', text: 'Payout settled successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to settle payout' });
        }
    };

    const openCustomRatesModal = async (operator) => {
        setCustomRatesModal({ open: true, operator });
        // Fetch existing custom rates for this operator
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${operator._id}/operator-rates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomRates(res.data.data.operatorRateOverrides || {});
        } catch (error) {
            console.error('Error fetching custom rates:', error);
            setCustomRates({});
        }
    };

    const saveCustomRates = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${customRatesModal.operator._id}/operator-rates`, {
                operatorRateOverrides: customRates
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Custom rates saved successfully' });
            setCustomRatesModal({ open: false, operator: null });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save custom rates' });
        }
    };

    if (loading && !settings && !payouts.operators.length) {
        return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Engine (BOS)</h1>
                    <p className="text-slate-500">Manage Pricing, Payouts, and Tax Compliance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('pricing')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'pricing' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Settings size={18} /> Pricing Engine
                    </button>
                    <button
                        onClick={() => setActiveTab('operator-costs')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'operator-costs' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Store size={18} /> Operator Costs
                    </button>
                    <button
                        onClick={() => setActiveTab('payouts')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'payouts' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <DollarSign size={18} /> Payouts & Settlements
                    </button>
                    <button
                        onClick={() => setActiveTab('settlements')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'settlements' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <DollarSign size={18} /> Settlement History
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <FileText size={18} /> Tax & Reports
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}


            {/* TAB 1: PRICING ENGINE */}
            {activeTab === 'pricing' && settings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Printing Rates Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Printing Rates (Tiered Pricing)</h3>
                                <p className="text-sm text-slate-500">Set different rates based on page count (1-9, 10+, 30+, 100+)</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* A4 Rates */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-sm">A4 Size</span>
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { key: 'a4BWSingle', label: 'B&W Single Side' },
                                        { key: 'a4BWDouble', label: 'B&W Double Side' },
                                        { key: 'a4ColorSingle', label: 'Color Single Side' },
                                        { key: 'a4ColorDouble', label: 'Color Double Side' }
                                    ].map((item) => (
                                        <div key={item.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h5 className="font-semibold text-slate-700 mb-3">{item.label}</h5>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">1-9 pages (Base)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.base ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            base: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">10-29 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.tier1 ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier1: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">30-99 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.tier2 ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier2: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">100+ pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.tier3 ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier3: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* A3 Rates */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-sm">A3 Size</span>
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { key: 'a3BWSingle', label: 'B&W Single Side' },
                                        { key: 'a3BWDouble', label: 'B&W Double Side' },
                                        { key: 'a3ColorSingle', label: 'Color Single Side' },
                                        { key: 'a3ColorDouble', label: 'Color Double Side' }
                                    ].map((item) => (
                                        <div key={item.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h5 className="font-semibold text-slate-700 mb-3">{item.label}</h5>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">1-9 pages (Base)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.base ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            base: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">10-29 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.tier1 ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier1: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">30-99 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.tier2 ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier2: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">100+ pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.printingRates?.[item.key]?.tier3 ?? settings.printingRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.printingRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    printingRates: {
                                                                        ...settings.printingRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier3: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Services */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-sm">Additional Services</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Spiral Binding */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Spiral Binding (₹)</label>
                                        <input
                                            type="number"
                                            step="5"
                                            value={settings.printingRates?.spiralBinding || 30}
                                            onChange={(e) => updateSettings({ ...settings, printingRates: { ...settings.printingRates, spiralBinding: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {/* Hard Binding */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Hard Binding (₹)</label>
                                        <input
                                            type="number"
                                            step="10"
                                            value={settings.printingRates?.hardBinding || 100}
                                            onChange={(e) => updateSettings({ ...settings, printingRates: { ...settings.printingRates, hardBinding: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {/* Lamination A4 */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Lamination A4 (₹)</label>
                                        <input
                                            type="number"
                                            step="5"
                                            value={settings.printingRates?.laminationA4 || 20}
                                            onChange={(e) => updateSettings({ ...settings, printingRates: { ...settings.printingRates, laminationA4: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {/* Lamination A3 */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Lamination A3 (₹)</label>
                                        <input
                                            type="number"
                                            step="5"
                                            value={settings.printingRates?.laminationA3 || 40}
                                            onChange={(e) => updateSettings({ ...settings, printingRates: { ...settings.printingRates, laminationA3: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Fee Card - Enhanced */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Platform Commission</h3>
                                <p className="text-sm text-slate-500">Separate commission rates for Services & Products</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Services Commission */}
                            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={18} className="text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Services (Printing)</h4>
                                </div>

                                {/* Type Toggle */}
                                <div className="flex gap-2 bg-white p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSettings = {
                                                ...settings,
                                                platformFee: {
                                                    ...(settings.platformFee || {}),
                                                    services: {
                                                        ...(settings.platformFee?.services || {}),
                                                        type: 'percentage',
                                                        percentage: settings.platformFee?.services?.percentage || 10
                                                    }
                                                }
                                            };
                                            updateSettings(newSettings);
                                        }}
                                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${(!settings.platformFee?.services?.type || settings.platformFee?.services?.type === 'percentage')
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSettings = {
                                                ...settings,
                                                platformFee: {
                                                    ...(settings.platformFee || {}),
                                                    services: {
                                                        type: 'fixed',
                                                        fixedAmount: settings.platformFee?.services?.fixedAmount || 20
                                                    }
                                                }
                                            };
                                            updateSettings(newSettings);
                                        }}
                                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${settings.platformFee?.services?.type === 'fixed'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        Fixed (₹)
                                    </button>
                                </div>

                                {/* Value Input */}
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">
                                        {(!settings.platformFee?.services?.type || settings.platformFee?.services?.type === 'percentage') ? 'Commission %' : 'Commission Amount'}
                                    </label>
                                    <div className="relative">
                                        {(!settings.platformFee?.services?.type || settings.platformFee?.services?.type === 'percentage') ? (
                                            <>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={settings.platformFee?.services?.percentage || 10}
                                                    onChange={(e) => updateSettings({
                                                        ...settings,
                                                        platformFee: {
                                                            ...settings.platformFee,
                                                            services: {
                                                                ...settings.platformFee?.services,
                                                                type: 'percentage',
                                                                percentage: parseFloat(e.target.value)
                                                            }
                                                        }
                                                    })}
                                                    className="w-full pl-4 pr-8 py-2 border border-blue-200 rounded-lg bg-white"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400">%</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">₹</span>
                                                <input
                                                    type="number"
                                                    step="5"
                                                    value={settings.platformFee?.services?.fixedAmount || 20}
                                                    onChange={(e) => updateSettings({
                                                        ...settings,
                                                        platformFee: {
                                                            ...settings.platformFee,
                                                            services: {
                                                                ...settings.platformFee?.services,
                                                                type: 'fixed',
                                                                fixedAmount: parseFloat(e.target.value)
                                                            }
                                                        }
                                                    })}
                                                    className="w-full pl-8 pr-4 py-2 border border-blue-200 rounded-lg bg-white"
                                                />
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Applied to printing, binding, lamination orders
                                    </p>
                                </div>
                            </div>

                            {/* Products Commission */}
                            <div className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Store size={18} className="text-emerald-600" />
                                    <h4 className="font-semibold text-emerald-900">Products (Physical Items)</h4>
                                </div>

                                {/* Type Toggle */}
                                <div className="flex gap-2 bg-white p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSettings = {
                                                ...settings,
                                                platformFee: {
                                                    ...(settings.platformFee || {}),
                                                    products: {
                                                        ...(settings.platformFee?.products || {}),
                                                        type: 'percentage',
                                                        percentage: settings.platformFee?.products?.percentage || 15
                                                    }
                                                }
                                            };
                                            updateSettings(newSettings);
                                        }}
                                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${(!settings.platformFee?.products?.type || settings.platformFee?.products?.type === 'percentage')
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSettings = {
                                                ...settings,
                                                platformFee: {
                                                    ...(settings.platformFee || {}),
                                                    products: {
                                                        type: 'fixed',
                                                        fixedAmount: settings.platformFee?.products?.fixedAmount || 50
                                                    }
                                                }
                                            };
                                            updateSettings(newSettings);
                                        }}
                                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${settings.platformFee?.products?.type === 'fixed'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        Fixed (₹)
                                    </button>
                                </div>

                                {/* Value Input */}
                                <div>
                                    <label className="block text-sm font-medium text-emerald-900 mb-1">
                                        {(!settings.platformFee?.products?.type || settings.platformFee?.products?.type === 'percentage') ? 'Commission %' : 'Commission Amount'}
                                    </label>
                                    <div className="relative">
                                        {(!settings.platformFee?.products?.type || settings.platformFee?.products?.type === 'percentage') ? (
                                            <>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={settings.platformFee?.products?.percentage || 15}
                                                    onChange={(e) => updateSettings({
                                                        ...settings,
                                                        platformFee: {
                                                            ...settings.platformFee,
                                                            products: {
                                                                ...settings.platformFee?.products,
                                                                type: 'percentage',
                                                                percentage: parseFloat(e.target.value)
                                                            }
                                                        }
                                                    })}
                                                    className="w-full pl-4 pr-8 py-2 border border-emerald-200 rounded-lg bg-white"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">%</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                <input
                                                    type="number"
                                                    step="5"
                                                    value={settings.platformFee?.products?.fixedAmount || 50}
                                                    onChange={(e) => updateSettings({
                                                        ...settings,
                                                        platformFee: {
                                                            ...settings.platformFee,
                                                            products: {
                                                                ...settings.platformFee?.products,
                                                                type: 'fixed',
                                                                fixedAmount: parseFloat(e.target.value)
                                                            }
                                                        }
                                                    })}
                                                    className="w-full pl-8 pr-4 py-2 border border-emerald-200 rounded-lg bg-white"
                                                />
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-emerald-600 mt-1">
                                        Applied to physical product sales
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Surge Pricing Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Surge Pricing</h3>
                                    <p className="text-sm text-slate-500">Dynamic pricing for high demand</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.surgePricing?.enabled || false}
                                    onChange={(e) => updateSettings({ ...settings, surgePricing: { ...settings.surgePricing, enabled: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Multiplier (x)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={settings.surgePricing?.multiplier || 1.0}
                                    onChange={(e) => updateSettings({ ...settings, surgePricing: { ...settings.surgePricing, multiplier: parseFloat(e.target.value) } })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                />
                                <p className="text-xs text-slate-500 mt-1">E.g., 1.5x means 50% extra charge.</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Rules Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Delivery Logic</h3>
                                <p className="text-sm text-slate-500">Distance-based fare calculation</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Fare (₹)</label>
                                    <input
                                        type="number"
                                        value={settings.deliveryRules?.baseFare || 30}
                                        onChange={(e) => updateSettings({ ...settings, deliveryRules: { ...settings.deliveryRules, baseFare: parseInt(e.target.value) } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Distance (km)</label>
                                    <input
                                        type="number"
                                        value={settings.deliveryRules?.baseDistance || 3}
                                        onChange={(e) => updateSettings({ ...settings, deliveryRules: { ...settings.deliveryRules, baseDistance: parseInt(e.target.value) } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Per Extra Km Rate (₹)</label>
                                <input
                                    type="number"
                                    value={settings.deliveryRules?.perKmRate || 10}
                                    onChange={(e) => updateSettings({ ...settings, deliveryRules: { ...settings.deliveryRules, perKmRate: parseInt(e.target.value) } })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tax Config Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Tax Configuration</h3>
                                <p className="text-sm text-slate-500">GST and Invoicing rules</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate (%)</label>
                            <input
                                type="number"
                                value={settings.tax?.gstRate || 18}
                                onChange={(e) => updateSettings({ ...settings, tax: { ...settings.tax, gstRate: parseInt(e.target.value) } })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}


            {/* TAB 2: OPERATOR COSTS */}
            {activeTab === 'operator-costs' && settings && (
                <div className="space-y-6">
                    {/* Info Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Operator Base Rates (Cost to Platform)</h4>
                            <p className="text-sm text-blue-700">
                                Set the rates you will pay to operators/shops for printing services. These should be lower than user pricing to maintain profit margins.
                                The difference between user rates and operator rates is your profit.
                            </p>
                        </div>
                    </div>

                    {/* Operator Printing Rates Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <Store size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Operator Payout Rates (Tiered)</h3>
                                <p className="text-sm text-slate-500">Set what you'll pay shops for printing (1-9, 10+, 30+, 100+ pages)</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* A4 Rates */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                                    <span className="bg-emerald-100 px-2 py-1 rounded text-sm text-emerald-700">A4 Size - Operator Costs</span>
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { key: 'a4BWSingle', label: 'B&W Single Side' },
                                        { key: 'a4BWDouble', label: 'B&W Double Side' },
                                        { key: 'a4ColorSingle', label: 'Color Single Side' },
                                        { key: 'a4ColorDouble', label: 'Color Double Side' }
                                    ].map((item) => (
                                        <div key={item.key} className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="font-semibold text-emerald-900">{item.label}</h5>
                                                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                                    User Rate: ₹{settings.printingRates?.[item.key]?.base ?? 0} (Base)
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">1-9 pages (Base)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.base ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            base: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">10-29 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.tier1 ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier1: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">30-99 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.tier2 ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier2: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">100+ pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.tier3 ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier3: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* A3 Rates */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                                    <span className="bg-emerald-100 px-2 py-1 rounded text-sm text-emerald-700">A3 Size - Operator Costs</span>
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { key: 'a3BWSingle', label: 'B&W Single Side' },
                                        { key: 'a3BWDouble', label: 'B&W Double Side' },
                                        { key: 'a3ColorSingle', label: 'Color Single Side' },
                                        { key: 'a3ColorDouble', label: 'Color Double Side' }
                                    ].map((item) => (
                                        <div key={item.key} className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="font-semibold text-emerald-900">{item.label}</h5>
                                                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                                    User Rate: ₹{settings.printingRates?.[item.key]?.base ?? 0} (Base)
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">1-9 pages (Base)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.base ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            base: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">10-29 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.tier1 ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier1: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">30-99 pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.tier2 ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier2: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">100+ pages</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={settings.operatorBaseRates?.[item.key]?.tier3 ?? settings.operatorBaseRates?.[item.key] ?? 0}
                                                            onChange={(e) => {
                                                                const current = settings.operatorBaseRates?.[item.key];
                                                                const isObj = typeof current === 'object' && current !== null;
                                                                updateSettings({
                                                                    ...settings,
                                                                    operatorBaseRates: {
                                                                        ...settings.operatorBaseRates,
                                                                        [item.key]: {
                                                                            ...(isObj ? current : { base: current, tier1: current, tier2: current, tier3: current }),
                                                                            tier3: parseFloat(e.target.value)
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full pl-6 pr-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Services */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                                    <span className="bg-emerald-100 px-2 py-1 rounded text-sm text-emerald-700">Additional Services - Operator Costs</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Spiral Binding */}
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-medium text-emerald-900">Spiral Binding (₹)</label>
                                            <span className="text-xs text-emerald-600">User: ₹{settings.printingRates?.spiralBinding || 30}</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="5"
                                            value={settings.operatorBaseRates?.spiralBinding || 15}
                                            onChange={(e) => updateSettings({ ...settings, operatorBaseRates: { ...settings.operatorBaseRates, spiralBinding: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                                        />
                                    </div>
                                    {/* Hard Binding */}
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-medium text-emerald-900">Hard Binding (₹)</label>
                                            <span className="text-xs text-emerald-600">User: ₹{settings.printingRates?.hardBinding || 100}</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="10"
                                            value={settings.operatorBaseRates?.hardBinding || 60}
                                            onChange={(e) => updateSettings({ ...settings, operatorBaseRates: { ...settings.operatorBaseRates, hardBinding: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                                        />
                                    </div>
                                    {/* Lamination A4 */}
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-medium text-emerald-900">Lamination A4 (₹)</label>
                                            <span className="text-xs text-emerald-600">User: ₹{settings.printingRates?.laminationA4 || 20}</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="5"
                                            value={settings.operatorBaseRates?.laminationA4 || 8}
                                            onChange={(e) => updateSettings({ ...settings, operatorBaseRates: { ...settings.operatorBaseRates, laminationA4: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                                        />
                                    </div>
                                    {/* Lamination A3 */}
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-medium text-emerald-900">Lamination A3 (₹)</label>
                                            <span className="text-xs text-emerald-600">User: ₹{settings.printingRates?.laminationA3 || 40}</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="5"
                                            value={settings.operatorBaseRates?.laminationA3 || 16}
                                            onChange={(e) => updateSettings({ ...settings, operatorBaseRates: { ...settings.operatorBaseRates, laminationA3: parseFloat(e.target.value) } })}
                                            className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profit Margin Calculator */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                        <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Profit Margin Calculator (Example: 100 pages A4 B&W)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">User Pays (Revenue)</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{((settings.printingRates?.a4BWSingle?.tier3 || 1.2) * 100).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Operator Gets (Cost)</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    ₹{((settings.operatorBaseRates?.a4BWSingle?.tier3 || 0.8) * 100).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Your Profit</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    ₹{(((settings.printingRates?.a4BWSingle?.tier3 || 1.2) - (settings.operatorBaseRates?.a4BWSingle?.tier3 || 0.8)) * 100).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PAYOUTS */}
            {activeTab === 'payouts' && (
                <div className="space-y-8">
                    {/* Shop Payouts */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Store size={20} className="text-indigo-600" /> Shop Payouts (Operators)
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-600 text-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Shop Name</th>
                                        <th className="px-6 py-3 font-medium">Pending Orders</th>
                                        <th className="px-6 py-3 font-medium">User Revenue</th>
                                        <th className="px-6 py-3 font-medium">Operator Cost</th>
                                        <th className="px-6 py-3 font-medium">Your Profit</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payouts.operators.length > 0 ? payouts.operators.map((op) => {
                                        // Calculate profit (assuming backend sends both userRevenue and operatorCost)
                                        const userRevenue = op.userRevenue || op.totalAmount * 1.5; // Fallback if not sent
                                        const operatorCost = op.totalAmount;
                                        const profit = userRevenue - operatorCost;
                                        const profitMargin = ((profit / userRevenue) * 100).toFixed(1);

                                        return (
                                            <tr key={op._id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{op.name}</div>
                                                    <div className="text-xs text-slate-500">{op.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{op.count}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-green-600">₹{userRevenue.toFixed(2)}</div>
                                                    <div className="text-xs text-slate-500">From users</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-orange-600">₹{operatorCost.toFixed(2)}</div>
                                                    <div className="text-xs text-slate-500">To operator</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-indigo-600">₹{profit.toFixed(2)}</div>
                                                    <div className="text-xs text-emerald-600">{profitMargin}% margin</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => openCustomRatesModal(op)}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                                                        >
                                                            Custom Rates
                                                        </button>
                                                        <button
                                                            onClick={() => openSettleModal(op._id, op.totalAmount)}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                                        >
                                                            Settle Payment
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No pending payouts for shops.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Rider Payouts */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Truck size={20} className="text-blue-600" /> Rider Payouts (Fleet)
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-600 text-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Rider Name</th>
                                        <th className="px-6 py-3 font-medium">Cash Collected (Debit)</th>
                                        <th className="px-6 py-3 font-medium">Earnings (Credit)</th>
                                        <th className="px-6 py-3 font-medium">Net Balance</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payouts.riders.length > 0 ? payouts.riders.map((rider) => (
                                        <tr key={rider._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{rider.name}</div>
                                                <div className="text-xs text-slate-500">{rider.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-red-600 font-medium">-₹{rider.totalDebit.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-green-600 font-medium">+₹{rider.totalCredit.toFixed(2)}</td>
                                            <td className={`px-6 py-4 font-bold ${rider.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {rider.netBalance >= 0 ? `Payable: ₹${rider.netBalance.toFixed(2)}` : `Collect: ₹${Math.abs(rider.netBalance).toFixed(2)}`}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openSettleModal(rider._id, Math.abs(rider.netBalance))}
                                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${rider.netBalance >= 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                                                >
                                                    {rider.netBalance >= 0 ? 'Settle Payment' : 'Collect Cash'}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No pending settlements for riders.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: REPORTS */}
            {activeTab === 'reports' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Tax & Compliance Reports</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Generate monthly GST reports and invoices for your chartered accountant.</p>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Generate Monthly Report
                    </button>
                </div>
            )}

            {/* Settlement History Tab */}
            {activeTab === 'settlements' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <DollarSign size={20} className="text-indigo-600" /> Settlement History
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Complete audit trail of all payment settlements</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Operator/Rider</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transaction Ref</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Settled By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {settlements.length > 0 ? settlements.map((settlement) => (
                                    <tr key={settlement._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900">
                                                {new Date(settlement.settledAt).toLocaleDateString('en-IN')}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(settlement.settledAt).toLocaleTimeString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{settlement.entityName}</div>
                                            <div className="text-xs text-slate-500">{settlement.entityEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${settlement.entityType === 'OPERATOR'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {settlement.entityType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-green-600">₹{settlement.amount.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">{settlement.transactionRef}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900">{settlement.settledBy}</div>
                                            <div className="text-xs text-slate-500">{settlement.settledByEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${settlement.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {settlement.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                            No settlement history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {settlements.length > 0 && (
                        <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                            <div className="text-sm text-slate-600">
                                Showing {settlements.length} settlements
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSettlementsPage(p => Math.max(1, p - 1))}
                                    disabled={settlementsPage === 1}
                                    className="px-3 py-1 text-sm border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setSettlementsPage(p => p + 1)}
                                    className="px-3 py-1 text-sm border rounded hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Rates Modal */}
            {customRatesModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Custom Operator Rates</h2>
                                <p className="text-sm text-slate-500">{customRatesModal.operator?.name}</p>
                            </div>
                            <button
                                onClick={() => setCustomRatesModal({ open: false, operator: null })}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Info Alert */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    Set custom rates for this operator. Leave fields empty to use global default rates.
                                    Global rates are shown as placeholders.
                                </p>
                            </div>

                            {/* A4 Rates */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3">A4 Paper</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { key: 'a4BWSingle', label: 'B&W Single Side' },
                                        { key: 'a4BWDouble', label: 'B&W Double Side' },
                                        { key: 'a4ColorSingle', label: 'Color Single Side' },
                                        { key: 'a4ColorDouble', label: 'Color Double Side' }
                                    ].map((item) => (
                                        <div key={item.key} className="bg-slate-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-slate-700 mb-2">{item.label}</h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {['base', 'tier1', 'tier2', 'tier3'].map((tier, idx) => (
                                                    <div key={tier}>
                                                        <label className="block text-xs text-slate-500 mb-1">
                                                            {idx === 0 ? '1-9 pages' : idx === 1 ? '10-29' : idx === 2 ? '30-99' : '100+'}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder={settings?.operatorBaseRates?.[item.key]?.[tier] || '0'}
                                                            value={customRates[item.key]?.[tier] || ''}
                                                            onChange={(e) => setCustomRates({
                                                                ...customRates,
                                                                [item.key]: {
                                                                    ...(customRates[item.key] || {}),
                                                                    [tier]: e.target.value ? parseFloat(e.target.value) : undefined
                                                                }
                                                            })}
                                                            className="w-full px-2 py-1.5 text-sm border rounded"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* A3 Rates */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3">A3 Paper</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { key: 'a3BWSingle', label: 'B&W Single Side' },
                                        { key: 'a3BWDouble', label: 'B&W Double Side' },
                                        { key: 'a3ColorSingle', label: 'Color Single Side' },
                                        { key: 'a3ColorDouble', label: 'Color Double Side' }
                                    ].map((item) => (
                                        <div key={item.key} className="bg-slate-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-slate-700 mb-2">{item.label}</h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {['base', 'tier1', 'tier2', 'tier3'].map((tier, idx) => (
                                                    <div key={tier}>
                                                        <label className="block text-xs text-slate-500 mb-1">
                                                            {idx === 0 ? '1-9 pages' : idx === 1 ? '10-29' : idx === 2 ? '30-99' : '100+'}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder={settings?.operatorBaseRates?.[item.key]?.[tier] || '0'}
                                                            value={customRates[item.key]?.[tier] || ''}
                                                            onChange={(e) => setCustomRates({
                                                                ...customRates,
                                                                [item.key]: {
                                                                    ...(customRates[item.key] || {}),
                                                                    [tier]: e.target.value ? parseFloat(e.target.value) : undefined
                                                                }
                                                            })}
                                                            className="w-full px-2 py-1.5 text-sm border rounded"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Services */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3">Additional Services</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { key: 'spiralBinding', label: 'Spiral Binding' },
                                        { key: 'hardBinding', label: 'Hard Binding' },
                                        { key: 'laminationA4', label: 'Lamination A4' },
                                        { key: 'laminationA3', label: 'Lamination A3' }
                                    ].map((item) => (
                                        <div key={item.key}>
                                            <label className="block text-xs text-slate-500 mb-1">{item.label}</label>
                                            <input
                                                type="number"
                                                step="5"
                                                placeholder={settings?.operatorBaseRates?.[item.key] || '0'}
                                                value={customRates[item.key] || ''}
                                                onChange={(e) => setCustomRates({
                                                    ...customRates,
                                                    [item.key]: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                                className="w-full px-2 py-1.5 text-sm border rounded"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setCustomRatesModal({ open: false, operator: null })}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCustomRates}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                                Save Custom Rates
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Verification Modal for Settlement */}
            {pinModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Settlement</h2>
                        <div className="mb-4">
                            <p className="text-sm text-slate-600 mb-2">
                                You are about to settle a payment of <span className="font-bold text-indigo-600">₹{pinModal.amount?.toFixed(2)}</span>
                            </p>
                            <p className="text-sm text-orange-600 font-medium">
                                This action requires your security PIN
                            </p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Enter Security PIN
                            </label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter 4-digit PIN"
                                maxLength={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                onKeyPress={(e) => e.key === 'Enter' && pin.length === 4 && settlePayout()}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPinModal({ open: false, entityId: null, amount: null });
                                    setPin('');
                                }}
                                className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={settlePayout}
                                disabled={pin.length !== 4}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                Confirm Settlement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Icon Component (since Store wasn't imported in previous files, defining locally if needed or import)
// Actually I imported Store from lucide-react at the top.

export default Finance;
