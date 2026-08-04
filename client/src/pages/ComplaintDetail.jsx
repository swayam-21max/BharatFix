import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
    Calendar,
    MapPin,
    User as UserIcon,
    Clock,
    AlertTriangle,
    ArrowLeft,
    History,
    MessageSquare,
    Send,
    CheckCircle2,
    ShieldAlert,
    Building,
    CheckCircle,
    XCircle,
    RotateCcw,
    Phone,
    MessageCircle
} from 'lucide-react';
import api from '../services/api';
import './Complaints.css';

// 4-step status progression tracker helper
function getStepStatus(currentStatus) {
    const steps = [
        { key: 'OPEN', label: '1. Logged' },
        { key: 'IN_PROGRESS', label: '2. In Progress' },
        { key: 'RESOLVED', label: '3. Resolved' },
        { key: 'CLOSED', label: '4. Closed' }
    ];

    const statusOrder = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, idx) => ({
        ...step,
        isActive: idx === currentIndex,
        isCompleted: idx < currentIndex || currentStatus === 'RESOLVED' && idx <= 2
    }));
}

// Compute SLA health meter percentage & text
function getSlaMeter(complaint) {
    if (complaint.status === 'RESOLVED') {
        return { percent: 100, text: 'Resolved On-Time', statusClass: 'ok', hoursLeft: 0 };
    }
    const created = new Date(complaint.createdAt).getTime();
    const due = new Date(complaint.slaDueAt).getTime();
    const now = new Date().getTime();

    const totalDuration = Math.max(due - created, 1);
    const elapsed = now - created;

    let percent = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
    const hoursLeft = Math.round((due - now) / (1000 * 60 * 60));

    if (hoursLeft < 0) {
        return { percent: 100, text: `SLA BREACHED (${Math.abs(hoursLeft)} Hours Overdue)`, statusClass: 'breached', hoursLeft };
    } else if (hoursLeft <= 4) {
        return { percent, text: `Resolution Due in ${hoursLeft} Hours (Urgent)`, statusClass: 'warn', hoursLeft };
    } else {
        return { percent, text: `Resolution Due in ${hoursLeft} Hours`, statusClass: 'ok', hoursLeft };
    }
}

