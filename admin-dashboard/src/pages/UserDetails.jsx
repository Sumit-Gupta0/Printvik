/**
 * @file UserDetails.jsx
 * @module UserManagement
 * @description Main page for viewing and managing detailed user profiles. Handles role-specific views (Admin, Delivery, Operator, User), wallet transactions, and security settings.
 * @requires react, react-router-dom, axios, lucide-react
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Mail, Phone, Calendar, MapPin, Shield,
    CheckCircle, XCircle, AlertTriangle, Clock, Package,
    CreditCard, FileText, Edit, Trash2, MoreVertical,
    Lock, Unlock, RefreshCw, Eye, X, ChevronLeft, ChevronRight,
    RotateCw, ZoomIn, ZoomOut, MessageCircle, Plus,
    Battery, BatteryCharging, Bike, FileCheck, Banknote, Timer, Star,
    Store, Settings, Power, Percent, Printer, BookOpen, Layers,
    ShieldCheck, Key, UserX, Activity, List, Database, Globe, UserCheck
} from 'lucide-react';
import UserHeader from '../components/userDetails/UserHeader';
import PermissionsMatrix from '../components/userDetails/PermissionsMatrix';
import AuditLog from '../components/userDetails/AuditLog';
import StaffNotes from '../components/userDetails/StaffNotes';
import WalletWidget from '../components/userDetails/WalletWidget';
import SecuritySettings from '../components/userDetails/SecuritySettings';
import UserAddresses from '../components/userDetails/UserAddresses';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * @component UserDetails
 * @desc Main component for the User Details page. Fetches and displays user data, history, and manages admin actions.
 * @returns {JSX.Element} The rendered UserDetails page.
 */
