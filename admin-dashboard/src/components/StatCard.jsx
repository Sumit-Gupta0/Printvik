import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => {
    const isPositive = trend === 'up';

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1 font-outfit uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 font-outfit">{value}</h3>
                </div>
                <div className={`p-3.5 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                    <Icon size={24} className={`${color.replace('bg-', 'text-')}`} />
                </div>
            </div>

            <div className="flex items-center text-sm">
                <span className={`flex items-center font-semibold ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-0.5 rounded-full`}>
                    {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                    {trendValue}
                </span>
                <span className="text-slate-400 ml-2 font-medium">vs last month</span>
            </div>
        </div>
    );
};

export default StatCard;
