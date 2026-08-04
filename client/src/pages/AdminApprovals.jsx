import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    CheckCircle,
    XCircle,
    User,
    Mail,
    Building,
    Calendar,
    Search,
    Loader2
} from 'lucide-react';

export default function AdminApprovals() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPending = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/pending-approvals');
            setPending(data.data);
        } catch (err) {
            console.error('Failed to fetch pending approvals', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            await api.post(`/admin/approve/${userId}`);
            setPending(prev => prev.filter(p => p.id !== userId));
        } catch (err) {
            alert('Approval failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId) => {
        const reason = prompt('Enter reason for rejection:');
        if (reason === null) return;

        setActionLoading(userId);
        try {
            await api.post(`/admin/reject/${userId}`, { reason });
            setPending(prev => prev.filter(p => p.id !== userId));
        } catch (err) {
            alert('Rejection failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = pending.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Block Head Approvals</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and verify authority requests for individual society blocks.</p>
                </div>
            </header>

            <div className="filter-bar" style={{
                background: '#ffffff',
                padding: '16px 24px',
                borderRadius: 16,
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 32,
                border: '1px solid var(--border)',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        style={{
                            width: '100%',
                            background: '#f8fafc',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: '12px 12px 12px 48px',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    {filtered.length} pending requests
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                    background: '#ffffff',
                    borderRadius: 24,
                    border: '1px dashed var(--border)'
                }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 24px', color: 'var(--success)', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Queue Clear!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>No pending block head applications at the moment.</p>
                </div>
            ) : (
                <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                    {filtered.map(req => (
                        <div key={req.id} className="glass-card hover-lift" style={{ padding: 24, borderRadius: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 16,
                                        background: 'linear-gradient(135deg, var(--primary), #10b981)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 20,
                                        fontWeight: 800
                                    }}>
                                        {req.fullName[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{req.fullName}</h3>
                                        <div style={{ display: 'flex', items: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                                            <Mail size={14} /> {req.email}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 10px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: 'var(--warning)',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5
                                }}>
                                    Pending
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                                <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Requested Block</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                        <Building size={14} color="var(--primary)" /> {req.block?.name || 'N/A'}
                                    </div>
                                </div>
                                <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Applied On</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                        <Calendar size={14} color="var(--primary)" /> {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    disabled={actionLoading === req.id}
                                    style={{
                                        background: 'var(--success)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {actionLoading === req.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Approve
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={actionLoading === req.id}
                                    style={{
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        color: 'var(--danger)',
                                        border: '1px solid rgba(244, 63, 94, 0.2)',
                                        padding: '12px',
                                        borderRadius: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {actionLoading === req.id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />} Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
