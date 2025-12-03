/**
 * Admin Dashboard App
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Delivery from './pages/Delivery';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Operators from './pages/Operators';
import UserDetails from './pages/UserDetails';
import Services from './pages/Services';
import Products from './pages/Products';
import Finance from './pages/Finance';
import Communications from './pages/Communications';
import Layout from './components/Layout';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    if (!isAuthenticated) return <Navigate to="/login" />;
    // TEMPORARILY DISABLED - Role check
    // if (user && !['admin', 'super_admin'].includes(user.role)) return <Navigate to="/login" />;
    return children;
};

const App = () => {
    const { isAuthenticated, getCurrentUser } = useAuthStore();
    useEffect(() => {
        if (isAuthenticated) getCurrentUser();
    }, [isAuthenticated, getCurrentUser]);

    return (
        <SocketProvider>
            <Router>
                <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/users/:type" element={
                        <ProtectedRoute>
                            <Layout>
                                <Users />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/users/:type/:id" element={<ProtectedRoute><Layout><UserDetails /></Layout></ProtectedRoute>} />
                    <Route path="/orders" element={
                        <ProtectedRoute>
                            <Layout>
                                <Orders />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/operators" element={
                        <ProtectedRoute>
                            <Layout>
                                <Operators />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/services" element={
                        <ProtectedRoute>
                            <Layout>
                                <Services />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/products" element={
                        <ProtectedRoute>
                            <Layout>
                                <Products />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute>
                            <Layout>
                                <Analytics />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/delivery" element={
                        <ProtectedRoute>
                            <Layout>
                                <Delivery />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/finance" element={
                        <ProtectedRoute>
                            <Layout>
                                <Finance />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/communications" element={
                        <ProtectedRoute>
                            <Layout>
                                <Communications />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </SocketProvider>
    );
}

export default App;
