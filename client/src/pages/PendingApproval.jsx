import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Mail, LogOut, ShieldAlert } from 'lucide-react';

export default function PendingApproval() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark-950)',
            padding: '24px'
        }}>
            <div className="glass-card animate-fade-in" style={{
                maxWidth: 500,
                width: '100%',
                textAlign: 'center',
                padding: '60px 40px',
                background: '#ffffff'
            }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    animation: 'pulse 2s infinite'
                }}>
                    <Clock size={40} />
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Approval Pending</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 32 }}>
                    Hi <strong>{user?.fullName}</strong>, your request to lead <strong>{user?.block?.name || 'your block'}</strong> as a Block Head is currently under review by our administrators.
                </p>

                <div style={{
                    background: '#f8fafc',
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 32,
                    textAlign: 'left',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <div style={{ color: 'var(--primary)' }}><ShieldAlert size={20} /></div>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Security Review</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>We verify all Block Head credentials to maintain society trust.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ color: 'var(--primary)' }}><Mail size={20} /></div>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Notification</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You will receive an email once your account is activated.</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ padding: '12px' }}
                    >
                        Check Status
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost"
                        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                <p style={{ marginTop: 32, fontSize: 13, color: 'var(--text-muted)' }}>
                    Need urgent access? <a href="mailto:support@bharatfix.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Contact Support</a>
                </p>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
