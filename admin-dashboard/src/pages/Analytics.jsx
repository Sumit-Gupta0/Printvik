/**
 * Analytics Decision Engine - 3 Intelligence Centers
 * CFO View (Financial) | COO View (Operational) | CMO View (Growth)
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, Download, Calendar,
    AlertTriangle, CheckCircle, Target, Truck, Store, Award, Activity
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function Analytics() {
    const { token } = useAuthStore();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, marketplace, sales, customers
    const [period, setPeriod] = useState('month');
    const [compareMode, setCompareMode] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [period, compareMode]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/analytics`, {
                params: { period, compare: compareMode },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        let csvContent = '';
        let filename = `analytics_${activeTab}_${period}_${new Date().toISOString().split('T')[0]}.csv`;

        // Generate CSV based on active tab
        switch (activeTab) {
            case 'overview':
                csvContent = 'Metric,Value\n';
                csvContent += `Net Profit,₹${analytics?.summary?.netProfit?.toFixed(0) || 0}\n`;
                csvContent += `Active Orders,${analytics?.summary?.activeOrders || 0}\n`;
                csvContent += `Avg Delivery Time,${Math.round(analytics?.summary?.avgDeliveryTime || 0)} min\n`;
                csvContent += `Total Customers,${analytics?.summary?.totalCustomers || 0}\n\n`;
                csvContent += 'Date,GMV,Net Revenue\n';
                (analytics?.financial?.gmvTrend || []).forEach((item, idx) => {
                    const revenue = analytics?.financial?.netRevenueTrend?.[idx]?.revenue || 0;
                    csvContent += `${item._id},${item.gmv},${revenue}\n`;
                });
                break;

            case 'marketplace':
                csvContent = 'Rank,Shop Name,Email,Orders,Rejection Rate,Completion Rate,Revenue\n';
                (analytics?.operational?.shopPerformance || []).forEach((shop, idx) => {
                    csvContent += `${idx + 1},${shop.name},${shop.email},${shop.totalOrders},${shop.rejectionRate.toFixed(1)}%,${shop.completionRate.toFixed(1)}%,₹${shop.revenue.toFixed(0)}\n`;
                });
                break;

            case 'sales':
                csvContent = 'Product/Service,Quantity,Revenue\n';
                (analytics?.growth?.topItems || []).forEach((item) => {
                    csvContent += `${item._id},${item.quantity},${item.revenue || 0}\n`;
                });
                csvContent += '\nCategory,Revenue\n';
                (analytics?.growth?.productMix || []).forEach((item) => {
                    csvContent += `${item._id},${item.revenue}\n`;
                });
                break;

            case 'customers':
                csvContent = 'Rank,Customer Name,Email,Orders,Total Spent\n';
                (analytics?.growth?.vipCustomers || []).forEach((customer, idx) => {
                    csvContent += `${idx + 1},${customer.name},${customer.email},${customer.orderCount},₹${customer.totalSpent.toFixed(0)}\n`;
                });
                csvContent += `\nMetric,Value\n`;
                csvContent += `New Customers,${analytics?.growth?.customerMetrics?.newCustomers || 0}\n`;
                csvContent += `Repeat Customers,${analytics?.growth?.customerMetrics?.repeatCustomers || 0}\n`;
                break;

            default:
                csvContent = 'No data available\n';
        }

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Activity className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header with Controls */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Analytics Decision Engine</h1>
                    <p className="text-slate-500 mt-1">Intelligence Centers: Financial | Operational | Growth</p>
                </div>
                <div className="flex gap-3">
                    {/* Date Filter */}
                    <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        {['today', 'yesterday', 'week', 'month'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition-all ${period === p
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {p === 'today' ? 'Today' : p === 'yesterday' ? 'Yesterday' : p === 'week' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>

                    {/* Compare Mode */}
                    <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={compareMode}
                            onChange={(e) => setCompareMode(e.target.checked)}
                            className="rounded text-indigo-600"
                        />
                        <span className="text-sm font-medium text-slate-700">Compare</span>
                    </label>

                    {/* Export CSV */}
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Download size={18} />
                        <span className="text-sm font-medium">Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'Overview', icon: Target },
                    { id: 'marketplace', label: 'Marketplace', icon: Store },
                    { id: 'sales', label: 'Sales & Products', icon: ShoppingBag },
                    { id: 'customers', label: 'Customers', icon: Users }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === tab.id
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: OVERVIEW (Executive Summary) */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Big Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Net Profit"
                            value={`₹${analytics?.summary?.netProfit?.toFixed(0) || 0}`}
                            trend={analytics?.summary?.netProfit > 0 ? 'up' : 'down'}
                            icon={DollarSign}
                            color="bg-green-500"
                        />
                        <MetricCard
                            title="Active Orders"
                            value={analytics?.summary?.activeOrders || 0}
                            icon={ShoppingBag}
                            color="bg-blue-500"
                        />
                        <MetricCard
                            title="Avg Delivery Time"
                            value={`${Math.round(analytics?.summary?.avgDeliveryTime || 0)} min`}
                            trend={analytics?.summary?.avgDeliveryTime > 45 ? 'down' : 'up'}
                            icon={Clock}
                            color="bg-orange-500"
                            alert={analytics?.summary?.avgDeliveryTime > 45}
                        />
                        <MetricCard
                            title="Total Customers"
                            value={analytics?.summary?.totalCustomers || 0}
                            icon={Users}
                            color="bg-purple-500"
                        />
                    </div>

                    {/* GMV vs Net Revenue */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">GMV vs Net Revenue (CFO View)</h3>
                            <p className="text-sm text-slate-500">Total order value vs platform commission</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics?.financial?.gmvTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="_id" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="gmv" stroke="#3b82f6" strokeWidth={2} name="GMV (Total)" />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Net Revenue" data={analytics?.financial?.netRevenueTrend || []} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Expense Breakdown</h3>
                            <p className="text-sm text-slate-500">Where is the money going?</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics?.financial?.expenses || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis dataKey="category" type="category" stroke="#94a3b8" />
                                <Tooltip />
                                <Bar dataKey="amount" fill="#6366f1" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* TAB 2: MARKETPLACE (Partners & Logistics) */}
            {activeTab === 'marketplace' && (
                <div className="space-y-8">
                    {/* Conversion Funnel */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Conversion Funnel (COO View)</h3>
                            <p className="text-sm text-slate-500">Where are customers dropping off?</p>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Cart Created', value: analytics?.operational?.conversionFunnel?.cartCreated || 0, color: 'bg-blue-500' },
                                { label: 'Payment Done', value: analytics?.operational?.conversionFunnel?.paymentCompleted || 0, color: 'bg-green-500' },
                                { label: 'Order Placed', value: analytics?.operational?.conversionFunnel?.orderPlaced || 0, color: 'bg-yellow-500' },
                                { label: 'Delivered', value: analytics?.operational?.conversionFunnel?.delivered || 0, color: 'bg-purple-500' }
                            ].map((stage, idx) => (
                                <div key={idx} className="text-center">
                                    <div className={`${stage.color} text-white rounded-lg p-6 mb-2`}>
                                        <div className="text-3xl font-bold">{stage.value}</div>
                                    </div>
                                    <div className="text-sm font-medium text-slate-700">{stage.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-lg font-bold text-green-600">
                                Conversion Rate: {analytics?.operational?.conversionFunnel?.conversionRate}%
                            </span>
                        </div>
                    </div>

                    {/* Shop Performance Leaderboard */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Partner Performance Leaderboard</h3>
                                <p className="text-sm text-slate-500">Top 10 shops by orders</p>
                            </div>
                            <Award className="text-yellow-500" size={32} />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-slate-600 text-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Rank</th>
                                        <th className="px-4 py-3 text-left">Shop Name</th>
                                        <th className="px-4 py-3 text-right">Orders</th>
                                        <th className="px-4 py-3 text-right">Rejection Rate</th>
                                        <th className="px-4 py-3 text-right">Completion Rate</th>
                                        <th className="px-4 py-3 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(analytics?.operational?.shopPerformance || []).map((shop, idx) => (
                                        <tr key={idx} className={shop.rejectionRate > 20 ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-3 font-bold text-slate-900">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{shop.name}</div>
                                                <div className="text-xs text-slate-500">{shop.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{shop.totalOrders}</td>
                                            <td className={`px-4 py-3 text-right font-bold ${shop.rejectionRate > 20 ? 'text-red-600' : 'text-green-600'}`}>
                                                {shop.rejectionRate.toFixed(1)}%
                                                {shop.rejectionRate > 20 && <AlertTriangle size={14} className="inline ml-1" />}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-green-600">{shop.completionRate.toFixed(1)}%</td>
                                            <td className="px-4 py-3 text-right font-bold">₹{shop.revenue.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Delivery Speedometer */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Logistics Speedometer</h3>
                            <p className="text-sm text-slate-500">Average delivery time performance</p>
                        </div>
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <div className={`text-6xl font-bold ${analytics?.operational?.deliveryMetrics?.avgDeliveryTime > 45 ? 'text-red-600' : 'text-green-600'}`}>
                                    {Math.round(analytics?.operational?.deliveryMetrics?.avgDeliveryTime || 0)}
                                </div>
                                <div className="text-sm text-slate-500 mt-2">Avg Time (min)</div>
                                {analytics?.operational?.deliveryMetrics?.avgDeliveryTime > 45 && (
                                    <div className="mt-2 text-red-600 font-medium flex items-center justify-center gap-1">
                                        <AlertTriangle size={16} /> Red Zone!
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{Math.round(analytics?.operational?.deliveryMetrics?.minDeliveryTime || 0)}</div>
                                <div className="text-sm text-slate-500 mt-2">Fastest (min)</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600">{Math.round(analytics?.operational?.deliveryMetrics?.maxDeliveryTime || 0)}</div>
                                <div className="text-sm text-slate-500 mt-2">Slowest (min)</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: SALES & PRODUCTS */}
            {activeTab === 'sales' && (
                <div className="space-y-8">
                    {/* Product vs Service Mix */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Product vs Service Mix</h3>
                            <p className="text-sm text-slate-500">Revenue distribution</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics?.growth?.productMix || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="revenue"
                                    nameKey="_id"
                                >
                                    {(analytics?.growth?.productMix || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Selling Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Top Selling Items</h3>
                            <p className="text-sm text-slate-500">Best performers</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics?.growth?.topItems || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="_id" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* TAB 4: CUSTOMERS */}
            {activeTab === 'customers' && (
                <div className="space-y-8">
                    {/* New vs Repeat Customers */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                            <Users className="mx-auto text-blue-500 mb-4" size={48} />
                            <div className="text-4xl font-bold text-slate-900">{analytics?.growth?.customerMetrics?.newCustomers || 0}</div>
                            <div className="text-sm text-slate-500 mt-2">New Customers</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                            <Users className="mx-auto text-green-500 mb-4" size={48} />
                            <div className="text-4xl font-bold text-slate-900">{analytics?.growth?.customerMetrics?.repeatCustomers || 0}</div>
                            <div className="text-sm text-slate-500 mt-2">Repeat Customers</div>
                        </div>
                    </div>

                    {/* VIP Customers */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">VIP Customers (High Value)</h3>
                            <p className="text-sm text-slate-500">Top 10 by total spend</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-slate-600 text-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Rank</th>
                                        <th className="px-4 py-3 text-left">Customer</th>
                                        <th className="px-4 py-3 text-right">Orders</th>
                                        <th className="px-4 py-3 text-right">Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(analytics?.growth?.vipCustomers || []).map((customer, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 font-bold text-slate-900">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{customer.name}</div>
                                                <div className="text-xs text-slate-500">{customer.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{customer.orderCount}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-600">₹{customer.totalSpent.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Metric Card Component
function MetricCard({ title, value, trend, icon: Icon, color, alert }) {
    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border ${alert ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 ${color} rounded-lg`}>
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-1">{title}</div>
            {alert && (
                <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> Needs Attention
                </div>
            )}
        </div>
    );
}

export default Analytics;
