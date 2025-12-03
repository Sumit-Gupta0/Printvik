import { Clock, AlertCircle, Printer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import PrintLabel from './PrintLabel';

const AssignedTable = ({ orders, onMarkReady }) => {
    const [showPrintLabel, setShowPrintLabel] = useState(null);

    const getUrgencyColor = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        if (diffMinutes > 30) return 'text-red-600 font-bold';
        if (diffMinutes > 15) return 'text-orange-600 font-semibold';
        return 'text-green-600';
    };

    const getUrgencyIcon = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        if (diffMinutes > 30) return '🔴';
        if (diffMinutes > 15) return '🟠';
        return '🟢';
    };

    const isUrgent = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        return diffMinutes > 30;
    };

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="relative w-32 h-32 mb-4">
                    <div className="absolute inset-0 border-4 border-rose-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-rose-500 rounded-full animate-ping"></div>
                    <AlertCircle size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-600">No pending orders</p>
                <p className="text-sm mt-1 text-gray-500">New orders will appear here when assigned</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Assigned Orders</h2>
                        <p className="text-rose-100 text-sm mt-1">Sorted by urgency - oldest first</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black">{orders.length}</div>
                        <div className="text-xs text-rose-100">Pending</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Urgency
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Order Details
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Specifications
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Volume
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className={`hover:bg-gray-50 transition-colors ${isUrgent(order.createdAt) ? 'bg-red-50' : ''
                                    }`}
                            >
                                {/* Urgency */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{getUrgencyIcon(order.createdAt)}</span>
                                        <div>
                                            <div className={`text-sm font-semibold ${getUrgencyColor(order.createdAt)}`}>
                                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                            </div>
                                            {isUrgent(order.createdAt) && (
                                                <div className="text-xs text-red-600 font-bold animate-pulse">URGENT!</div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Order Details */}
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 text-sm">{order.orderNumber}</div>
                                    <div className="text-sm text-gray-600 mt-0.5">{order.userId?.name || 'Guest User'}</div>
                                </td>

                                {/* Specifications */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {/* Color Mode */}
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${order.specifications?.colorType === 'color'
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                            : 'bg-slate-800 text-white'
                                            }`}>
                                            {order.specifications?.colorType === 'color' ? 'COLOR' : 'B&W'}
                                        </span>

                                        {/* Paper Size */}
                                        {order.specifications?.paperSize && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                                                {order.specifications.paperSize}
                                            </span>
                                        )}

                                        {/* Binding */}
                                        {order.specifications?.binding && order.specifications.binding !== 'none' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase bg-indigo-600 text-white">
                                                {order.specifications.binding}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Volume */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">
                                        {(order.specifications?.pages || 0) * (order.specifications?.copies || 1)} pages
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {order.specifications?.pages || 0} × {order.specifications?.copies || 1}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setShowPrintLabel(order)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Print Label"
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button
                                            onClick={() => onMarkReady(order._id)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            ▶ Start Job
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Print Label Modal */}
            {showPrintLabel && (
                <PrintLabel
                    order={showPrintLabel}
                    isOpen={true}
                    onClose={() => setShowPrintLabel(null)}
                />
            )}
        </div>
    );
};

export default AssignedTable;
