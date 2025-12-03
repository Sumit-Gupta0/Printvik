import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import useAuthStore from '../store/authStore';
import QRModal from '../components/QRModal';
import OrderBoard from '../components/OrderBoard';
import { QrCode } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function WalkInQueue() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchOrders();

        // Socket.io Connection
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to socket server');
            if (user && user._id) {
                socket.emit('join_operator', user._id);
            }
        });

        socket.on('new_walkin_order', (newOrder) => {
            console.log('New Walk-in Order received:', newOrder);
            // Play sound alert
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));

            setOrders(prevOrders => [newOrder, ...prevOrders]);
        });

        socket.on('order_updated', (updatedOrder) => {
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/operators/queue`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter for WALK_IN orders only (QR code uploads)
            const walkInOrders = response.data.data.orders.filter(
                order => order.orderType === 'WALK_IN'
            );
            setOrders(walkInOrders);
        } catch (error) {
            console.error('Error fetching walk-in queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/orders/${orderId}/status`,
                { orderStatus: 'printed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch (error) {
            console.error('Error marking order as ready:', error);
            alert('Failed to mark order as ready');
        }
    };

    const handleComplete = async (orderId, otp) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/orders/${orderId}/complete`,
                { otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch (error) {
            console.error('Error completing order:', error);
            alert(error.response?.data?.message || 'Failed to complete order');
        }
    };

    const handleDownload = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Walk-in & Self-Pickup Queue</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Customers coming to shop for pickup
                    </p>
                </div>
                <button
                    onClick={() => setShowQRModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <QrCode size={20} />
                    Show QR Code
                </button>
            </div>

            {/* Order Board with Tabs */}
            <OrderBoard
                orders={orders}
                onDownload={handleDownload}
                onMarkReady={handleMarkReady}
                onComplete={handleComplete}
            />

            {/* QR Modal */}
            {showQRModal && (
                <QRModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                />
            )}
        </div>
    );
}

export default WalkInQueue;
