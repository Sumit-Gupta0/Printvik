import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Truck,
    BarChart3,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    UserCircle,
    Wrench,
    PackageCheck,
    Shield,
    FileText,
    Package,
    IndianRupee,
    DollarSign,
    MessageSquare
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [usersExpanded, setUsersExpanded] = useState(true);

    // Role-based access helpers
    const isAdmin = ['admin', 'super_admin'].includes(user?.role);
    const isOperations = ['admin', 'super_admin', 'operations'].includes(user?.role);
    const isSupport = ['admin', 'super_admin', 'support'].includes(user?.role);

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', allowed: true },
        { path: '/orders', icon: ShoppingBag, label: 'Orders', allowed: isSupport || isOperations },
        { path: '/delivery', icon: Truck, label: 'Delivery', allowed: isOperations },
    ];

    const userSubItems = [
        { path: '/users/end-users', icon: UserCircle, label: 'End Users', color: 'text-emerald-600', allowed: isSupport || isOperations },
        { path: '/users/operators', icon: Wrench, label: 'Operators', color: 'text-amber-600', allowed: isOperations },
        { path: '/users/delivery', icon: PackageCheck, label: 'Delivery Boys', color: 'text-blue-600', allowed: isOperations },
        { path: '/users/admins', icon: Shield, label: 'Admins', color: 'text-rose-600', allowed: isAdmin },
    ];

    const bottomMenuItems = [
        { path: '/services', icon: FileText, label: 'Services', allowed: isOperations },
        { path: '/finance', icon: DollarSign, label: 'Finance (BOS)', allowed: isAdmin },
        { path: '/communications', icon: MessageSquare, label: 'Communications', allowed: isAdmin },
        { path: '/products', icon: Package, label: 'Products', allowed: isOperations },
        { path: '/analytics', icon: BarChart3, label: 'Analytics', allowed: isOperations },
        { path: '/settings', icon: Settings, label: 'Settings', allowed: true }, // Everyone can see settings, but content varies
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isUsersActive = location.pathname.startsWith('/users');

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-lg">
            {/* Logo */}
            <div className="relative p-8 border-b border-slate-100 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                {/* Multiple Animated Gradient Orbs */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full blur-2xl opacity-60 animate-float-1"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-2xl opacity-60 animate-float-2"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-50 animate-float-3"></div>
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-br from-fuchsia-400 to-purple-500 rounded-full blur-2xl opacity-50 animate-float-4"></div>

                <Link to="/" className="relative flex items-center justify-center z-10">
                    <img src="/logo.png" alt="PrintVik" className="h-20 w-auto object-contain drop-shadow-2xl relative z-10" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
                {/* Top Menu Items */}
                {menuItems.filter(item => item.allowed).map((item) => {
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

                {/* Users Menu with Submenu - Only show if at least one sub-item is allowed */}
                {userSubItems.some(item => item.allowed) && (
                    <div>
                        <button
                            onClick={() => setUsersExpanded(!usersExpanded)}
                            className={`flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${isUsersActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Users
                                size={22}
                                className={`mr-3 transition-colors ${isUsersActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                                strokeWidth={isUsersActive ? 2.5 : 2}
                            />
                            <span className={`font-medium ${isUsersActive ? 'font-semibold' : ''}`}>Users</span>
                            {usersExpanded ? (
                                <ChevronDown size={18} className="ml-auto" />
                            ) : (
                                <ChevronRight size={18} className="ml-auto" />
                            )}
                        </button>

                        {/* Submenu */}
                        {usersExpanded && (
                            <div className="mt-1 ml-4 space-y-1">
                                {userSubItems.filter(item => item.allowed).map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <div
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${isActive
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <item.icon
                                                size={18}
                                                className={`mr-3 transition-colors ${isActive ? item.color : 'text-slate-400 group-hover:text-slate-600'}`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Menu Items */}
                {bottomMenuItems.filter(item => item.allowed).map((item) => {
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

            {/* User Profile & Logout */}
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
