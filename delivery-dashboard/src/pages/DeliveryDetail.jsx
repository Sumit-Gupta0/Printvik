/**
 * Delivery Detail Page
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function DeliveryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDelivery();
    }, [id]);

    const fetchDelivery = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDelivery(response.data.data.order);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/delivery/${id}/status`, { deliveryStatus: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDelivery();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) return <div className="container flex justify-center" style={{ marginTop: 'var(--spacing-2xl)' }}><div className="spinner"></div></div>;
    if (!delivery) return <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}><div className="card text-center"><p>Delivery not found</p></div></div>;

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary mb-lg">← Back</button>

            <div className="card mb-lg">
                <h2>Delivery {delivery.orderNumber}</h2>
                <p className="text-sm text-secondary">Customer: {delivery.userId?.name} • {delivery.userId?.phone}</p>

                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <h3>Delivery Address</h3>
                    <p className="text-sm">{delivery.deliveryAddress?.addressLine1}, {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.state} - {delivery.deliveryAddress?.pincode}</p>
                </div>
            </div>

            <div className="card">
                <h3>Update Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                    <button onClick={() => updateStatus('picked-up')} className="btn btn-primary">Mark Picked Up</button>
                    <button onClick={() => updateStatus('in-transit')} className="btn btn-primary">In Transit</button>
                    <button onClick={() => updateStatus('delivered')} className="btn btn-primary">Mark Delivered</button>
                </div>
            </div>
        </div>
    );
}

export default DeliveryDetail;
