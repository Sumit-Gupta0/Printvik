/**
 * Order History Page
 * View all past orders
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await orderAPI.getAll(params);
            setOrders(response.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <div className="flex justify-between items-center mb-xl">
                <h1>Order History</h1>
                <Link to="/" className="btn btn-secondary">← Back to Home</Link>
            </div>

            {/* Filter */}
            <div className="flex gap-sm mb-lg" style={{ flexWrap: 'wrap' }}>
                {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={filter === status ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <div className="spinner"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <p className="text-secondary">No orders found</p>
                    <Link to="/new-order" className="btn btn-primary mt-md">
                        Create New Order
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            to={`/orders/${order._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="card" style={{ cursor: 'pointer' }}>
                                <div className="flex justify-between items-start">
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center gap-md mb-sm">
                                            <span style={{ fontWeight: 600 }}>{order.orderNumber}</span>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    backgroundColor: order.orderStatus === 'delivered' ? '#D1FAE5' : '#DBEAFE',
                                                    color: order.orderStatus === 'delivered' ? '#065F46' : '#1E40AF',
                                                }}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-secondary mb-sm">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-sm">
                                            {order.specifications.colorType === 'color' ? 'Color' : 'B&W'} • {' '}
                                            {order.specifications.pages} pages • {order.specifications.copies} copies
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                                            ₹{order.totalAmount}
                                        </p>
                                        <p className="text-xs text-secondary" style={{ margin: 0 }}>
                                            {order.paymentMethod === 'online' ? 'Paid Online' : 'COD'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;
