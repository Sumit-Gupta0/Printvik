/**
 * Print Queue Page
 * View and manage assigned print jobs
 */

import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import OrderBoard from '../components/OrderBoard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PrintQueue() {
    const { user } = useAuthStore();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/operators/queue`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter out WALK_IN orders - only show app orders (ONLINE)
            const appOrders = response.data.data.orders.filter(
                order => order.orderType !== 'WALK_IN'
            );
            setJobs(appOrders);
        } catch (error) {
            console.error('Error fetching queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewFiles = (order) => {
        // Open file preview modal or new tab
        if (order.documents && order.documents.length > 0) {
            // For now, open in new tab - will create modal later
            order.documents.forEach(doc => {
                window.open(doc.url, '_blank');
            });
        }
    };

    const handleMarkReady = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/orders/${orderId}/status`,
                { status: 'printed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchQueue();
        } catch (error) {
            console.error('Error marking ready:', error);
            alert('Failed to mark order as ready');
        }
    };

    const handleComplete = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/orders/${orderId}/status`,
                { status: 'completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchQueue();
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Failed to complete order');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <OrderBoard
                orders={jobs}
                onDownload={handlePreviewFiles}
                onMarkReady={handleMarkReady}
                onComplete={handleComplete}
            />
        </div>
    );
}

export default PrintQueue;