function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history');

    // Wallet Logic
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [walletAction, setWalletAction] = useState('credit');
    const [walletAmount, setWalletAmount] = useState('');
    const [walletReason, setWalletReason] = useState('');

    // 2FA Logic

    const [pinCode, setPinCode] = useState('');

    // PIN Verification Logic
    const [showPinVerifyModal, setShowPinVerifyModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [verifyPin, setVerifyPin] = useState('');

    // Staff Notes Logic
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [smsStatus, setSmsStatus] = useState('');
    const [noteText, setNoteText] = useState('');
    const [sendSms, setSendSms] = useState(true); // SMS toggle

    // Order Filters
    const [orderStatusFilter, setOrderStatusFilter] = useState('');
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [orderDateFrom, setOrderDateFrom] = useState('');
    const [orderDateTo, setOrderDateTo] = useState('');

    // CRM Notes Filter
    const [notesFilter, setNotesFilter] = useState('all'); // all, transactions, staff

    useEffect(() => {
        fetchUserDetails();
        fetchUserHistory();
    }, [id]);

    /**
     * @desc Fetches detailed user information from the backend.
     * @returns {Promise<void>} Updates the `user` state.
     */
    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userRes = await axios.get(`${API_URL}/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userRes.data.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * @desc Fetches the user's order history.
     * @returns {Promise<void>} Updates the `history` state.
     */
    const fetchUserHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const historyRes = await axios.get(`${API_URL}/admin/users/${id}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(historyRes.data.data.orders || []);
        } catch (error) {
            console.error('Error fetching user history:', error);
            setHistory([]);
        }
    };

    /**
     * @desc Updates the user's wallet balance (credit/debit).
     * @param {Event} e - Form submission event.
     * @returns {Promise<void>} Updates user state and closes modal on success.
     */
    const handleWalletUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/users/${id}/wallet`, {
                amount: walletAmount,
                type: walletAction,
                reason: walletReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setUser({ ...user, walletBalance: response.data.data.walletBalance, adminNotes: response.data.data.adminNotes });
                setShowWalletModal(false);
                setWalletAmount('');
                setWalletReason('');
                alert('Wallet updated successfully');
            }
        } catch (error) {
            console.error('Error updating wallet:', error);
            alert(error.response?.data?.message || 'Failed to update wallet');
        }
    };

    /**
     * @desc Adds a staff note to the user's profile.
     * @param {Event} e - Form submission event.
     * @returns {Promise<void>} Updates user state with new note.
     */
    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/users/${id}/notes`, {
                text: noteText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setUser({ ...user, adminNotes: response.data.data.adminNotes });
                setNoteText('');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        }
    };

    /**
     * @desc Initiates a sensitive action requiring PIN verification.
     * @param {Function} action - The function to execute after successful verification.
     */
    const verifyAction = (action) => {
        // Step 1: Store the action to be executed later
        setPendingAction(() => action);
        // Step 2: Show the PIN verification modal
        setShowPinVerifyModal(true);
    };

    /**
     * @desc Validates the entered PIN and executes the pending action.
     * @param {Event} e - Form submission event.
     */
    const handlePinSubmit = (e) => {
        e.preventDefault();
        // SECURITY CHECK: Verify against backend or session PIN
        // For now, we'll assume the PIN is '123456' or the one just set if available
        const correctPin = '123456';

        if (verifyPin === correctPin || (pinCode && verifyPin === pinCode)) {
            setShowPinVerifyModal(false);
            setVerifyPin('');
            if (pendingAction) {
                // Step 3: Execute the protected action
                pendingAction();
                setPendingAction(null);
            }
        } else {
            alert('Incorrect PIN');
        }
    };

    /**
     * @desc Toggles the user's active status (Lock/Unlock).
     * @requires verifyAction - This action is protected by PIN verification.
     */
    const handleToggleLock = async () => {
        verifyAction(async () => {
            const newStatus = !user?.isActive;
            const action = newStatus ? 'unlock' : 'lock';

            try {
                const token = localStorage.getItem('token');
                const response = await axios.put(`${API_URL}/admin/users/${id}`, { isActive: newStatus }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Update with server response
                if (response.data.data && response.data.data.user) {
                    setUser(response.data.data.user);
                } else {
                    // Fallback if response structure varies
                    setUser({ ...user, isActive: newStatus });
                }
                alert(`User ${action}ed successfully!`);
            } catch (error) {
                console.error(`Error ${action}ing user:`, error);
                alert(`Failed to ${action} user`);
            }
        });
    };

    /**
     * @desc Resets user password and sends SMS notification.
     * @requires verifyAction - This action is protected by PIN verification.
     */
    const handlePasswordReset = () => {
        verifyAction(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${API_URL}/admin/users/${id}/reset-password`,
                    { sendSms: sendSms },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setNewPassword(response.data.newPassword);
                    setSmsStatus(response.data.smsStatus);
                    setShowPasswordResetModal(true);
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                alert(error.response?.data?.message || 'Failed to reset password');
            }
        });
    };



    const calculateTrustScore = () => {
        if (!history || history.length === 0) return 100;
        const completed = history.filter(o => o.orderStatus === 'delivered').length;
        return Math.round((completed / history.length) * 100);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-rose-100 text-rose-800',
            out_for_delivery: 'bg-purple-100 text-purple-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {status?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
            </span>
        );
    };

    /**
     * @desc Deletes a user address.
     * @param {string} addrId - The ID of the address to delete.
     * @requires verifyAction - This action is protected by PIN verification.
     */
    const handleDeleteAddress = (addrId) => {
        verifyAction(() => {
            const updatedAddresses = (user?.addresses || []).filter(a => a._id !== addrId);
            setUser({ ...user, addresses: updatedAddresses });
            alert('Address deleted (mock)');
        });
    };

    // Filter orders based on status, search, and date range
    const getFilteredOrders = () => {
        let filtered = history || [];

        // Status filter
        if (orderStatusFilter) {
            filtered = filtered.filter(o => o.orderStatus === orderStatusFilter);
        }

        // Search filter (by order number)
        if (orderSearchTerm) {
            filtered = filtered.filter(o =>
                o.orderNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase())
            );
        }

        // Date range filter
        if (orderDateFrom) {
            filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(orderDateFrom));
        }
        if (orderDateTo) {
            filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(orderDateTo));
        }

        return filtered;
    };

    const handleRepeatOrder = (orderId) => {
        if (confirm('Create a duplicate order with the same items?')) {
            alert(`Repeat Order #${orderId} - Feature coming soon`);
            // TODO: API call to duplicate order
        }
    };

    const handleRaiseComplaint = (orderId) => {
        const complaint = prompt('Enter complaint details:');
        if (complaint) {
            alert(`Complaint raised for Order #${orderId}: ${complaint}`);
            // TODO: API call to create ticket
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-bold text-slate-800">User not found</h3>
                <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const trustScore = calculateTrustScore();

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to List
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowWalletModal(true)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                    >
                        <Package size={16} />
                        Wallet: ₹{user?.walletBalance || 0}
                    </button>

                    {/* GOD MODE ACTIONS DROPDOWN */}
                    <div className="relative group">
                        <button className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-900 transition-colors">
                            <MoreVertical size={16} />
                            Actions
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            {user?.role === 'operator' ? (
                                /* Vendor Controls */
                                <>
                                    <button
                                        onClick={() => window.open(`http://localhost:3000/shop/${user._id}`, '_blank')}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Eye className="text-indigo-600" size={16} />
                                        <span className="font-medium">🔍 View Shop as User</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const rate = prompt('Enter new commission rate (%):', user?.vendorInfo?.commissionRate || 10);
                                            if (rate) alert(`Commission updated to ${rate}%`);
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Percent className="text-amber-600" size={16} />
                                        <span className="font-medium">⚙️ Change Commission</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Force shop OFFLINE? This will stop new orders.')) {
                                                alert('Shop forced offline');
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-rose-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Power className="text-rose-600" size={16} />
                                        <span className="font-medium text-rose-600">🔌 Force Offline</span>
                                    </button>
                                </>
                            ) : user?.role === 'admin' ? (
                                /* Security Controls for Admins */
                                <>
                                    <button
                                        onClick={handlePasswordReset}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Key className="text-indigo-600" size={16} />
                                        <span className="font-medium">Reset Password & Send SMS</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-2"></div>
                                    <button
                                        onClick={() => {
                                            verifyAction(() => {
                                                alert('Access Suspended');
                                            });
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-rose-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <UserX className="text-rose-600" size={16} />
                                        <span className="font-medium text-rose-600">Suspend Access</span>
                                    </button>
                                </>
                            ) : user?.role === 'delivery' ? (
                                /* Delivery Partner Controls */
                                <>
                                    {!user?.isApproved && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Approve this delivery partner?')) {
                                                    alert('Rider Approved!');
                                                    // TODO: API call
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-3 text-sm transition-colors"
                                        >
                                            <CheckCircle className="text-emerald-600" size={16} />
                                            <span className="font-medium text-emerald-700">Approve Rider</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const amount = prompt('Enter cash amount to settle:', user?.financials?.cashInHand || 0);
                                            if (amount) alert(`Settled ₹${amount} from rider`);
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Banknote className="text-indigo-600" size={16} />
                                        <span className="font-medium">Settle Cash</span>
                                    </button>

                                    <button
                                        onClick={() => navigate('/delivery')}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <MapPin className="text-blue-600" size={16} />
                                        <span className="font-medium">Track Location</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-2"></div>

                                    <button
                                        onClick={handleToggleLock}
                                        className={`w-full px-4 py-2.5 text-left hover:bg-rose-50 flex items-center gap-3 text-sm transition-colors ${user?.isActive ? 'text-rose-600' : 'text-emerald-600'}`}
                                    >
                                        {user?.isActive ? <UserX size={16} /> : <CheckCircle size={16} />}
                                        <span className="font-medium">{user?.isActive ? 'Suspend Rider' : 'Reactivate Rider'}</span>
                                    </button>
                                </>
                            ) : (
                                /* Standard User Controls */
                                <>
                                    <button
                                        onClick={() => {
                                            if (confirm('Block Cash on Delivery for this user?')) {
                                                alert('COD Blocked - Feature coming soon');
                                                // TODO: API call to toggle COD
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <XCircle className="text-rose-600" size={16} />
                                        <span className="font-medium">Block COD Only</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Send password reset link to user?')) {
                                                alert('Password reset link sent - Feature coming soon');
                                                // TODO: API call to reset password
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <RefreshCw className="text-blue-600" size={16} />
                                        <span className="font-medium">Reset Password</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Login as this user? (Debug mode)')) {
                                                alert('Impersonate feature - Coming soon');
                                                // TODO: API call to get impersonation token
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Eye className="text-purple-600" size={16} />
                                        <span className="font-medium">Login as User</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const couponCode = prompt('Enter coupon code (e.g., SORRY50):');
                                            if (couponCode) {
                                                alert(`Coupon ${couponCode} sent to user - Feature coming soon`);
                                                // TODO: API call to send coupon
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <Package className="text-emerald-600" size={16} />
                                        <span className="font-medium">Send Coupon</span>
                                    </button>
                                    <div className="border-t border-slate-100 my-2"></div>
                                    <button
                                        onClick={handleToggleLock}
                                        className={`w-full px-4 py-2.5 text-left hover:bg-rose-50 flex items-center gap-3 text-sm transition-colors ${user?.isActive ? 'text-rose-600' : 'text-emerald-600'}`}
                                    >
                                        {user?.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                        <span className="font-medium">{user?.isActive ? 'Lock Account' : 'Unlock Account'}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Header */}
            <UserHeader user={user} trustScore={trustScore} />

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    {user?.role === 'delivery' ? 'Delivery Performance' : user?.role === 'admin' ? 'Access Rights' : 'Order History'}
                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'crm' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('crm')}
                >
                    {user?.role === 'delivery' ? 'Financial Ledger' : user?.role === 'operator' ? 'Payout & Ledger' : user?.role === 'admin' ? 'Audit Log' : 'CRM & Notes'}
                    {activeTab === 'crm' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                {user?.role === 'admin' && (
                    <button
                        className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'security' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security Settings
                        {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                )}
                {
                    user?.role !== 'admin' && (
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'addresses' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            {user?.role === 'delivery' ? 'Vehicle & Docs' : user?.role === 'operator' ? 'Shop Config' : 'Addresses & Info'}
                            {activeTab === 'addresses' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                    )
                }
            </div >

            {/* Tab Content */}
            {
                activeTab === 'history' && (
                    user?.role === 'admin' ? (
                        /* Permissions Matrix for Admins */
                        <PermissionsMatrix />
                    ) : (
                        /* Standard Order History */
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">
                                    {user?.role === 'operator' ? 'Assigned Orders' : user?.role === 'delivery' ? 'Delivered Orders' : 'Order History'}
                                </h3 >
                                <span className="text-sm text-slate-500">{getFilteredOrders().length} Orders</span>
                            </div >

                            {/* Filter Bar */}
                            < div className="px-6 py-4 bg-slate-50 border-b border-slate-200" >
                                <div className="flex flex-wrap gap-3">
                                    {/* Status Filter */}
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="">All Status</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">In-Process</option>
                                        <option value="out_for_delivery">Out for Delivery</option>
                                    </select>

                                    {/* Date Range */}
                                    <input
                                        type="date"
                                        value={orderDateFrom}
                                        onChange={(e) => setOrderDateFrom(e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="From"
                                    />
                                    <span className="text-slate-400 self-center">to</span>
                                    <input
                                        type="date"
                                        value={orderDateTo}
                                        onChange={(e) => setOrderDateTo(e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="To"
                                    />

                                    {/* Search */}
                                    <input
                                        type="text"
                                        value={orderSearchTerm}
                                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                                        placeholder="Search Order ID..."
                                        className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />

                                    {/* Clear Filters */}
                                    {(orderStatusFilter || orderSearchTerm || orderDateFrom || orderDateTo) && (
                                        <button
                                            onClick={() => {
                                                setOrderStatusFilter('');
                                                setOrderSearchTerm('');
                                                setOrderDateFrom('');
                                                setOrderDateTo('');
                                            }}
                                            className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div >

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/30">
                                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Order ID</th>
                                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Date</th>
                                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Status</th>
                                            {user?.role === 'delivery' ? (
                                                <>
                                                    <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Time</th>
                                                    <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Distance</th>
                                                    <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Rating</th>
                                                    <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Cash</th>
                                                </>
                                            ) : (
                                                <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Amount</th>
                                            )}
                                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {getFilteredOrders().length === 0 ? (
                                            <tr>
                                                <td colSpan={user?.role === 'delivery' ? 8 : 5} className="text-center py-12 text-slate-400">
                                                    {history?.length > 0 ? 'No orders match your filters' : 'No history found'}
                                                </td>
                                            </tr>
                                        ) : (
                                            getFilteredOrders().map(order => (
                                                <tr key={order?._id || Math.random()} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="py-3 px-6 font-medium text-indigo-600">#{order?.orderNumber || 'N/A'}</td>
                                                    <td className="py-3 px-6 text-sm text-slate-600">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="py-3 px-6">{getStatusBadge(order?.orderStatus)}</td>
                                                    {user?.role === 'delivery' ? (
                                                        <>
                                                            <td className="py-3 px-6 text-sm font-medium">
                                                                <span className={Math.random() > 0.5 ? 'text-emerald-600' : 'text-rose-600'}>
                                                                    {Math.floor(Math.random() * 40 + 15)} mins
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-6 text-sm text-slate-600">{Math.floor(Math.random() * 10 + 1)} km</td>
                                                            <td className="py-3 px-6">
                                                                <div className="flex items-center gap-1 text-amber-500">
                                                                    <Star size={14} fill="currentColor" />
                                                                    <span className="text-sm font-bold text-slate-700">{Math.floor(Math.random() * 2 + 3)}.5</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-6 text-sm font-bold text-slate-700">
                                                                {Math.random() > 0.5 ? `₹${order?.totalAmount}` : <span className="text-slate-400">Prepaid</span>}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td className="py-3 px-6 font-bold text-slate-700">₹{order?.totalAmount || 0}</td>
                                                    )}
                                                    <td className="py-3 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => navigate(`/orders`)}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRepeatOrder(order?.orderNumber)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Repeat Order"
                                                            >
                                                                <RotateCw size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRaiseComplaint(order?.orderNumber)}
                                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title="Raise Complaint"
                                                            >
                                                                <AlertTriangle size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div >
                    )
                )
            }

            {
                activeTab === 'crm' && (
                    user?.role === 'admin' ? (
                        /* Audit Log for Admins */
                        <AuditLog />
                    ) : (
                        /* Existing CRM & Notes Logic */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* FMS Dual Ledger for Delivery Partners */}
                            {user?.role === 'delivery' ? (
                                <div className="md:col-span-1 space-y-6">
                                    {/* Earnings Wallet (Payable) */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Package className="text-indigo-600" size={20} />
                                            Earnings Wallet
                                        </h3>
                                        <div className="text-3xl font-bold text-emerald-600 mb-2">₹{user?.financials?.earningsWallet || 1250}</div>
                                        <p className="text-xs text-slate-500 mb-6">Payable to Rider</p>
                                        <button
                                            onClick={() => alert('Payout initiated')}
                                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            Payout to Bank
                                        </button>
                                    </div>

                                    {/* Floating Cash (Liability) */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Banknote className="text-rose-600" size={20} />
                                            Floating Cash
                                        </h3>
                                        <div className="text-3xl font-bold text-rose-600 mb-2">₹{user?.financials?.cashInHand || 4500}</div>
                                        <p className="text-xs text-slate-500 mb-6">Cash collected from COD</p>
                                        <button
                                            onClick={() => {
                                                if (confirm('Settle cash amount? This will reset Floating Cash to 0.')) {
                                                    alert('Cash settled successfully');
                                                    // TODO: API call
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
                                        >
                                            Settle Cash
                                        </button>
                                    </div>
                                </div>
                            ) : user?.role === 'operator' ? (
                                /* Vendor Dashboard Ledger for Operators */
                                <div className="md:col-span-1 space-y-6">
                                    {/* Pending Payout (Liability) */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Banknote className="text-indigo-600" size={20} />
                                            Pending Payout
                                        </h3>
                                        <div className={`text-3xl font-bold mb-2 ${(user?.financials?.pendingPayout || 8500) > 5000 ? 'text-rose-600' : 'text-slate-800'}`}>
                                            ₹{(user?.financials?.pendingPayout || 8500).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-slate-500 mb-6">Amount due to Shop</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => {
                                                    const utr = prompt('Enter UTR Number for Settlement:');
                                                    if (utr) alert(`Payout settled with UTR: ${utr}`);
                                                }}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                                            >
                                                ✅ Settle
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const amount = prompt('Enter Penalty Amount:');
                                                    if (amount) alert(`Penalty of ₹${amount} applied`);
                                                }}
                                                className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold hover:bg-rose-100 transition-colors"
                                            >
                                                ⚠️ Penalty
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settlement Stats */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <CheckCircle className="text-emerald-600" size={20} />
                                            Settlement History
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Total Settled</span>
                                                <span className="font-bold text-slate-800">₹{(user?.financials?.totalSettled || 41500).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Last Payout</span>
                                                <span className="font-bold text-slate-800">Yesterday</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Wallet Widget */
                                <WalletWidget
                                    user={user}
                                    setWalletAction={setWalletAction}
                                    setShowWalletModal={setShowWalletModal}
                                />
                            )}

                            {/* Staff Notes Timeline */}
                            <StaffNotes
                                user={user}
                                notesFilter={notesFilter}
                                setNotesFilter={setNotesFilter}
                                noteText={noteText}
                                setNoteText={setNoteText}
                                handleAddNote={handleAddNote}
                            />
                        </div>
                    )
                )
            }

            {
                activeTab === 'security' && user?.role === 'admin' && (
                    <SecuritySettings />
                )
            }

            {
                activeTab === 'addresses' && (
                    <UserAddresses
                        user={user}
                        handleDeleteAddress={handleDeleteAddress}
                    />
                )
            }

            {/* Wallet Modal */}
            {
                showWalletModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 font-outfit">
                                    {walletAction === 'credit' ? 'Add Money to Wallet' : 'Deduct Money from Wallet'}
                                </h3>
                                <button onClick={() => setShowWalletModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleWalletUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={walletAmount}
                                        onChange={(e) => setWalletAmount(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Note</label>
                                    <textarea
                                        value={walletReason}
                                        onChange={(e) => setWalletReason(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
                                        placeholder="e.g., Refund for Order #1234"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowWalletModal(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-colors ${walletAction === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                                    >
                                        {walletAction === 'credit' ? 'Add Money' : 'Deduct Money'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }





            {/* Password Reset Success Modal */}
            {
                showPasswordResetModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 font-outfit flex items-center gap-2">
                                    <Key className="text-emerald-600" size={24} />
                                    Password Reset Successful
                                </h3>
                                <button onClick={() => {
                                    setShowPasswordResetModal(false);
                                    setNewPassword('');
                                    setSmsStatus('');
                                }} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                    <p className="text-sm text-emerald-800 mb-2">
                                        New password generated for <strong>{user?.name}</strong>
                                    </p>
                                    <p className="text-xs text-emerald-600">
                                        Phone: {user?.phone || 'N/A'}
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendSms}
                                                onChange={(e) => setSendSms(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Send password via SMS</span>
                                        </label>
                                        {user?.phone && (
                                            <span className="text-xs text-slate-500">{user.phone}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newPassword}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-wider"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(newPassword);
                                                alert('Password copied to clipboard!');
                                            }}
                                            className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>

                                {smsStatus === 'sent' ? (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            ✅
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-800">SMS Sent Successfully!</p>
                                            <p className="text-sm text-blue-600">User will receive the new password via SMS</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                            ⚠️
                                        </div>
                                        <div>
                                            <p className="font-semibold text-amber-800">SMS Failed</p>
                                            <p className="text-sm text-amber-600">Please share the password manually</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setShowPasswordResetModal(false);
                                            setNewPassword('');
                                            setSmsStatus('');
                                        }}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PIN Verification Modal */}
            {
                showPinVerifyModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 m-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 font-outfit flex items-center gap-2">
                                    <Lock className="text-rose-600" size={24} />
                                    Security Verification
                                </h3>
                                <button onClick={() => { setShowPinVerifyModal(false); setVerifyPin(''); }} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={handlePinSubmit} className="space-y-4">
                                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-4">
                                    <p className="text-sm text-rose-800">
                                        This action is protected. Please enter your 6-digit Security PIN to proceed.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Enter Security PIN</label>
                                    <input
                                        type="password"
                                        maxLength="6"
                                        value={verifyPin}
                                        onChange={(e) => setVerifyPin(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center text-2xl font-bold tracking-widest"
                                        placeholder="••••••"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => { setShowPinVerifyModal(false); setVerifyPin(''); }}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={verifyPin.length !== 6}
                                        className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Verify & Proceed
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default UserDetails;
