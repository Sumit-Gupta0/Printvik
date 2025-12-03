/**
 * Delivery Profile
 */

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary mb-lg">← Back</button>
            <div className="card">
                <h2>Profile</h2>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="flex justify-between mb-sm"><span className="text-secondary">Name</span><span style={{ fontWeight: 500 }}>{user?.name}</span></div>
                    <div className="flex justify-between mb-sm"><span className="text-secondary">Email</span><span style={{ fontWeight: 500 }}>{user?.email}</span></div>
                    <div className="flex justify-between mb-sm"><span className="text-secondary">Phone</span><span style={{ fontWeight: 500 }}>{user?.phone}</span></div>
                </div>
                <button onClick={logout} className="btn btn-outline mt-lg" style={{ width: '100%' }}>Logout</button>
            </div>
        </div>
    );
}

export default Profile;
