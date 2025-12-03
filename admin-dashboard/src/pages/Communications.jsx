import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import {
    MessageSquare,
    Mail,
    Bell,
    Send,
    FileText,
    History,
    Edit,
    Check,
    X,
    AlertCircle,
    Smartphone,
    Search,
    Filter,
    BarChart3,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Communications = () => {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState('templates'); // templates, marketing, logs
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Data States
    const [templates, setTemplates] = useState([]);
    const [logs, setLogs] = useState([]);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotalPages, setLogsTotalPages] = useState(1);
    const [analytics, setAnalytics] = useState(null);

    // Edit Modal State
    const [editModal, setEditModal] = useState({ open: false, template: null });

    // Marketing Form State
    const [marketingForm, setMarketingForm] = useState({
        targetAudience: 'all',
        title: '',
        message: '',
        image: null
    });

    useEffect(() => {
        if (activeTab === 'templates') fetchTemplates();
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'analytics') fetchAnalytics();
    }, [activeTab, logsPage]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/notifications/templates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemplates(res.data.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setMessage({ type: 'error', text: 'Failed to load templates' });
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/notifications/logs?page=${logsPage}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data.data.logs);
            setLogsTotalPages(res.data.data.totalPages);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/notifications/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(res.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setMessage({ type: 'error', text: 'Failed to load analytics' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/notifications/templates/${editModal.template._id}`, {
                channels: editModal.template.channels
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Template updated successfully' });
            setEditModal({ open: false, template: null });
            fetchTemplates();
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error updating template:', error);
            setMessage({ type: 'error', text: 'Failed to update template' });
        }
    };

    const handleSendCampaign = async () => {
        if (!marketingForm.message) return;

        if (!window.confirm('You are about to send this campaign to users. Confirm?')) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/notifications/marketing`, marketingForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Campaign scheduled successfully' });
            setMarketingForm({ targetAudience: 'all', title: '', message: '', image: null });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error sending campaign:', error);
            setMessage({ type: 'error', text: 'Failed to send campaign' });
        }
    };

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Communications Center</h1>
                    <p className="text-slate-500 mt-1">Manage notifications, marketing campaigns, and view logs</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <FileText size={18} /> Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('marketing')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'marketing' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Send size={18} /> Marketing Blaster
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <History size={18} /> Delivery Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <BarChart3 size={18} /> Analytics
                    </button>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'templates' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Event Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Active Channels</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {templates.map((template) => (
                                    <tr key={template._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{template.eventKey}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {template.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <span className={`p-1.5 rounded ${template.channels.sms.isEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <MessageSquare size={16} />
                                                </span>
                                                <span className={`p-1.5 rounded ${template.channels.email.isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Mail size={16} />
                                                </span>
                                                <span className={`p-1.5 rounded ${template.channels.push.isEnabled ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Bell size={16} />
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setEditModal({ open: true, template: JSON.parse(JSON.stringify(template)) })}
                                                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 justify-end"
                                            >
                                                <Edit size={16} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'marketing' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Campaign Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Compose Campaign</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                                    <select
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={marketingForm.targetAudience}
                                        onChange={(e) => setMarketingForm({ ...marketingForm, targetAudience: e.target.value })}
                                    >
                                        <option value="all">All Users</option>
                                        <option value="inactive_30">Inactive (&gt;30 Days)</option>
                                        <option value="high_spenders">High Spenders (&gt;₹2000)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g., Exam Special Offer"
                                        value={marketingForm.title}
                                        onChange={(e) => setMarketingForm({ ...marketingForm, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                                        placeholder="Type your message here..."
                                        value={marketingForm.message}
                                        onChange={(e) => setMarketingForm({ ...marketingForm, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    onClick={handleSendCampaign}
                                    disabled={!marketingForm.message}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Send Campaign
                                </button>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="flex justify-center items-start pt-8">
                            <div className="w-[320px] h-[640px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 relative overflow-hidden shadow-2xl">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>

                                {/* Screen Content */}
                                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop')] bg-cover relative">
                                    <div className="absolute inset-0 bg-black/20"></div>

                                    {/* Time */}
                                    <div className="absolute top-3 left-6 text-white text-xs font-semibold z-10">9:41</div>

                                    {/* Notification Card */}
                                    <div className="absolute top-16 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg animate-slide-down">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-semibold text-slate-900">PrintVik</h4>
                                                    <span className="text-[10px] text-slate-500">now</span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-900 mt-0.5">{marketingForm.title || 'Notification Title'}</p>
                                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                                    {marketingForm.message || 'Your notification message will appear here...'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Recipient</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Event</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Channels</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.length > 0 ? logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{log.recipient?.userId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{log.recipient?.email || log.recipient?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                {log.event}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {log.channelsSent.map(ch => (
                                                    <span key={ch} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">
                                                        {ch}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                log.status === 'PARTIAL_FAILURE' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                            No logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {logsTotalPages > 1 && (
                            <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                                <button
                                    disabled={logsPage === 1}
                                    onClick={() => setLogsPage(p => p - 1)}
                                    className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-600">Page {logsPage} of {logsTotalPages}</span>
                                <button
                                    disabled={logsPage === logsTotalPages}
                                    onClick={() => setLogsPage(p => p + 1)}
                                    className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && analytics && (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-500 text-sm font-medium">Total Volume (Today)</h3>
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Send size={20} className="text-indigo-600" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-slate-900">{analytics.volume.today}</span>
                                    <span className="text-sm text-slate-500">notifications</span>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                                    <span>Week: <strong>{analytics.volume.week}</strong></span>
                                    <span>Month: <strong>{analytics.volume.month}</strong></span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-500 text-sm font-medium">Success Rate</h3>
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <TrendingUp size={20} className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-slate-900">{100 - analytics.performance.failureRate}%</span>
                                    <span className="text-sm text-green-600 font-medium">optimal</span>
                                </div>
                                <div className="mt-4 text-sm text-slate-500">
                                    Total Sent: <strong>{analytics.performance.totalSent}</strong>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-500 text-sm font-medium">Failure Rate</h3>
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <AlertTriangle size={20} className="text-red-600" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-slate-900">{analytics.performance.failureRate}%</span>
                                    <span className="text-sm text-red-600 font-medium">failed</span>
                                </div>
                                <div className="mt-4 text-sm text-slate-500">
                                    Failed Count: <strong>{analytics.performance.failedCount}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Channel Distribution */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">Channel Usage</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'SMS', value: analytics.channels.SMS || 0, color: '#16a34a' },
                                                    { name: 'Email', value: analytics.channels.EMAIL || 0, color: '#2563eb' },
                                                    { name: 'Push', value: analytics.channels.PUSH || 0, color: '#9333ea' }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell key="SMS" fill="#16a34a" />
                                                <Cell key="Email" fill="#2563eb" />
                                                <Cell key="Push" fill="#9333ea" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Traffic Volume (Mocked for Demo as API returns aggregates) */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">Traffic Volume (Last 7 Days)</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={[
                                                { name: 'Mon', sent: 40 },
                                                { name: 'Tue', sent: 30 },
                                                { name: 'Wed', sent: 20 },
                                                { name: 'Thu', sent: 27 },
                                                { name: 'Fri', sent: 18 },
                                                { name: 'Sat', sent: 23 },
                                                { name: 'Sun', sent: 34 },
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="sent" stroke="#4f46e5" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Template Modal */}
                {editModal.open && editModal.template && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-slate-900">Edit Template: {editModal.template.eventKey}</h3>
                                <button onClick={() => setEditModal({ open: false, template: null })} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Variables Chips */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Available Variables</label>
                                    <div className="flex flex-wrap gap-2">
                                        {editModal.template.variables.map(v => (
                                            <span key={v} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100 cursor-pointer hover:bg-indigo-100">
                                                {`{{${v}}}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* SMS Channel */}
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={18} className="text-green-600" />
                                            <span className="font-medium text-slate-900">SMS Channel</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={editModal.template.channels.sms.isEnabled}
                                                onChange={(e) => setEditModal({
                                                    ...editModal,
                                                    template: {
                                                        ...editModal.template,
                                                        channels: {
                                                            ...editModal.template.channels,
                                                            sms: { ...editModal.template.channels.sms, isEnabled: e.target.checked }
                                                        }
                                                    }
                                                })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    {editModal.template.channels.sms.isEnabled && (
                                        <textarea
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            rows="3"
                                            value={editModal.template.channels.sms.template}
                                            onChange={(e) => setEditModal({
                                                ...editModal,
                                                template: {
                                                    ...editModal.template,
                                                    channels: {
                                                        ...editModal.template.channels,
                                                        sms: { ...editModal.template.channels.sms, template: e.target.value }
                                                    }
                                                }
                                            })}
                                        ></textarea>
                                    )}
                                </div>

                                {/* Push Channel */}
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <Bell size={18} className="text-purple-600" />
                                            <span className="font-medium text-slate-900">Push Notification</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={editModal.template.channels.push.isEnabled}
                                                onChange={(e) => setEditModal({
                                                    ...editModal,
                                                    template: {
                                                        ...editModal.template,
                                                        channels: {
                                                            ...editModal.template.channels,
                                                            push: { ...editModal.template.channels.push, isEnabled: e.target.checked }
                                                        }
                                                    }
                                                })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    {editModal.template.channels.push.isEnabled && (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Notification Title"
                                                value={editModal.template.channels.push.title}
                                                onChange={(e) => setEditModal({
                                                    ...editModal,
                                                    template: {
                                                        ...editModal.template,
                                                        channels: {
                                                            ...editModal.template.channels,
                                                            push: { ...editModal.template.channels.push, title: e.target.value }
                                                        }
                                                    }
                                                })}
                                            />
                                            <textarea
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                rows="2"
                                                placeholder="Notification Body"
                                                value={editModal.template.channels.push.body}
                                                onChange={(e) => setEditModal({
                                                    ...editModal,
                                                    template: {
                                                        ...editModal.template,
                                                        channels: {
                                                            ...editModal.template.channels,
                                                            push: { ...editModal.template.channels.push, body: e.target.value }
                                                        }
                                                    }
                                                })}
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditModal({ open: false, template: null })}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTemplate}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Communications;
