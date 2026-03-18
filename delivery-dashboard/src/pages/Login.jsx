/**
 * Delivery Login - Professional Redesign
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Login() {
    const navigate = useNavigate();
    const { login, loading, error } = useAuthStore();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData);
        if (result.success) navigate('/');
    };

    return (
        <div className="split-screen">
            {/* Brand Section */}
            <div className="brand-section">
                <img src="/logo.png" alt="PrintVik Logo" style={{ height: '6rem', marginBottom: '2rem', objectFit: 'contain' }} />
                <h1>PrintVik Delivery</h1>
                <p>Empowering local print delivery. Join our network and start earning today.</p>
            </div>

            {/* Form Section */}
            <div className="form-section">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Welcome Back</h2>
                        <p className="text-secondary">Please sign in to your dashboard</p>
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
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
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
                                    Signing in...
                                </>
                            ) : 'Sign In to Dashboard'}
                        </button>

                        <div className="text-center">
                            <span className="text-secondary">New to PrintVik? </span>
                            <Link to="/register" className="link-highlight">Apply as Partner</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
