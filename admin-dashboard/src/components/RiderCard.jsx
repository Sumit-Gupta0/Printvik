import React from 'react';
import { User, Battery, Clock, Package, Truck, CheckCircle, DollarSign } from 'lucide-react';

const RiderCard = ({ rider, onClick, isSelected }) => {
    const { name, isOnline, battery, stats, phone } = rider;
    const { pendingCount, activeCount, deliveredCount, cashInHand } = stats || {};

    // Determine rider status color
    const getStatusColor = () => {
        if (!isOnline) return 'bg-red-500';
        if (activeCount >= 3) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getStatusText = () => {
        if (!isOnline) return 'Offline';
        if (activeCount >= 3) return 'Busy';
        return 'Online';
    };

    const getBatteryColor = () => {
        if (battery >= 60) return 'text-emerald-600';
        if (battery >= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div
            onClick={() => isOnline && onClick(rider)}
            className={`
                relative bg-white rounded-2xl border-2 shadow-sm transition-all cursor-pointer
                hover:shadow-lg hover:scale-[1.02]
                ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'}
                ${!isOnline ? 'opacity-60 cursor-not-allowed' : ''}
            `}
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">{name}</h3>
                            <p className="text-xs text-slate-500">{phone}</p>
                        </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                        {getStatusText()}
                    </span>
                    <div className={`flex items-center gap-1 ${getBatteryColor()}`}>
                        <Battery size={14} />
                        <span className="font-medium">{battery || 0}%</span>
                    </div>
                </div>
            </div>

            {/* 3 Buckets */}
            <div className="p-3 space-y-2">
                {/* Pending Pickup - Yellow */}
                <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">Pending</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-700">{pendingCount || 0}</span>
                </div>

                {/* Ongoing - Green */}
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Truck size={16} className="text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Ongoing</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{activeCount || 0}</span>
                </div>

                {/* Delivered Today - Grey */}
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">Today</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{deliveredCount || 0}</span>
                </div>
            </div>

            {/* Footer - Cash */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <DollarSign size={14} />
                        <span className="text-xs font-medium">Cash</span>
                    </div>
                    <span className={`text-sm font-bold ${cashInHand > 10000 ? 'text-red-600' : 'text-slate-700'}`}>
                        ₹{cashInHand?.toLocaleString('en-IN') || 0}
                    </span>
                </div>
                {cashInHand > 10000 && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">⚠️ High cash - collect soon</p>
                )}
            </div>
        </div>
    );
};

export default RiderCard;
