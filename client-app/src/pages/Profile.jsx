/**
 * Profile Page
 * User profile and address management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { userAPI } from '../services/api';

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);

    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await userAPI.getAddresses();
            setAddresses(response.data.addresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm({
            ...addressForm,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await userAPI.addAddress(addressForm);
            setShowAddressForm(false);
            setAddressForm({
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false,
            });
            fetchAddresses();
        } catch (error) {
            console.error('Error adding address:', error);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await userAPI.deleteAddress(id);
                fetchAddresses();
            } catch (error) {
                console.error('Error deleting address:', error);
            }
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary mb-lg">
                ← Back to Home
            </button>

            {/* User Info */}
            <div className="card mb-lg">
                <h2>Profile Information</h2>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Name</span>
                        <span style={{ fontWeight: 500 }}>{user?.name}</span>
                    </div>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Email</span>
                        <span style={{ fontWeight: 500 }}>{user?.email}</span>
                    </div>
                    <div className="flex justify-between mb-sm">
                        <span className="text-secondary">Phone</span>
                        <span style={{ fontWeight: 500 }}>{user?.phone}</span>
                    </div>
                    {user?.referralCode && (
                        <div className="flex justify-between">
                            <span className="text-secondary">Referral Code</span>
                            <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{user.referralCode}</span>
                        </div>
                    )}
                </div>
                <button onClick={logout} className="btn btn-outline mt-lg" style={{ width: '100%' }}>
                    Logout
                </button>
            </div>

            {/* Addresses */}
            <div className="card">
                <div className="flex justify-between items-center mb-lg">
                    <h2 style={{ margin: 0 }}>Saved Addresses</h2>
                    <button
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="btn btn-primary"
                    >
                        {showAddressForm ? 'Cancel' : '+ Add Address'}
                    </button>
                </div>

                {showAddressForm && (
                    <form onSubmit={handleAddressSubmit} className="mb-lg" style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={addressForm.name}
                                    onChange={handleAddressChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleAddressChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Address Line 1
                            </label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={addressForm.addressLine1}
                                onChange={handleAddressChange}
                                className="input"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                name="addressLine2"
                                value={addressForm.addressLine2}
                                onChange={handleAddressChange}
                                className="input"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={addressForm.pincode}
                                    onChange={handleAddressChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressChange}
                                />
                                <span className="text-sm">Set as default address</span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Save Address
                        </button>
                    </form>
                )}

                {loading ? (
                    <div className="flex justify-center" style={{ padding: 'var(--spacing-xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : addresses.length === 0 ? (
                    <p className="text-secondary text-center" style={{ padding: 'var(--spacing-xl)' }}>
                        No saved addresses. Add one to get started!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                            {address.name}
                                            {address.isDefault && (
                                                <span
                                                    className="text-xs"
                                                    style={{
                                                        marginLeft: 'var(--spacing-sm)',
                                                        padding: '0.125rem 0.5rem',
                                                        backgroundColor: '#DBEAFE',
                                                        color: '#1E40AF',
                                                        borderRadius: 'var(--radius-sm)',
                                                    }}
                                                >
                                                    Default
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            {address.phone}
                                        </p>
                                        <p className="text-sm">
                                            {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAddress(address._id)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
