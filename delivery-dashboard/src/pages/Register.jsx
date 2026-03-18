/**
 * Delivery Registration - Professional Redesign
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Register() {
    const navigate = useNavigate();
    const { register, loading, error } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'bike',
        role: 'delivery'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(formData);
        if (result.success) navigate('/');
    };

    return (
        <div className="split-screen">
            {/* Brand Section */}
            <div className="brand-section">
                <img src="/logo.png" alt="PrintVik Logo" style={{ height: '6rem', marginBottom: '2rem', objectFit: 'contain' }} />
                <h1>Join the Fleet</h1>
                <p>Become a PrintVik delivery partner. Flexible hours, reliable earnings.</p>
            </div>

            {/* Form Section */}
            <div className="form-section">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Partner Application</h2>
                        <p className="text-secondary">Create your account to get started</p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#FEF2F2',
                            color: '#991B1B',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            border: '1px solid #FECACA'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="input"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Vehicle Type</label>
                            <select
                                className="input"
                                value={formData.vehicleType}
                                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                            >
                                <option value="bike">Motorcycle / Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="car">Car</option>
                                <option value="van">Delivery Van</option>
                            </select>
                            <p className="text-xs text-secondary mt-sm">Select the vehicle you'll verify with.</p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '1.5rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: 'white', marginRight: '0.5rem' }}></div>
                                    Submitting Application...
                                </>
                            ) : 'Create Account'}
                        </button>

                        <div className="text-center">
                            <span className="text-secondary">Already a partner? </span>
                            <Link to="/login" className="link-highlight">Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
