import React from 'react';
import { Package, Clock } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { formatWaitingTime } from '../utils/timeUtils';

const DraggableOrderCard = ({ order }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'ORDER',
        item: { orderId: order._id, orderNumber: order.orderNumber },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const isUrgent = order.waitingMinutes > 30;

    return (
        <div
            ref={drag}
            className={`p-3 bg-white rounded-lg cursor-move transition-all ${isUrgent ? 'border-2 border-red-500 animate-pulse' : 'border border-slate-200'
                } ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-sm">#{order.orderId}</span>
                <span
                    className={`text-xs font-medium px-2 py-1 rounded ${order.waitingMinutes > 1440
                            ? 'bg-red-100 text-red-700'
                            : order.waitingMinutes > 120
                                ? 'bg-orange-100 text-orange-700'
                                : order.waitingMinutes > 30
                                    ? 'bg-red-100 text-red-700'
                                    : order.waitingMinutes > 10
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-emerald-100 text-emerald-700'
                        }`}
                >
                    ⏱️ {formatWaitingTime(order.waitingMinutes)}
                </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1">
                    <Package size={12} />
                    <span className="font-medium">{order.shopName || 'Unknown Shop'}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                    Drop: {order.customerCity} • {order.dropDistance} km
                </div>
            </div>
        </div>
    );
};

const OrdersPanel = ({ hotOrders, loading }) => {
    return (
        <div className="w-1/5 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Package size={20} className="text-red-600" />
                    🔥 Hot Orders ({hotOrders.length})
                </h2>
                <p className="text-xs text-slate-600 mt-1">Drag to assign to rider</p>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-slate-500">Loading orders...</p>
                        </div>
                    </div>
                ) : hotOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-400">
                            <Package size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No pending orders</p>
                        </div>
                    </div>
                ) : (
                    hotOrders.map((order) => (
                        <DraggableOrderCard key={order._id} order={order} />
                    ))
                )}
            </div>
        </div>
    );
};

export default OrdersPanel;
