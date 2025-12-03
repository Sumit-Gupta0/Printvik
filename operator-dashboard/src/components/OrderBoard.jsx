import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import OrderCard from './OrderCard';
import OrderRow from './OrderRow';
import AssignedTable from './AssignedTable';

const OrderBoard = ({ orders, onDownload, onMarkReady, onComplete }) => {
    const [viewMode, setViewMode] = useState('ALL'); // 'ALL', 'ASSIGNED', 'QUEUE', 'READY'

    // Group orders by status
    const columns = {
        // Assigned to You: Only pending orders, LIFO (latest first)
        incoming: orders
            .filter(o => o.orderStatus === 'pending')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

        // In-Queue: Processing/Printing orders, max 10
        processing: orders
            .filter(o => o.orderStatus === 'processing' || o.orderStatus === 'printing')
            .slice(0, 10),

        // Ready for Pickup: Completed orders ready for handover
        ready: orders.filter(o => o.orderStatus === 'printed' || o.orderStatus === 'ready')
    };

    const tabs = [
        { id: 'ALL', label: 'All' },
        { id: 'ASSIGNED', label: 'Assigned', count: columns.incoming.length },
        { id: 'QUEUE', label: 'In-Queue', count: columns.processing.length },
        { id: 'READY', label: 'Ready', count: columns.ready.length }
    ];

    return (
        <div className="space-y-6">
            {/* Clean Tab Switcher - Segmented Control */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex gap-8 px-6">
                    {tabs.map(tab => {
                        const isActive = viewMode === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setViewMode(tab.id)}
                                className={`py-4 font-medium text-sm transition-colors relative ${isActive
                                    ? 'text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`ml-2 text-xs ${isActive ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                        ({tab.count})
                                    </span>
                                )}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Columns - Conditional Rendering */}
            <div className={`${viewMode === 'ALL' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'grid grid-cols-1'} transition-all duration-300`}>
                {/* Column 1: Assigned to You - Hybrid View */}
                {viewMode === 'ASSIGNED' ? (
                    // Table View for Focus Mode
                    <AssignedTable orders={columns.incoming} onMarkReady={onMarkReady} />
                ) : viewMode === 'ALL' ? (
                    // Card View for All View
                    <div className="flex flex-col bg-white rounded-xl shadow-lg border border-rose-200 overflow-hidden animate-fade-in">
                        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                <h2 className="text-sm font-semibold text-gray-900">Assigned to You</h2>
                                {columns.incoming.length > 0 && (
                                    <span className="text-xs text-gray-500">({columns.incoming.length})</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50/30">
                            {columns.incoming.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                    <div className="relative w-32 h-32 mb-4">
                                        <div className="absolute inset-0 border-4 border-rose-200 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-rose-500 rounded-full animate-ping"></div>
                                        <AlertCircle size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600">No pending orders</p>
                                    <p className="text-xs mt-1 text-gray-500">New orders will appear here when assigned</p>
                                </div>
                            ) : (
                                columns.incoming.map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        onDownload={onDownload}
                                        onMarkReady={onMarkReady}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Column 2: In-Queue */}
                {viewMode === 'QUEUE' ? (
                    // List View for Focus Mode
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">In-Queue Orders</h2>
                            <p className="text-sm text-gray-500 mt-1">Maximum 10 orders shown</p>
                        </div>
                        {columns.processing.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Clock size={48} className="mb-2 opacity-50" />
                                <p className="text-sm">No orders in queue</p>
                            </div>
                        ) : (
                            <div>
                                {/* Table Header */}
                                <div className="bg-gray-50 border-b border-gray-200 py-3 px-6 flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div className="flex-1">Customer & Order</div>
                                    <div className="flex-1">Specifications</div>
                                    <div className="w-48">Instructions</div>
                                    <div className="w-32 text-right">Actions</div>
                                </div>
                                {/* Order Rows */}
                                {columns.processing.map(order => (
                                    <OrderRow
                                        key={order._id}
                                        order={order}
                                        onMarkReady={onMarkReady}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : viewMode === 'ALL' ? (
                    <div className="flex flex-col bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden animate-fade-in">
                        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <h2 className="text-sm font-semibold text-gray-900">In-Queue</h2>
                                {columns.processing.length > 0 && (
                                    <span className="text-xs text-gray-500">({columns.processing.length})</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50/30">
                            {columns.processing.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                    <Clock size={48} className="mb-2 opacity-50" />
                                    <p className="text-sm">No orders in queue</p>
                                </div>
                            ) : (
                                columns.processing.map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        onDownload={onDownload}
                                        onMarkReady={onMarkReady}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Column 3: Ready for Pickup */}
                {viewMode === 'READY' ? (
                    // List View for Focus Mode
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Ready for Pickup</h2>
                            <p className="text-sm text-gray-500 mt-1">Awaiting customer collection</p>
                        </div>
                        {columns.ready.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <CheckCircle size={48} className="mb-2 opacity-50" />
                                <p className="text-sm">No orders ready</p>
                            </div>
                        ) : (
                            <div>
                                {columns.ready.map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        onComplete={onComplete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : viewMode === 'ALL' ? (
                    <div className="flex flex-col bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden animate-fade-in">
                        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-sm font-semibold text-gray-900">Ready for Pickup</h2>
                                {columns.ready.length > 0 && (
                                    <span className="text-xs text-gray-500">({columns.ready.length})</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50/30">
                            {columns.ready.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                    <CheckCircle size={48} className="mb-2 opacity-50" />
                                    <p className="text-sm">No orders ready</p>
                                </div>
                            ) : (
                                columns.ready.map(order => (
                                    <OrderCard
                                        key={order._id}
                                        order={order}
                                        onComplete={onComplete}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default OrderBoard;
