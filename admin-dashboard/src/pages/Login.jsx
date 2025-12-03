/**
 * Admin Login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log('🔐 Attempting login with:', formData.email);
        const result = await login(formData);
        console.log('📥 Login result:', result);

        if (result.success) {
            // Get user from localStorage to check role
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('👤 User from localStorage:', user);
            console.log('🎭 User role:', user.role);

            // TEMPORARILY DISABLED - Role check
            // if (!['admin', 'super_admin'].includes(user.role)) {
            //     console.log('❌ Role check failed:', user.role);
            //     setError('Access denied. Admin only.');
            //     useAuthStore.getState().logout();
            //     return;
            // }

            // TEMPORARILY DISABLED - Approval check
            // if (user.isApproved === false) {
            //     console.log('❌ Approval check failed');
            //     setError('Your account is pending approval. Please contact an administrator.');
            //     useAuthStore.getState().logout();
            //     return;
            // }

            console.log('✅ All checks passed, navigating to dashboard');
            navigate('/');
        } else {
            console.log('❌ Login failed:', result.error);
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-center px-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/90 to-violet-600/90"></div>

                <div className="relative z-10 text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-xl border border-white/10">
                        <span className="text-4xl font-bold font-outfit">P</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 font-outfit leading-tight">Manage Your <br />Print Business</h1>
                    <p className="text-indigo-100 text-xl max-w-md leading-relaxed">
                        Streamline operations, track orders, and grow your business with the Printvik Admin Dashboard.
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="relative text-center mb-10 py-8">
                        {/* Multiple Animated Gradient Orbs */}
                        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full blur-3xl opacity-60 animate-float-1"></div>
                        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-3xl opacity-60 animate-float-2"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>
                        <div className="absolute top-0 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-50 animate-float-3"></div>
                        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-gradient-to-br from-fuchsia-400 to-purple-500 rounded-full blur-3xl opacity-50 animate-float-4"></div>
                        <div className="absolute top-1/4 left-0 w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-40 animate-float-5"></div>

                        <img src="/logo.png" alt="PrintVik" className="relative h-36 w-auto mx-auto mb-4 drop-shadow-2xl z-10" />
                        <p className="relative text-slate-600 font-medium z-10">Admin Portal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center animate-fade-in">
                            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                    placeholder="admin@printvik.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2" />
                                Remember me
                            </label>
                            <a href="#" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        <p>Protecte and subject to the Privacy Policy and Terms of Service.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
