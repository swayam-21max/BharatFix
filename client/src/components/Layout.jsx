import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, User, Menu } from 'lucide-react';
import ChatbotWidget from './Chatbot/ChatbotWidget';

export default function Layout() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathName = location.pathname.split('/').filter(x => x).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ');

    return (
        <div className="app-layout">
            <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open Navigation Menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="breadcrumb">
                            <span className="breadcrumb-item">Dashboard</span>
                            {pathName && pathName !== 'Dashboard' && (
                                <>
                                    <span className="breadcrumb-separator"> / </span>
                                    <span className="breadcrumb-item active">{pathName}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-btn notification-dot" aria-label="Notifications">
                            <Bell size={20} />
                        </button>
                        <button className="icon-btn" aria-label="User Profile">
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

