import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, ChevronDown, LogOut, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useSocket } from '../context/SocketContext';

const Header = ({ title }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    const { alerts, unreadCount } = useSocket();

    // Format timestamp helper
    const formatTime = (date) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 60000); // minutes
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff} min ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours} hours ago`;
        return new Date(date).toLocaleDateString();
    };

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

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // TODO: Implement global search or pass to parent
        console.log("Searching for:", e.target.value);
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
            <h1 className="text-2xl font-bold text-slate-800 font-outfit">{title}</h1>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-72 transition-all shadow-sm group-focus-within:w-80 group-focus-within:bg-white"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2.5 rounded-full relative transition-colors ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right">
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{unreadCount} New</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {alerts.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                                    ) : (
                                        alerts.map(alert => (
                                            <div key={alert._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!alert.isRead ? 'bg-indigo-50/30' : ''}`}>
                                                <p className={`text-sm mb-1 ${!alert.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                    {alert.message}
                                                </p>
                                                <p className="text-xs text-slate-400">{formatTime(alert.createdAt)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 text-center border-t border-slate-50 bg-slate-50/30">
                                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All Notifications</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 pl-6 border-l border-gray-200 cursor-pointer group select-none"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                    {user?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-slate-500 font-medium capitalize">{user?.role || 'Administrator'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:shadow-lg transition-all ring-2 ring-white group-hover:ring-indigo-100">
                                <User size={20} />
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-600'}`} />
                        </div>

                        {/* Profile Dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right">
                                <div className="p-4 border-b border-slate-50 bg-slate-50/50 md:hidden">
                                    <p className="font-bold text-slate-800">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-left"
                                    >
                                        <Settings size={18} />
                                        Settings
                                    </button>
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
