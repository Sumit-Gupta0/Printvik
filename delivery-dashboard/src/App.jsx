/**
 * Delivery Dashboard App
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import ActiveDeliveries from './pages/ActiveDeliveries';
import DeliveryDetail from './pages/DeliveryDetail';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user && user.role !== 'delivery') return <Navigate to="/login" />;
    return children;
};

function App() {
    const { isAuthenticated, getCurrentUser } = useAuthStore();
    useEffect(() => {
        if (isAuthenticated) getCurrentUser();
    }, [isAuthenticated, getCurrentUser]);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><ActiveDeliveries /></ProtectedRoute>} />
                <Route path="/deliveries/:id" element={<ProtectedRoute><DeliveryDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
