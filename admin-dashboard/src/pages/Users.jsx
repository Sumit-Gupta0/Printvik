/**
 * Admin Users Page - Filtered by Role with CRUD
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, UserPlus, Mail, Phone, Edit, Trash2, X, Check, AlertTriangle, Eye } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Operators from './Operators';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Users() {
    const { type } = useParams(); // Get user type from URL

    // Redirect to rich Operators page if type is operators
    if (type === 'operators') {
        return <Operators />;
    }

    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Action states
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // CRM States
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [filterType, setFilterType] = useState('all'); // all, high-value, new, blocked

    // Map URL type to role
    const roleMap = {
        'end-users': 'user',
        'operators': 'operator',
        'delivery': 'delivery',
        'admins': 'admin'
    };

    const role = roleMap[type] || 'user';

    // Title and badge config
    const config = {
        'user': { title: 'End Users', badgeClass: 'badge-success', gradient: 'from-emerald-500 to-teal-600' },
        'operator': { title: 'Operators', badgeClass: 'badge-warning', gradient: 'from-amber-500 to-orange-600' },
        'delivery': { title: 'Delivery Personnel', badgeClass: 'badge-info', gradient: 'from-blue-500 to-indigo-600' },
        'admin': { title: 'Administrators', badgeClass: 'badge-error', gradient: 'from-rose-500 to-pink-600' }
    };

    const currentConfig = config[role];

    useEffect(() => {
        fetchUsers();
    }, [type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/users?role=${role}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper Functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatLastActive = (date) => {
        if (!date) return 'Never';
        const diff = new Date() - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const calculateTrustScore = (user) => {
        // Mock calculation if fields missing
        // In real app, these should come from backend
        const total = user.totalOrders || 0;
        const completed = user.completedOrders || 0;

        if (total === 0) return 100; // New user starts with 100%
        return Math.round((completed / total) * 100);
    };

    const getTrustScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    // Filter Logic
    const getFilteredUsers = () => {
        let filtered = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterType === 'high-value') {
            filtered = filtered.filter(u => (u.totalSpent || 0) > 5000);
        } else if (filterType === 'new') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            filtered = filtered.filter(u => new Date(u.createdAt) > oneMonthAgo);
        } else if (filterType === 'blocked') {
            filtered = filtered.filter(u => !u.isActive || u.isCodBlocked);
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    // Bulk Actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(filteredUsers.map(u => u._id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleBulkNotification = () => {
        alert(`Sending push notification to ${selectedUsers.length} users`);
        // TODO: Implement actual API call
        setSelectedUsers([]);
    };

    // CRUD Handlers
    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${editingUser._id}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setUsers(users.map(u => u._id === editingUser._id ? editingUser : u));
            setShowEditModal(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${userId}`, { isApproved: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, isApproved: true } : u));
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            {/* Search & Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${currentConfig.title.toLowerCase()}...`}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Smart Filters */}
                    {role === 'user' && (
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-slate-600"
                        >
                            <option value="all">All Users</option>
                            <option value="high-value">💎 High Value</option>
                            <option value="new">🌟 New This Month</option>
                            <option value="blocked">🚫 Blocked/Inactive</option>
                        </select>
                    )}
                </div>

                <div className="flex gap-2">
                    {selectedUsers.length > 0 && (
                        <button
                            onClick={handleBulkNotification}
                            className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all animate-fade-in"
                        >
                            <Mail size={18} />
                            Notify ({selectedUsers.length})
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                        <UserPlus size={18} />
                        Add {currentConfig.title.slice(0, -1)}
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 font-outfit">{currentConfig.title}</h3>
                        <span className={`badge ${currentConfig.badgeClass}`}>
                            {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="py-3 px-6 text-left w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">User</th>
                                {role === 'user' && (
                                    <>
                                        <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Last Active</th>
                                        <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">LTV / Orders</th>
                                        <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Trust Score</th>
                                    </>
                                )}
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Contact</th>
                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={role === 'user' ? 7 : 5} className="text-center py-12 text-slate-500">
                                        <div className="flex justify-center">
                                            <div className="spinner"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={role === 'user' ? 7 : 5} className="text-center py-12 text-slate-400 text-sm">
                                        No {currentConfig.title.toLowerCase()} found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => {
                                    const trustScore = calculateTrustScore(user);
                                    return (
                                        <tr key={user._id} className={`hover:bg-slate-50/80 transition-colors group ${selectedUsers.includes(user._id) ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="py-3 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user._id)}
                                                    onChange={() => handleSelectUser(user._id)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 bg-gradient-to-br ${currentConfig.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-800 text-sm block">{user.name}</span>
                                                        <span className="text-xs text-slate-500">#{String(index + 1).padStart(4, '0')}</span>
                                                        {!user.isApproved && (
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 inline-block mt-0.5">
                                                                Pending Approval
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {role === 'user' && (
                                                <>
                                                    <td className="py-3 px-6">
                                                        <div className="text-sm text-slate-600 font-medium">
                                                            {formatLastActive(user.lastLogin)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800">{formatCurrency(user.totalSpent)}</span>
                                                            <span className="text-xs text-slate-500">{user.totalOrders || 0} orders</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getTrustScoreColor(trustScore)}`}>
                                                            {trustScore}%
                                                        </span>
                                                    </td>
                                                </>
                                            )}

                                            <td className="py-3 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Mail size={12} className="mr-2 text-slate-400" />
                                                        {user.email}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Phone size={12} className="mr-2 text-slate-400" />
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!user.isApproved && (
                                                        <button
                                                            onClick={() => handleApprove(user._id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Approve User"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/users/${type}/${user._id}`)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {['admin', 'super_admin'].includes(currentUser?.role) && (
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 font-outfit">Edit User</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editingUser.phone}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="user">End User</option>
                                    <option value="operator">Operator</option>
                                    <option value="delivery">Delivery</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Users;
