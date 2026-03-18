/**
 * Operator Dashboard App
 * Main routing and layout
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PrintQueue from './pages/PrintQueue';
import WalkInQueue from './pages/WalkInQueue';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import JobDetail from './pages/JobDetail';
import Inventory from './pages/Inventory';
import ServicePreferences from './pages/ServicePreferences';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user && user.role !== 'operator') return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

import Register from './pages/Register';

function App() {
  const { isAuthenticated, getCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated, getCurrentUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><PrintQueue /></ProtectedRoute>} />
        <Route path="/walk-in-queue" element={<ProtectedRoute><WalkInQueue /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
        <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/service-preferences" element={<ProtectedRoute><ServicePreferences /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
