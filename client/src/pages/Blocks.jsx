import { useState, useEffect } from 'react';
import {
    Plus,
    MoreHorizontal,
    UserPlus,
    Trash2,
    Building,
    ShieldCheck,
    AlertCircle,
    Users,
    MapPin,
    ArrowUpRight,
    X,
    UserMinus
} from 'lucide-react';
import api from '../services/api';

export default function BlocksPage() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [assignModal, setAssignModal] = useState(null);
    const [supervisorId, setSupervisorId] = useState('');
    const [supervisors, setSupervisors] = useState([]);

    const fetchBlocks = () => {
        setLoading(true);
        api.get('/blocks').then((res) => setBlocks(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBlocks();
        api.get('/users?role=SUPERVISOR').then((res) => setSupervisors(res.data.data?.users || [])).catch(console.error);
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            await api.post('/blocks', { name: newName });
            setNewName('');
            setShowCreate(false);
            fetchBlocks();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const handleAssign = async () => {
        if (!assignModal || !supervisorId) return;
        try {
            await api.patch(`/blocks/${assignModal.id}/supervisor`, { supervisorId });
            setAssignModal(null);
            setSupervisorId('');
            fetchBlocks();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const handleRemove = async (blockId) => {
        if (!confirm('Remove supervisor from this block?')) return;
        try {
            await api.delete(`/blocks/${blockId}/supervisor`);
            fetchBlocks();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    if (loading && blocks.length === 0) return <div className="loader-container"><div className="loader" /></div>;

    return (
        <div className="animate-fade-in">
            <header className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Block Governance</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Organize society into manageable operational units.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> New Jurisdiction
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {blocks.map((b) => (
                    <div key={b.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '12px',
                                    background: 'var(--primary-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--primary)', marginBottom: '16px'
                                }}>
                                    <Building size={24} />
                                </div>
                                <button className="btn btn-ghost btn-icon" style={{ margin: '-8px' }}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{b.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <AlertCircle size={14} /> {b.complaintCount} Active Items
                            </div>
                        </div>

                        <div style={{ padding: '24px', flex: 1 }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Operational Lead</label>
                                {b.supervisor ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                            {(b.supervisor.fullName || b.supervisor.name || 'S').charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{b.supervisor.fullName || b.supervisor.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.supervisor.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        <AlertCircle size={14} /> No supervisor assigned
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setAssignModal(b); setSupervisorId(''); }}>
                                {b.supervisor ? <UserPlus size={14} style={{ marginRight: 6 }} /> : <Plus size={14} style={{ marginRight: 6 }} />}
                                {b.supervisor ? 'Reassign' : 'Assign'}
                            </button>
                            {b.supervisor && (
                                <button className="btn btn-danger-ghost btn-icon" onClick={() => handleRemove(b.id)}>
                                    <UserMinus size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Create block modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal glass-card" style={{ maxWidth: '400px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Register Block</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create a new governance unit.</p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)} style={{ margin: '-8px' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Vocal Identification</label>
                            <input className="form-input" style={{ height: '48px' }} placeholder="e.g. Sector 7-B" value={newName} onChange={(e) => setNewName(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="btn btn-primary" style={{ height: '48px' }} onClick={handleCreate}>Create Unit</button>
                            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Dismiss</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Assign supervisor modal */}
            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal glass-card" style={{ maxWidth: '420px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Appoint Lead</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Delegate {assignModal.name} to a supervisor.</p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setAssignModal(null)} style={{ margin: '-8px' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Select Candidate</label>
                            <select className="form-select" style={{ height: '48px' }} value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
                                <option value="">Select from list...</option>
                                {supervisors.map((s) => (
                                    <option key={s.id} value={s.id} disabled={s.blockSupervisorOf?.id === assignModal.id}>
                                        {s.fullName || s.name} {s.blockSupervisorOf ? `(Currently at ${s.blockSupervisorOf.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="btn btn-primary" style={{ height: '48px' }} onClick={handleAssign}>Confirm Appointment</button>
                            <button className="btn btn-ghost" onClick={() => setAssignModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .btn-danger-ghost {
                    background: transparent;
                    color: var(--danger);
                    border: 1px solid rgba(244, 63, 94, 0.2);
                }
                .btn-danger-ghost:hover {
                    background: rgba(244, 63, 94, 0.1);
                    border-color: var(--danger);
                }
            `}</style>
        </div>
    );
}