export default function ComplaintDetail() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        api.get(`/complaints/${id}`)
            .then((res) => setComplaint(res.data.data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to fetch complaint details'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleStatusUpdate = async (newStatus, customComment) => {
        setActionLoading(true);
        try {
            await api.patch(`/complaints/${id}/status`, {
                status: newStatus,
                comment: customComment || newComment || undefined
            });
            const res = await api.get(`/complaints/${id}`);
            setComplaint(res.data.data);
            setNewComment('');
        } catch (err) {
            alert(err.response?.data?.message || 'Status update failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="loader-container" style={{ padding: '60px' }}><div className="loader" /></div>;
    if (error) return (
        <div className="glass-card empty-state animate-fade-in" style={{ padding: '60px', textAlign: 'center' }}>
            <ShieldAlert size={48} color="#e11d48" opacity={0.6} />
            <h3 style={{ marginTop: '16px', fontSize: '20px' }}>Access Denied</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
            <Link to="/complaints" className="btn btn-secondary"><ArrowLeft size={16} /> Return to Complaints Queue</Link>
        </div>
    );
    if (!complaint) return null;

    const slaMeter = getSlaMeter(complaint);
    const steps = getStepStatus(complaint.status);
    const canManage = currentUser?.role === 'BLOCK_HEAD' || currentUser?.role === 'ADMIN';

    return (
        <div className="complaints-page-container animate-fade-in">
            {/* Header / Navigation */}
            <div className="complaints-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Link to="/complaints" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '13px', gap: '4px' }}>
                            <ArrowLeft size={16} /> Back to Complaints
                        </Link>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ #{complaint.id.slice(0, 8)}</span>
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{complaint.title}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                </div>
            </div>

            {/* 4-Step Lifecycle Status Stepper */}
            <div className="status-stepper-container">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.key}>
                        <div className={`stepper-step-item ${s.isActive ? 'active' : ''} ${s.isCompleted ? 'completed' : ''}`}>
                            <div className="stepper-circle">
                                {s.isCompleted ? <CheckCircle size={20} /> : idx + 1}
                            </div>
                            <span className="stepper-label">{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`stepper-connector-line ${s.isCompleted ? 'active' : ''}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="complaint-detail-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* SLA Countdown Health Progress Meter */}
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }} className={slaMeter.statusClass}>
                                <Clock size={18} /> {slaMeter.text}
                            </div>
                            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                                Due: {new Date(complaint.slaDueAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="sla-progress-track" style={{ height: '8px' }}>
                            <div className={`sla-progress-fill ${slaMeter.statusClass}`} style={{ width: `${slaMeter.percent}%` }} />
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="glass-card" style={{ padding: '32px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} color="var(--primary)" /> Issue Description
                        </h3>
                        <p style={{ lineHeight: 1.75, color: '#334155', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                            {complaint.description}
                        </p>
                    </div>

                    {/* Management Action Bar (For Block Leads & Admins) */}
                    {canManage && (
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={18} color="var(--primary)" /> Lead Management Actions
                            </h3>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {complaint.status === 'OPEN' && (
                                    <button
                                        className="btn btn-primary"
                                        disabled={actionLoading}
                                        onClick={() => handleStatusUpdate('IN_PROGRESS', 'Issue accepted and assigned for repair work.')}
                                        style={{ gap: '6px' }}
                                    >
                                        <CheckCircle size={16} /> Accept & Start Progress
                                    </button>
                                )}
                                {complaint.status === 'IN_PROGRESS' && (
                                    <button
                                        className="btn btn-primary"
                                        disabled={actionLoading}
                                        onClick={() => handleStatusUpdate('RESOLVED', 'Inspection completed and complaint resolved.')}
                                        style={{ background: '#059669', gap: '6px' }}
                                    >
                                        <CheckCircle size={16} /> Mark as Resolved
                                    </button>
                                )}
                                {complaint.status !== 'RESOLVED' && complaint.status !== 'REJECTED' && (
                                    <button
                                        className="btn btn-secondary"
                                        disabled={actionLoading}
                                        onClick={() => handleStatusUpdate('REJECTED', 'Complaint rejected after inspection.')}
                                        style={{ color: '#e11d48', borderColor: '#fca5a5', gap: '6px' }}
                                    >
                                        <XCircle size={16} /> Reject Complaint
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity Timeline */}
                    <div className="glass-card" style={{ padding: '32px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={18} color="var(--primary)" /> Activity Timeline Log
                        </h3>
                        <div className="timeline-v2" style={{ padding: 0 }}>
                            {(complaint.statusHistory || []).map((h, i) => (
                                <div key={h.id} className="timeline-item">
                                    {i < complaint.statusHistory.length - 1 && <div className="timeline-line" />}
                                    <div className="timeline-node">
                                        <History size={14} />
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-title">
                                            Status updated to <strong style={{ color: '#059669' }}>{h.newStatus.replace('_', ' ')}</strong>
                                        </div>
                                        <div className="timeline-desc">
                                            Updated by {h.changedBy?.fullName || 'User'} ({h.changedBy?.role || 'RESIDENT'})
                                        </div>
                                        {h.comment && (
                                            <div style={{ marginTop: '6px', fontSize: '13px', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
                                                "{h.comment}"
                                            </div>
                                        )}
                                        <div className="timeline-meta">
                                            {new Date(h.changedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discussion Commentary Box */}
                    <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Add Resolution Update / Note</h3>
                        <textarea
                            placeholder="Add commentary or inspection notes..."
                            className="form-textarea"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ minHeight: '90px', marginBottom: '16px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleStatusUpdate(complaint.status, newComment)}
                                disabled={!newComment.trim() || actionLoading}
                                style={{ gap: '6px' }}
                            >
                                <Send size={15} /> Post Log Update
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metadata Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '20px', letterSpacing: '0.8px' }}>
                            Governance Context
                        </h4>

                        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                            <UserIcon size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Reporter</div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{complaint.resident?.fullName || 'Resident'}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Unit: {complaint.houseNumber || 'N/A'}</div>
                                {complaint.resident?.phoneNumber && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', marginTop: '4px' }}>
                                        <MessageCircle size={11} /> WhatsApp Alerts Active ({complaint.resident.phoneNumber})
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                            <Building size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Block / Society</div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{complaint.block?.name || 'Main Block'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                            <ShieldAlert size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Assigned Lead</div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{complaint.assignedTo?.fullName || 'System Managed'}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Role: {complaint.assignedTo?.role || 'Block Supervisor'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '14px' }}>
                            <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Creation Date</div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{new Date(complaint.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
