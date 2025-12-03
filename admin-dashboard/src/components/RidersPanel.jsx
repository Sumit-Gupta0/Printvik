import React from 'react';
import { useDrop } from 'react-dnd';
import { User, Battery, Package, Truck, CheckCircle } from 'lucide-react';

const DroppableRiderCard = ({ rider, onAssignOrder }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'ORDER',
        drop: (item) => {
            onAssignOrder(item.orderId, rider.riderId);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    const { name, isOnline, battery, stats } = rider;
    const { pendingCount, activeCount, deliveredCount, cashInHand } = stats || {};

    const getStatusColor = () => {
        if (!isOnline) return 'bg-red-500';
        if (activeCount >= 3) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getBatteryColor = () => {
        if (battery >= 60) return 'text-emerald-600';
        if (battery >= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div
            ref={drop}
            className={`p-3 bg-white rounded-lg border-2 transition-all ${isOver && canDrop
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 scale-105'
                    : canDrop
                        ? 'border-slate-200 hover:border-indigo-300'
                        : 'border-slate-200'
                } ${!isOnline ? 'opacity-60' : ''}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-xs">{name}</h3>
                        <div className="flex items-center gap-1 text-[10px]">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                            <span className={isOnline ? 'text-emerald-600' : 'text-red-600'}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center gap-1 text-xs ${getBatteryColor()}`}>
                    <Battery size={12} />
                    <span>{battery || 0}%</span>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs p-1.5 bg-yellow-50 rounded">
                    <div className="flex items-center gap-1 text-yellow-700">
                        <Package size={12} />
                        <span>Pending</span>
                    </div>
                    <span className="font-bold text-yellow-700">{pendingCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs p-1.5 bg-emerald-50 rounded">
                    <div className="flex items-center gap-1 text-emerald-700">
                        <Truck size={12} />
                        <span>Ongoing</span>
                    </div>
                    <span className="font-bold text-emerald-700">{activeCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded">
                    <div className="flex items-center gap-1 text-slate-600">
                        <CheckCircle size={12} />
                        <span>Today</span>
                    </div>
                    <span className="font-bold text-slate-700">{deliveredCount || 0}</span>
                </div>
            </div>

            {/* Drop Zone Indicator */}
            {isOver && canDrop && (
                <div className="mt-2 text-center text-xs font-medium text-indigo-600 animate-pulse">
                    Drop to assign
                </div>
            )}
        </div>
    );
};

const RidersPanel = ({ riders, onAssignOrder, loading }) => {
    return (
        <div className="w-1/5 bg-slate-50 border-l border-slate-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <User size={20} className="text-emerald-600" />
                    🛵 Riders ({riders.length})
                </h2>
                <p className="text-xs text-slate-600 mt-1">Drop orders here to assign</p>
            </div>

            {/* Riders List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-slate-500">Loading riders...</p>
                        </div>
                    </div>
                ) : riders.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-400">
                            <User size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No riders available</p>
                        </div>
                    </div>
                ) : (
                    riders.map((rider) => (
                        <DroppableRiderCard
                            key={rider.riderId}
                            rider={rider}
                            onAssignOrder={onAssignOrder}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default RidersPanel;
