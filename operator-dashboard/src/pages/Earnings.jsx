/**
 * Earnings Page
 * View earnings and payout history
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Earnings() {
    const navigate = useNavigate();
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchEarnings();
    }, [period]);

    const fetchEarnings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/operators/earnings?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEarnings(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-12">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 mt-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">Earnings Dashboard</h1>
                    <p className="text-gray-500 mt-1">Track your earnings and payouts</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    {['day', 'week', 'month'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200 ${period === p
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-indigo-600">₹{earnings?.totalEarnings || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Amount</p>
                    <p className="text-3xl font-bold text-amber-500">₹{earnings?.pendingAmount || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Paid Amount</p>
                    <p className="text-3xl font-bold text-emerald-500">₹{earnings?.paidAmount || 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
                </div>
                {earnings?.payouts && earnings.payouts.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {earnings.payouts.map((payout) => (
                            <div key={payout._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">₹{payout.operatorEarnings}</p>
                                        <p className="text-xs text-gray-500">{new Date(payout.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${payout.status === 'paid'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                        {payout.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No payouts yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Earnings;
