/**
 * Admin Operators Page - Table Structure
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, UserPlus, Mail, Phone, MapPin, ChevronRight, Star, Eye } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import OperatorModal from '../components/OperatorModal';

function Operators() {
    const navigate = useNavigate();
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOperators();
    }, []);

    const fetchOperators = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/users?role=operator`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOperators(response.data.data.users);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${userId}`, { isApproved: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setOperators(operators.map(op => op._id === userId ? { ...op, isApproved: true } : op));
        } catch (error) {
            console.error('Error approving operator:', error);
            alert('Failed to approve operator');
        }
    };

    const handleToggleOnline = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !currentStatus;

            // Optimistic UI update
            setOperators(operators.map(op =>
                op._id === userId
                    ? { ...op, status: { ...op.status, isOnline: newStatus } }
                    : op
            ));

            // Backend update
            await axios.put(`${API_URL}/admin/users/${userId}`, {
                status: { isOnline: newStatus }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error toggling online status:', error);
            // Revert on error
            setOperators(operators.map(op =>
                op._id === userId
                    ? { ...op, status: { ...op.status, isOnline: currentStatus } }
                    : op
            ));
            alert('Failed to update online status');
        }
    };

    const handleEdit = (operator) => {
        setSelectedOperator(operator);
        setIsModalOpen(true);
    };

    const handleUpdate = (updatedOperator) => {
        setOperators(operators.map(op => op._id === updatedOperator._id ? updatedOperator : op));
    };

    const filteredOperators = operators.filter(op =>
        (op.name && op.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (op.email && op.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (op.shopDetails?.shopName && op.shopDetails.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            {/* Filters & Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search operators by name, shop or email..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                    <UserPlus size={18} />
                    Add Operator
                </button>
            </div>

            {/* Operators Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-left">Shop Identity</th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-left">Live Status</th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-left">Financials</th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-left">Performance</th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-left">Location</th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-500">
                                        <div className="flex justify-center">
                                            <div className="spinner"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOperators.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-500">
                                        No operators found
                                    </td>
                                </tr>
                            ) : (
                                filteredOperators.map((operator, index) => (
                                    <tr key={operator._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
                                                    {(operator.shopDetails?.shopName || operator.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">
                                                        {operator.shopDetails?.shopName || operator.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        {operator.shopDetails?.ownerName || operator.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${operator.status?.isOnline ? 'bg-emerald-500' : 'bg-slate-200'
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleOnline(operator._id, operator.status?.isOnline);
                                                    }}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${operator.status?.isOnline ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-sm font-medium ${operator.status?.isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                    {operator.status?.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold text-slate-700">
                                                    ₹{operator.financials?.pendingPayout?.toLocaleString() || '0'}
                                                </div>
                                                <div className="text-xs text-slate-500">Pending Payout</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    <span className="font-bold text-slate-700">{operator.performance?.rating || '0.0'}</span>
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Rejection: <span className="text-rose-500 font-medium">{operator.performance?.rejectionRate || '0'}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <MapPin size={16} className="mr-2 text-slate-400" />
                                                <span className="truncate max-w-[150px]" title={operator.shopDetails?.address || operator.address?.city}>
                                                    {operator.shopDetails?.address || operator.address?.city || 'Not specified'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/users/operators/${operator._id}`)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View Full Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(operator)}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Operators</p>
                    <p className="text-3xl font-bold text-slate-800">{operators.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Active Today</p>
                    <p className="text-3xl font-bold text-emerald-600">{Math.floor(operators.length * 0.7)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Avg. Rating</p>
                    <p className="text-3xl font-bold text-amber-600">4.6</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-blue-600">1,234</p>
                </div>
            </div>

            {/* Edit Modal */}
            <OperatorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                operator={selectedOperator}
                onUpdate={handleUpdate}
            />
        </>
    );
}

export default Operators;
