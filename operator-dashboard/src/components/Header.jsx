import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, LogOut, Settings, Search, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuthStore();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [stats, setStats] = useState({ todayEarnings: 0, pendingPages: 0 });

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleOnlineStatus = async () => {
        setUpdatingStatus(true);
        try {
            const token = localStorage.getItem('token');
            const newStatus = !isOnline;
            await axios.put(
                `${API_URL}/operators/status`,
                { isOnline: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsOnline(newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Fetch initial online status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsOnline(response.data.data.isOnline ?? true);
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };
        fetchStatus();
    }, []);

    // Get breadcrumb from current path
    const getBreadcrumb = () => {
        const path = location.pathname;
        if (path === '/') return 'Print Queue';
        if (path === '/walk-in-queue') return 'Walk-in Queue';
        if (path === '/earnings') return 'Earnings';
        if (path === '/inventory') return 'Inventory';
        if (path === '/service-preferences') return 'Service Preferences';
        if (path === '/settings') return 'Settings';
        if (path === '/profile') return 'Profile';
        return 'Dashboard';
    };

    return (
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">PrintVik</span>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-medium text-gray-500">{getBreadcrumb()}</span>
            </div>

            {/* Center: Live Stats Ticker */}
            <div className="hidden lg:flex items-center gap-6 text-sm">
                <span className="text-gray-500">
                    Today: <b className="text-gray-900 font-mono">₹{stats.todayEarnings}</b>
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">
                    Pending: <b className="text-gray-900 font-mono">{stats.pendingPages} pgs</b>
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    {isOnline ? 'Online' : 'Offline'}
                </span>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden lg:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-gray-100 border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 w-48 transition-all focus:w-64"
                    />
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors relative"
                    >
                        <Bell size={18} />
                        {/* Notification badge - uncomment when needed */}
                        {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span> */}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            </div>
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No new notifications
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Toggle */}
                <button
                    onClick={toggleOnlineStatus}
                    disabled={updatingStatus}
                    className={`text-sm flex items-center gap-1.5 transition-colors ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-900'
                        } ${isOnline ? 'text-emerald-600' : 'text-gray-500'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    {isOnline ? 'Online' : 'Offline'}
                </button>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Operator'}</p>
                                <p className="text-xs text-gray-500">Operator</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors text-left"
                                >
                                    <Settings size={16} />
                                    Profile Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors text-left"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
