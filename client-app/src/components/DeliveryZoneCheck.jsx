/**
 * Delivery Zone Check Component
 * Check if delivery is available for entered pincode/address
 */

import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function DeliveryZoneCheck({ onZoneCheck }) {
    const [pincode, setPincode] = useState('');
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);

    const checkDeliveryZone = async () => {
        if (!pincode || pincode.length !== 6) {
            setResult({ available: false, message: 'Please enter valid 6-digit pincode' });
            return;
        }

        setChecking(true);
        try {
            const response = await axios.get(`${API_URL}/delivery-zones/check/${pincode}`);
            const data = response.data.data;

            setResult({
                available: data.deliveryAvailable,
                message: data.deliveryAvailable
                    ? `✅ Delivery available! Charge: ₹${data.deliveryCharge}`
                    : '⚠️ Delivery not available. Pickup only.',
                deliveryCharge: data.deliveryCharge || 0,
                estimatedTime: data.estimatedDeliveryTime || null
            });

            if (onZoneCheck) {
                onZoneCheck(data);
            }
        } catch (error) {
            setResult({
                available: false,
                message: '⚠️ Delivery not available in this area. Pickup only.',
                deliveryCharge: 0
            });

            if (onZoneCheck) {
                onZoneCheck({ deliveryAvailable: false, deliveryCharge: 0 });
            }
        } finally {
            setChecking(false);
        }
    };

    return (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                Check Delivery Availability
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input"
                    style={{ flex: 1 }}
                />
                <button
                    type="button"
                    onClick={checkDeliveryZone}
                    className="btn btn-secondary"
                    disabled={checking || pincode.length !== 6}
                >
                    {checking ? 'Checking...' : 'Check'}
                </button>
            </div>

            {result && (
                <div
                    style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: result.available ? '#D1FAE5' : '#FEF3C7',
                        color: result.available ? '#065F46' : '#92400E',
                        fontSize: '0.875rem',
                    }}
                >
                    {result.message}
                    {result.estimatedTime && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                            Estimated delivery: {result.estimatedTime}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DeliveryZoneCheck;
