import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title = 'Dashboard' }) => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Header title={title} />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
