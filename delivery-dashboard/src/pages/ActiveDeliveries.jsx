/**
 * Active Deliveries Page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ActiveDeliveries() {
    const { user, logout } = useAuthStore();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/delivery/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data.data.deliveries);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-lg) 0' }}>
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0 }}>Active Deliveries</h2>
                    <div className="flex gap-md items-center">
                        <span className="text-sm text-secondary">Hi, {user?.name}</span>
                        <Link to="/profile" className="btn btn-secondary">Profile</Link>
                        <button onClick={logout} className="btn btn-outline">Logout</button>
                    </div>
                </div>
            </header>

            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <h1>My Deliveries</h1>
                <p className="text-secondary mb-xl">Manage your assigned deliveries</p>

                {loading ? (
                    <div className="flex justify-center" style={{ padding: 'var(--spacing-2xl)' }}><div className="spinner"></div></div>
                ) : deliveries.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}><p className="text-secondary">No active deliveries</p></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {deliveries.map((delivery) => (
                            <Link key={delivery._id} to={`/deliveries/${delivery._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card" style={{ cursor: 'pointer' }}>
                                    <div className="flex justify-between items-start">
                                        <div style={{ flex: 1 }}>
                                            <div className="flex items-center gap-md mb-sm">
                                                <span style={{ fontWeight: 600 }}>{delivery.orderNumber}</span>
                                                <span className="text-xs" style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#DBEAFE', color: '#1E40AF' }}>{delivery.deliveryStatus}</span>
                                            </div>
                                            <p className="text-sm text-secondary mb-sm">Customer: {delivery.userId?.name}</p>
                                            <p className="text-sm">{delivery.deliveryAddress?.city}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>₹{delivery.totalAmount}</p>
                                            {delivery.paymentMethod === 'cod' && <p className="text-xs text-secondary">COD</p>}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActiveDeliveries;
