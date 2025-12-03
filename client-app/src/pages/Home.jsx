/**
 * Home Page
 * Dashboard for customers
 */

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { orderAPI } from '../services/api';

function Home() {
    const { user, logout } = useAuthStore();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentOrders();
    }, []);

    const fetchRecentOrders = async () => {
        try {
            const response = await orderAPI.getAll({ page: 1, limit: 3 });
            setRecentOrders(response.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <header style={{
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                padding: 'var(--spacing-lg) 0'
            }}>
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0 }}>Printvik</h2>
                    <div className="flex gap-md items-center">
                        <span className="text-sm text-secondary">Hi, {user?.name}</span>
                        <Link to="/profile" className="btn btn-secondary">Profile</Link>
                        <button onClick={logout} className="btn btn-outline">Logout</button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                {/* Welcome Section */}
                <div className="text-center mb-xl">
                    <h1>Welcome to Printvik</h1>
                    <p className="text-secondary">Your one-stop solution for all printing needs</p>
                    <Link to="/new-order" className="btn btn-primary mt-lg" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                        📄 Create New Order
                    </Link>
                </div>

                {/* Recent Orders */}
                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                    <div className="flex justify-between items-center mb-lg">
                        <h3>Recent Orders</h3>
                        <Link to="/history" className="text-sm" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center" style={{ padding: 'var(--spacing-2xl)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                            <p className="text-secondary">No orders yet. Create your first order!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                            {recentOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    to={`/orders/${order._id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="card" style={{ cursor: 'pointer' }}>
                                        <div className="flex justify-between items-center mb-sm">
                                            <span className="text-sm" style={{ fontWeight: 600 }}>
                                                {order.orderNumber}
                                            </span>
                                            <span
                                                className="text-xs"
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    backgroundColor: order.orderStatus === 'delivered' ? '#D1FAE5' : '#DBEAFE',
                                                    color: order.orderStatus === 'delivered' ? '#065F46' : '#1E40AF'
                                                }}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-secondary mb-sm">
                                            {order.specifications.colorType === 'color' ? 'Color' : 'B&W'} • {order.specifications.pages} pages • {order.specifications.copies} copies
                                        </p>
                                        <p className="text-sm" style={{ fontWeight: 500 }}>
                                            ₹{order.totalAmount}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
                    <h3 className="mb-lg">Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                        <Link to="/new-order" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📄</div>
                            <h4 style={{ margin: 0 }}>New Order</h4>
                            <p className="text-sm text-secondary">Upload and print</p>
                        </Link>
                        <Link to="/history" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📋</div>
                            <h4 style={{ margin: 0 }}>Order History</h4>
                            <p className="text-sm text-secondary">View past orders</p>
                        </Link>
                        <Link to="/profile" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>👤</div>
                            <h4 style={{ margin: 0 }}>Profile</h4>
                            <p className="text-sm text-secondary">Manage account</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
