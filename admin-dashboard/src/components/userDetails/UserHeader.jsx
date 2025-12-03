/**
 * @file UserHeader.jsx
 * @module UserDetails
 * @description Displays the user's profile header, including role-specific metrics (e.g., Cash in Hand for Delivery, Revenue for Operators).
 * @requires lucide-react
 */

import React from 'react';
import {
    Mail, Phone, Calendar, Clock, MessageCircle, Banknote, Battery,
    Store, AlertTriangle, Percent, Power, ShieldCheck, Activity, Globe,
    CheckCircle
} from 'lucide-react';

/**
 * @component UserHeader
 * @desc Renders the profile header with user details and role-based stats.
 * @param {Object} props
 * @param {Object} props.user - The user object containing profile and role info.
 * @param {number} props.trustScore - The calculated trust score for the user.
 * @returns {JSX.Element} The rendered UserHeader component.
 */
const UserHeader = ({ user, trustScore }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg relative ${user?.role === 'admin' ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                        {user?.role !== 'admin' && (
                            <div className={`absolute -bottom-1 -right-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white ${trustScore >= 80 ? 'bg-emerald-500' : trustScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} title="Trust Score">
                                {trustScore}%
                            </div>
                        )}
                        {user?.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white" title="Security Level">
                                Lvl 3
                            </div>
                        )}
                    </div>
                    {user?.role !== 'admin' && <p className="text-xs text-slate-500 mt-2 font-medium">Trust Score</p>}
                    {user?.role === 'admin' && <p className="text-xs text-slate-500 mt-2 font-medium">Super Admin</p>}

                    {user?.role !== 'admin' && trustScore < 40 && (
                        <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} /> COD Blocked
                        </p>
                    )}
                    {user?.role === 'admin' && (
                        <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                            <ShieldCheck size={10} /> Secure
                        </p>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-800 font-outfit">{user?.name || 'Unknown User'}</h2>

                        {/* FMS Header for Delivery Partners */}
                        {user?.role === 'delivery' ? (
                            <>
                                <span className={`px-3 py-1.5 border rounded-lg font-bold text-sm flex items-center gap-1.5 ${(user?.financials?.cashInHand || 0) > 2000 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                    <Banknote size={14} />
                                    Cash in Hand: ₹{(user?.financials?.cashInHand || 4500).toLocaleString()}
                                </span>
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-sm flex items-center gap-1.5">
                                    Today: ₹{(user?.financials?.todayEarning || 450).toLocaleString()}
                                </span>
                                <div className="flex items-center gap-2 ml-2">
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${user?.fleetInfo?.batteryLevel < 20 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                        <Battery size={12} className={user?.fleetInfo?.batteryLevel < 20 ? 'text-rose-600' : 'text-slate-600'} />
                                        {user?.fleetInfo?.batteryLevel || 85}%
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${user?.fleetInfo?.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <div className={`w-2 h-2 rounded-full ${user?.fleetInfo?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                        {user?.fleetInfo?.isOnline ? 'Online' : 'Offline'}
                                    </div>
                                </div>
                            </>
                        ) : user?.role === 'operator' ? (
                            /* Vendor Dashboard Header for Operators */
                            <>
                                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-sm flex items-center gap-1.5">
                                    <Store size={14} />
                                    Revenue: ₹{(user?.vendorInfo?.totalRevenue || 50000).toLocaleString()}
                                </span>
                                <span className={`px-3 py-1.5 border rounded-lg font-bold text-sm flex items-center gap-1.5 ${(user?.vendorInfo?.rejectionRate || 2.5) > 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                    <AlertTriangle size={14} />
                                    Rejection: {user?.vendorInfo?.rejectionRate || 2.5}%
                                </span>
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold flex items-center gap-1">
                                    <Percent size={12} />
                                    Comm: {user?.vendorInfo?.commissionRate || 10}%
                                </span>
                                <div className="flex items-center gap-2 ml-2">
                                    <button
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${user?.vendorInfo?.isShopOpen ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
                                        onClick={() => {
                                            if (confirm(`Turn shop ${user?.vendorInfo?.isShopOpen ? 'OFFLINE' : 'ONLINE'}?`)) {
                                                // Toggle logic
                                            }
                                        }}
                                    >
                                        <Power size={12} />
                                        {user?.vendorInfo?.isShopOpen ? 'Shop Open' : 'Shop Closed'}
                                    </button>
                                </div>
                            </>
                        ) : user?.role === 'admin' ? (
                            /* Security Dashboard Header for Admins */
                            <>
                                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-sm flex items-center gap-1.5">
                                    <ShieldCheck size={14} />
                                    {user?.adminInfo?.role || 'SUPER ADMIN'}
                                </span>
                                <span className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold text-sm flex items-center gap-1.5">
                                    <Activity size={14} />
                                    {user?.adminInfo?.lastActive || 'Active: 2m ago'}
                                </span>
                                <div className="flex items-center gap-2 ml-2">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                                        <Globe size={12} />
                                        IP: {user?.adminInfo?.ipAddress || '192.168.1.45'}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Standard User Header */
                            <>
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-sm flex items-center gap-1.5">
                                    <Banknote size={14} /> LTV: ₹{(user?.totalSpent || 0).toLocaleString()}
                                </span>
                            </>
                        )}

                        <span className={`badge ${user?.role === 'admin' ? 'badge-error' : user?.role === 'operator' ? 'badge-warning' : user?.role === 'delivery' ? 'badge-info' : 'badge-success'}`}>
                            {(user?.role || 'user').toUpperCase()}
                        </span>
                        {user?.isApproved ? (
                            <span className="badge badge-success flex items-center gap-1"><CheckCircle size={12} /> Approved</span>
                        ) : (
                            <span className="badge badge-warning flex items-center gap-1"><Clock size={12} /> Pending</span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center text-slate-600">
                            <Mail size={16} className="mr-2 text-slate-400" />
                            {user?.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={16} className="text-slate-400" />
                            <a href={`tel:${user?.phone}`} className="hover:text-indigo-600 transition-colors font-medium">
                                {user?.phone || 'N/A'}
                            </a>
                            {user?.phone && (
                                <>
                                    <a
                                        href={`https://wa.me/91${user?.phone?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                        title="WhatsApp"
                                    >
                                        <MessageCircle size={14} />
                                    </a>
                                    <a
                                        href={`tel:${user?.phone}`}
                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        title="Call"
                                    >
                                        <Phone size={14} />
                                    </a>
                                </>
                            )}
                        </div>
                        <div className="flex items-center text-slate-600">
                            <Calendar size={16} className="mr-2 text-slate-400" />
                            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center text-slate-600" title="Device Info">
                            <Clock size={16} className="mr-2 text-slate-400" />
                            {user?.deviceInfo?.os || 'Unknown OS'} v{user?.deviceInfo?.appVersion || '1.0'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHeader;
