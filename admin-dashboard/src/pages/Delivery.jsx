import { useState, useEffect } from 'react';
import { RefreshCw, Package, Box, UserCheck, Truck } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '../services/api';
import OrdersPanel from '../components/OrdersPanel';
import MapPanel from '../components/MapPanel';
import RidersPanel from '../components/RidersPanel';

const Delivery = () => {
    const [riders, setRiders] = useState([]);
    const [hotOrders, setHotOrders] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dispatch'); // dispatch | warehouse
    const [warehouseTab, setWarehouseTab] = useState('needs_packing'); // needs_packing | ready_dispatch
    const [warehouseOrders, setWarehouseOrders] = useState([]);
    const [loadingWarehouse, setLoadingWarehouse] = useState(false);

    useEffect(() => {
        fetchFleetStatus();
        if (activeTab === 'warehouse') {
            fetchWarehouseOrders();
        }
    }, [activeTab, warehouseTab]);

    const fetchFleetStatus = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/riders/fleet-status');
            console.log('Fleet Status Response:', response);

            const ridersData = response.data?.riders || [];
            const hotOrdersData = response.data?.hotOrders || [];

            setRiders(ridersData);
            setHotOrders(hotOrdersData);

            // Extract unique shops from hot orders
            const uniqueShops = [];
            const shopMap = new Map();

            hotOrdersData.forEach(order => {
                const shopId = order.shopId || order.shopName;
                if (shopId && !shopMap.has(shopId)) {
                    shopMap.set(shopId, {
                        id: shopId,
                        name: order.shopName || 'Unknown Shop',
                        lat: order.shopLat || null,
                        lng: order.shopLng || null,
                        pendingOrders: 1
                    });
                } else if (shopId) {
                    const shop = shopMap.get(shopId);
                    shop.pendingOrders++;
                }
            });

            setShops(Array.from(shopMap.values()));
        } catch (error) {
            console.error('Error fetching fleet status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignOrder = async (orderId, riderId) => {
        try {
            console.log('Assigning order:', orderId, 'to rider:', riderId);

            await api.post('/admin/assign-delivery', {
                orderId,
                riderId
            });

            // Show success message
            alert('Order assigned successfully!');

            // Refresh data
            fetchFleetStatus();
        } catch (error) {
            console.error('Error assigning order:', error);
            alert('Failed to assign order: ' + (error.message || 'Unknown error'));
        }
    };

    const fetchWarehouseOrders = async () => {
        setLoadingWarehouse(true);
        try {
            const status = warehouseTab === 'needs_packing' ? 'new,confirmed' : 'packed';
            const response = await api.get(`/admin/orders?type=store&status=${status}`);
            setWarehouseOrders(response.data.data || []);
        } catch (error) {
            console.error('Error fetching warehouse orders:', error);
        } finally {
            setLoadingWarehouse(false);
        }
    };

    const handleMarkAsPacked = async (orderId) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: 'packed' });
            fetchWarehouseOrders();
            alert('Order marked as packed!');
        } catch (error) {
            console.error('Error marking order as packed:', error);
            alert('Failed to update order status');
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-[calc(100vh-100px)] flex flex-col">
                {/* Header with Tabs */}
                <div className="shrink-0 bg-white border-b border-slate-200">
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-outfit">
                                🚀 War Room - Dispatch Center
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                {activeTab === 'dispatch' ? 'Drag orders to riders • Live map tracking • Real-time updates' : 'Warehouse packing & handover operations'}
                            </p>
                        </div>
                        <button
                            onClick={activeTab === 'dispatch' ? fetchFleetStatus : fetchWarehouseOrders}
                            disabled={loading || loadingWarehouse}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={(loading || loadingWarehouse) ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-t border-slate-100 px-4">
                        <button
                            onClick={() => setActiveTab('dispatch')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dispatch' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Truck size={18} />
                            Dispatch Center
                        </button>
                        <button
                            onClick={() => setActiveTab('warehouse')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'warehouse' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Package size={18} />
                            Packing & Handover
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'dispatch' ? (
                    <div className="flex-1 flex overflow-hidden">
                        <OrdersPanel hotOrders={hotOrders} loading={loading} />
                        <MapPanel shops={shops} riders={riders} />
                        <RidersPanel riders={riders} onAssignOrder={handleAssignOrder} loading={loading} />
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-6 bg-slate-50">
                        {/* Warehouse Sub-tabs */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800 font-outfit">Warehouse Operations</h3>
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setWarehouseTab('needs_packing')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${warehouseTab === 'needs_packing' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Box size={16} />
                                            Needs Packing
                                            {warehouseOrders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'confirmed').length > 0 && (
                                                <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                    {warehouseOrders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'confirmed').length}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setWarehouseTab('ready_dispatch')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${warehouseTab === 'ready_dispatch' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserCheck size={16} />
                                            Ready for Dispatch
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Warehouse Orders Table */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                {loadingWarehouse ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    </div>
                                ) : warehouseOrders.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Order ID</th>
                                                <th className="px-4 py-3">Items</th>
                                                <th className="px-4 py-3">Bin Location</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3">Amount</th>
                                                <th className="px-4 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {warehouseOrders.map(order => (
                                                <tr key={order._id} className="hover:bg-white transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-700">{order.orderNumber}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <div className="flex flex-col">
                                                            {order.items?.slice(0, 2).map((item, idx) => (
                                                                <span key={idx} className="text-xs">
                                                                    {item.productId?.name || 'Product'} x{item.quantity}
                                                                </span>
                                                            ))}
                                                            {order.items?.length > 2 && (
                                                                <span className="text-xs text-slate-400">+{order.items.length - 2} more</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                                                            {order.items?.[0]?.productId?.inventory?.locationInWarehouse || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{order.userId?.name || 'Guest'}</span>
                                                            <span className="text-xs text-slate-400">{order.deliveryAddress?.city}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 font-semibold">₹{order.totalAmount}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {warehouseTab === 'needs_packing' ? (
                                                            <button
                                                                onClick={() => handleMarkAsPacked(order._id)}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                Mark as Packed
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAssignOrder(order._id, null)}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                                            >
                                                                Assign Rider
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-slate-400">
                                        <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                        <p className="font-medium">No orders {warehouseTab === 'needs_packing' ? 'need packing' : 'ready for dispatch'}</p>
                                        <p className="text-xs mt-1">Orders will appear here when they're ready</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default Delivery;
