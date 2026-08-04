import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';
import ChatbotWidget from './Chatbot/ChatbotWidget';

export default function Layout() {
    const location = useLocation();
    const pathName = location.pathname.split('/').filter(x => x).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ');

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">Dashboard</span>
                        {pathName && pathName !== 'Dashboard' && (
                            <>
                                <span className="breadcrumb-separator"> / </span>
                                <span className="breadcrumb-item active">{pathName}</span>
                            </>
                        )}
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-btn notification-dot">
                            <Bell size={20} />
                        </button>
                        <button className="icon-btn">
                            <User size={20} />
                        </button>
                    </div>
                </header>
                <div className="page-content animate-fade-in">
                    <Outlet />
                </div>
            </main>
            <ChatbotWidget />
        </div>
    );
}
