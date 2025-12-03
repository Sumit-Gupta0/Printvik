import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize Socket Connection
        // TODO: Use environment variable for URL
        const newSocket = io('http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Connected to Socket Server');
            setIsConnected(true);
            newSocket.emit('join_admin');
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket Server');
            setIsConnected(false);
        });

        newSocket.on('new_alert', (alert) => {
            console.log('🔔 New Alert Received:', alert);

            // Play sound (optional)
            // const audio = new Audio('/notification.mp3');
            // audio.play().catch(e => console.log('Audio play failed', e));

            // Show Toast
            toast(alert.message, {
                icon: '⚠️',
                duration: 5000,
                style: {
                    border: '1px solid #F59E0B',
                    padding: '16px',
                    color: '#333',
                },
            });

            // Update State
            setAlerts((prev) => [alert, ...prev]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const markAsRead = (alertId) => {
        setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, isRead: true } : a));
        // TODO: API call to mark as read in DB
    };

    const unreadCount = alerts.filter(a => !a.isRead).length;

    const value = {
        socket,
        isConnected,
        alerts,
        unreadCount,
        markAsRead
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
