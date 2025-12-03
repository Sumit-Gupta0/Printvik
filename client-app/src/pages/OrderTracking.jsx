/**
 * Order Tracking Page
 * View order details and track status
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

function OrderTracking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await orderAPI.getById(id);
            setOrder(response.data.order);
        } catch (err) {
            setError(err.message || 'Error fetching order');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#F59E0B',
            processing: '#3B82F6',
            printing: '#8B5CF6',
            printed: '#10B981',
            'quality-check': '#06B6D4',
            ready: '#10B981',
            'assigned-for-delivery': '#3B82F6',
            'picked-up': '#8B5CF6',
            'in-transit': '#F59E0B',
            delivered: '#10B981',
            cancelled: '#EF4444',
        };
        return colors[status] || '#6B7280';
    };

    if (loading) {
        return (
            <div className="container flex justify-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="card text-center">
                    <p className="text-secondary">{error || 'Order not found'}</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary mt-md">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary mb-lg">
                ← Back to Home
            </button>

            <div className="card mb-lg">
                <div className="flex justify-between items-center mb-lg">
                    <div>
                        <h2 style={{ margin: 0 }}>Order {order.orderNumber}</h2>
                        <p className="text-sm text-secondary">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: `${getStatusColor(order.orderStatus)}20`,
                            color: getStatusColor(order.orderStatus),
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {order.orderStatus.replace('-', ' ').toUpperCase()}
                    </span>
                </div>

                {/* Order Timeline */}
                <div style={{ marginTop: 'var(--spacing-xl)' }}>
                    <h3>Order Status</h3>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        {['pending', 'processing', 'printing', 'printed', 'ready', 'delivered'].map((status, index) => {
                            const isCompleted = ['pending', 'processing', 'printing', 'printed', 'ready', 'delivered'].indexOf(order.orderStatus) >= index;
                            const isCurrent = order.orderStatus === status;

                            return (
                                <div key={status} className="flex gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '50%',
                                                backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--color-border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {isCompleted ? '✓' : index + 1}
                                        </div>
                                        {index < 5 && (
                                            <div
                                                style={{
                                                    width: '2px',
                                                    height: '2rem',
                                                    backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--color-border)',
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                                        <p style={{ margin: 0, fontWeight: isCurrent ? 600 : 400 }}>
                                            {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                        </p>
                                        {isCurrent && (
                                            <p className="text-xs text-secondary" style={{ margin: 0 }}>Current status</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Order Details */}
            <div className="card mb-lg">
                <h3>Order Details</h3>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Print Type</span>
                        <span style={{ fontWeight: 500 }}>
                            {order.specifications.colorType === 'color' ? 'Color' : 'Black & White'}
                        </span>
                    </div>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Paper Size</span>
                        <span style={{ fontWeight: 500 }}>{order.specifications.paperSize}</span>
                    </div>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Pages</span>
                        <span style={{ fontWeight: 500 }}>{order.specifications.pages}</span>
                    </div>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Copies</span>
                        <span style={{ fontWeight: 500 }}>{order.specifications.copies}</span>
                    </div>
                    {order.specifications.binding && order.specifications.binding !== 'none' && (
                        <div className="flex justify-between mb-sm">
                            <span className="text-secondary">Binding</span>
                            <span style={{ fontWeight: 500 }}>{order.specifications.binding}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Delivery Option</span>
                        <span style={{ fontWeight: 500 }}>
                            {order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Pickup'}
                        </span>
                    </div>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Payment Method</span>
                        <span style={{ fontWeight: 500 }}>
                            {order.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="card" style={{ backgroundColor: 'var(--color-surface)' }}>
                <h3>Payment Summary</h3>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Subtotal</span>
                        <span>₹{order.totalAmount - (order.deliveryCharge || 0)}</span>
                    </div>
                    {order.deliveryCharge > 0 && (
                        <div className="flex justify-between mb-sm">
                            <span className="text-secondary">Delivery Charge</span>
                            <span>₹{order.deliveryCharge}</span>
                        </div>
                    )}
                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-sm)', paddingTop: 'var(--spacing-sm)' }}>
                        <div className="flex justify-between">
                            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                ₹{order.totalAmount}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderTracking;
