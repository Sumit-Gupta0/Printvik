import React, { useState } from 'react';
import { X, Clock, Truck, CheckCircle, DollarSign, MapPin, Package } from 'lucide-react';
import { formatWaitingTime, getUrgencyColor } from '../utils/timeUtils';

const RiderDetailPanel = ({ rider, onClose, onCollectCash }) => {
    const [activeTab, setActiveTab] = useState('current'); // current, completed, cash

    if (!rider) return null;

    const { name, phone, stats, pendingOrders = [], ongoingOrders = [], deliveredOrders = [] } = rider;
    const { pendingCount, activeCount, deliveredCount, cashInHand } = stats || {};

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in">
            {/* Slide-over Panel */}
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{name} - Live Report</h2>
                            <p className="text-sm text-slate-600">{phone}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <X size={24} className="text-slate-600" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'current'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            🚀 Current & Pending
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'completed'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            ✅ Completed
                        </button>
                        <button
                            onClick={() => setActiveTab('cash')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'cash'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            💰 Cash
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Tab 1: Current & Pending */}
                    {activeTab === 'current' && (
                        <div className="space-y-6">
                            {/* Pending Pickup Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={20} className="text-yellow-600" />
                                    <h3 className="font-bold text-slate-800">PENDING PICKUP ({pendingCount || 0})</h3>
                                </div>
                                {pendingOrders.length === 0 ? (
                                    <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">No pending pickups</p>
                                ) : (
                                    <div className="space-y-2">
                                        {pendingOrders.map((order, idx) => (
                                            <div key={idx} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-slate-800">#{order.orderId}</span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getUrgencyColor(order.waitingMinutes)}`}>
                                                        ⏱️ {formatWaitingTime(order.waitingMinutes)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Package size={14} />
                                                        <span>{order.shopName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        <span>{order.distance} km away</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ongoing Delivery Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Truck size={20} className="text-emerald-600" />
                                    <h3 className="font-bold text-slate-800">ONGOING DELIVERY ({activeCount || 0})</h3>
                                </div>
                                {ongoingOrders.length === 0 ? (
                                    <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">No ongoing deliveries</p>
                                ) : (
                                    <div className="space-y-2">
                                        {ongoingOrders.map((order, idx) => (
                                            <div key={idx} className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-slate-800">#{order.orderId}</span>
                                                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                                                        ETA: {order.eta} mins
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        <span>Out for delivery to {order.customerLocation}</span>
                                                    </div>
                                                    {order.codAmount > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign size={14} />
                                                            <span className="font-medium">₹{order.codAmount} COD</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Completed */}
                    {activeTab === 'completed' && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle size={20} className="text-slate-600" />
                                <h3 className="font-bold text-slate-800">DELIVERED TODAY ({deliveredCount || 0})</h3>
                            </div>
                            {deliveredOrders.length === 0 ? (
                                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">No deliveries completed today</p>
                            ) : (
                                <div className="space-y-2">
                                    {deliveredOrders.map((order, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-slate-800">#{order.orderId}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${order.timeTaken <= 30 ? 'bg-emerald-100 text-emerald-700' :
                                                    order.timeTaken <= 45 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {order.timeTaken} mins
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                Delivered at {order.deliveryTime}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Cash */}
                    {activeTab === 'cash' && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <DollarSign size={20} className="text-emerald-600" />
                                <h3 className="font-bold text-slate-800">CASH COLLECTION</h3>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
                                <p className="text-sm text-slate-600 mb-2">Total Cash with Rider</p>
                                <p className="text-4xl font-bold text-emerald-700">₹{cashInHand?.toLocaleString('en-IN') || 0}</p>
                                {cashInHand > 10000 && (
                                    <p className="text-sm text-red-600 mt-2 font-medium">⚠️ High amount - collect immediately</p>
                                )}
                            </div>

                            <button
                                onClick={() => onCollectCash(rider)}
                                disabled={!cashInHand || cashInHand === 0}
                                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <DollarSign size={20} />
                                Collect Cash & Reset
                            </button>

                            <p className="text-xs text-slate-500 mt-4 text-center">
                                This will reset the cash counter to ₹0 and create an audit log entry
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiderDetailPanel;
