import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Printer,
    IndianRupee,
    Package,
    Settings,
    Filter
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const menuItems = [
        { path: '/', icon: Printer, label: 'Print Queue' },
        { path: '/walk-in-queue', icon: Users, label: 'Walk-in Queue' },
        { path: '/earnings', icon: IndianRupee, label: 'Earnings' },
        { path: '/inventory', icon: Package, label: 'Inventory' },
        { path: '/service-preferences', icon: Filter, label: 'Service Preferences' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-lg">
            {/* Logo */}
            <div className="relative p-8 border-b border-slate-100 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                {/* Multiple Animated Gradient Orbs */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full blur-2xl opacity-60 animate-float-1"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-2xl opacity-60 animate-float-2"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>

                <Link to="/" className="relative flex items-center justify-center z-10">
                    <img src="/logo.png" alt="PrintVik" className="h-20 w-auto object-contain drop-shadow-2xl relative z-10" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group cursor-pointer ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon
                                size={22}
                                className={`mr-3 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                        </div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                >
                    <LogOut size={20} className="mr-3 group-hover:text-red-600 transition-colors" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
