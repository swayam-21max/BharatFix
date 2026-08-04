import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    AlertCircle,
    Users,
    Box,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
    const { user, logout } = useAuth();
    const [isCollapsed] = useState(false);

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Complaints', path: '/complaints', icon: FileText, roles: ['RESIDENT'] },
        { label: 'File Complaint', path: '/complaints/new', icon: PlusCircle, roles: ['RESIDENT'] },
    ];

    const blockHeadItems = [
        { label: 'Block Oversight', path: '/complaints', icon: AlertCircle },
    ];

    const adminItems = [
        { label: 'Approvals', path: '/approvals', icon: Settings },
        { label: 'Users', path: '/users', icon: Users },
        { label: 'Blocks', path: '/blocks', icon: Box },
    ];

    const handleNavClick = () => {
        if (onCloseMobile) onCloseMobile();
    };

    return (
        <>
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onCloseMobile}
                    aria-label="Close Mobile Menu"
                />
            )}
            <aside className={clsx("sidebar", isCollapsed && "collapsed", mobileOpen && "mobile-open")}>
                <div className="sidebar-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div className="logo">B</div>
                        {!isCollapsed && <h1>BharatFix</h1>}
                    </div>
                    <button
                        className="mobile-close-btn"
                        onClick={onCloseMobile}
                        aria-label="Close Navigation Menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {!isCollapsed && <div className="nav-label">Core</div>}
                    {menuItems.filter(item => !item.roles || item.roles.includes(user?.role)).map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={({ isActive }) => clsx("nav-item", isActive && "active")}
                        >
                            <item.icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}

                    {user?.role === 'BLOCK_HEAD' && (
                        <>
                            {!isCollapsed && <div className="nav-label">Management</div>}
                            {blockHeadItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={({ isActive }) => clsx("nav-item", isActive && "active")}
                                >
                                    <item.icon size={20} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                        </>
                    )}

                    {user?.role === 'ADMIN' && (
                        <>
                            {!isCollapsed && <div className="nav-label">Admin</div>}
                            {adminItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={({ isActive }) => clsx("nav-item", isActive && "active")}
                                >
                                    <item.icon size={20} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <NavLink to="/settings" onClick={handleNavClick} className="nav-item">
                        <Settings size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </NavLink>
                    <button onClick={() => { if (onCloseMobile) onCloseMobile(); logout(); }} className="nav-item">
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}

