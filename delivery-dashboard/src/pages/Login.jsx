/**
 * Delivery Login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card">
                <h1 className="text-center">Delivery Partner</h1>
                <p className="text-secondary text-center mb-lg">Login to manage deliveries</p>
                {error && <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                        <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <input type="password" className="input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
