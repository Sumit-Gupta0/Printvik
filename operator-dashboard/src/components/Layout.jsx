import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
    const location = useLocation();

    // Determine title based on path
    const getTitle = () => {
        switch (location.pathname) {
            case '/': return 'Print Queue';
            case '/walk-in-queue': return 'Walk-in Queue';
            case '/earnings': return 'Earnings Dashboard';
            case '/profile': return 'Profile Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Header title={getTitle()} />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;
