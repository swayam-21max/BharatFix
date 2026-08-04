import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
    Inbox,
    Search,
    Filter,
    Plus,
    ChevronRight,
    LayoutGrid,
    Table as TableIcon,
    Droplets,
    Zap,
    Trash2,
    HardHat,
    Shield,
    Wrench,
    Clock,
    FileText,
    CheckCircle,
    ShieldAlert,
    AlertTriangle
} from 'lucide-react';
import socket, { joinUserRoom } from '../services/socket';
import api from '../services/api';
import './Complaints.css';

const CATEGORIES = [
    { name: 'All', icon: FileText },
    { name: 'Maintenance', icon: Wrench },
    { name: 'Plumbing', icon: Droplets },
    { name: 'Electrical', icon: Zap },
    { name: 'Cleanliness', icon: Trash2 },
    { name: 'Roads', icon: HardHat },
    { name: 'Security', icon: Shield }
];

function getCatIcon(catName) {
    const found = CATEGORIES.find(c => (catName || '').toLowerCase().includes(c.name.toLowerCase()));
    return found ? found.icon : Wrench;
}

// Calculate SLA progress percentage and text
function getSlaProgress(complaint) {
    if (complaint.status === 'RESOLVED') {
        return { percent: 100, text: 'Resolved', statusClass: 'ok' };
    }
    const created = new Date(complaint.createdAt).getTime();
    const due = new Date(complaint.slaDueAt).getTime();
    const now = new Date().getTime();

    const totalDuration = Math.max(due - created, 1);
    const elapsed = now - created;

    let percent = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
    const hoursLeft = Math.round((due - now) / (1000 * 60 * 60));

    if (hoursLeft < 0) {
        return { percent: 100, text: `⚠️ SLA BREACHED (${Math.abs(hoursLeft)}h overdue)`, statusClass: 'breached' };
    } else if (hoursLeft <= 4) {
        return { percent, text: `⏳ ${hoursLeft}h remaining (Urgent)`, statusClass: 'warn' };
    } else {
        return { percent, text: `⏳ ${hoursLeft}h remaining`, statusClass: 'ok' };
    }
}

export default function Complaints() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    const fetchComplaints = () => {
        setLoading(true);
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;

        api.get('/complaints', { params })
            .then((res) => setComplaints(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { 
        fetchComplaints(); 

        if (user?.id) joinUserRoom(user.id);

        const handleLiveUpdate = () => {
            fetchComplaints();
        };

        socket.on('complaint:created', handleLiveUpdate);
        socket.on('complaint:updated', handleLiveUpdate);
        socket.on('complaint:escalated', handleLiveUpdate);

        return () => {
            socket.off('complaint:created', handleLiveUpdate);
            socket.off('complaint:updated', handleLiveUpdate);
            socket.off('complaint:escalated', handleLiveUpdate);
        };
    }, [statusFilter, searchQuery, user]);

    // Filter by selected category pill
    const filteredComplaints = complaints.filter(c => {
        if (categoryFilter === 'All') return true;
        return (c.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
    });

    // Counts for mini metric cards
    const totalCount = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'OPEN').length;
    const progressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
    const breachedCount = complaints.filter(c => new Date(c.slaDueAt) < new Date() && c.status !== 'RESOLVED').length;

    return (
        <div className="complaints-page-container animate-fade-in">
            {/* Header */}
            <div className="complaints-header">
                <div>
                    <h1 className="complaints-header-title">
                        {user?.role === 'RESIDENT' ? 'My Reported Issues' : 'Governance Complaint Queue'}
                    </h1>
                    <p className="complaints-header-sub">
                        {user?.role === 'BLOCK_HEAD' ? `Overseeing ${user.block?.name || 'Assigned Block'}` : 'Track, inspect, and manage resolution lifecycles.'}
                    </p>
                </div>
                {user?.role === 'RESIDENT' && (
                    <Link to="/complaints/new" className="btn btn-primary" style={{ gap: '8px' }}>
                        <Plus size={18} /> File New Complaint
                    </Link>
                )}
            </div>

            {/* Top Metrics Ribbon */}
            <div className="complaints-metrics-ribbon">
                <div className="metric-mini-card">
                    <div className="metric-icon-box total"><FileText size={22} /></div>
                    <div>
                        <div className="metric-number">{totalCount}</div>
                        <div className="metric-text">Total Reports</div>
                    </div>
                </div>
                <div className="metric-mini-card">
                    <div className="metric-icon-box pending"><Clock size={22} /></div>
                    <div>
                        <div className="metric-number">{pendingCount}</div>
                        <div className="metric-text">Pending Action</div>
                    </div>
                </div>
                <div className="metric-mini-card">
                    <div className="metric-icon-box progress"><AlertTriangle size={22} /></div>
                    <div>
                        <div className="metric-number">{progressCount}</div>
                        <div className="metric-text">In Progress</div>
                    </div>
                </div>
                <div className="metric-mini-card">
                    <div className="metric-icon-box resolved"><CheckCircle size={22} /></div>
                    <div>
                        <div className="metric-number">{resolvedCount}</div>
                        <div className="metric-text">Resolved</div>
                    </div>
                </div>
                {breachedCount > 0 && (
                    <div className="metric-mini-card" style={{ border: '1px solid #fca5a5' }}>
                        <div className="metric-icon-box breached"><ShieldAlert size={22} /></div>
                        <div>
                            <div className="metric-number" style={{ color: '#e11d48' }}>{breachedCount}</div>
                            <div className="metric-text" style={{ color: '#be123c' }}>SLA Breached</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Toolbar */}
            <div className="toolbar-container">
                <div className="toolbar-top-row">
                    {/* Search Input */}
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon-inside" />
                        <input
                            type="text"
                            placeholder="Search by ID, headline, house #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Right Controls: Status & View Toggle */}
                    <div className="right-controls">
                        <select
                            className="select-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <div className="view-toggle-group">
                            <button
                                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={15} /> Grid
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                <TableIcon size={15} /> Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="category-pill-bar">
                    {CATEGORIES.map(cat => {
                        const CatIcon = cat.icon;
                        const count = cat.name === 'All' 
                            ? complaints.length 
                            : complaints.filter(c => (c.category || '').toLowerCase().includes(cat.name.toLowerCase())).length;

                        return (
                            <button
                                key={cat.name}
                                className={`cat-pill-btn ${categoryFilter === cat.name ? 'active' : ''}`}
                                onClick={() => setCategoryFilter(cat.name)}
                            >
                                <CatIcon size={14} /> {cat.name} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            {loading && complaints.length === 0 ? (
                <div className="loader-container" style={{ padding: '60px' }}><div className="loader" /></div>
            ) : filteredComplaints.length === 0 ? (
                <div className="glass-card empty-state" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#059669' }}>
                        <Inbox size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>No matching complaints found</h3>
                    <p style={{ color: '#64748b', maxWidth: '340px', margin: '8px auto 24px', fontSize: '14px' }}>
                        {user?.role === 'RESIDENT' ? 'You haven\'t filed any complaints matching this filter yet.' : 'No active items in your governance queue.'}
                    </p>
                    {user?.role === 'RESIDENT' && (
                        <Link to="/complaints/new" className="btn btn-primary">
                            File a Complaint
                        </Link>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* Visual Grid Cards View */
                <div className="complaints-grid-container">
                    {filteredComplaints.map(c => {
                        const CatIcon = getCatIcon(c.category);
                        const sla = getSlaProgress(c);

                        return (
                            <div key={c.id} className="complaint-card-v2">
                                <div className="card-cat-header">
                                    <span className="cat-tag-chip">
                                        <CatIcon size={14} /> {c.category || 'Maintenance'}
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <PriorityBadge priority={c.priority} />
                                    </div>
                                </div>

                                <div className="card-body">
                                    <Link to={`/complaints/${c.id}`} className="card-headline">
                                        {c.title}
                                    </Link>

                                    <div className="card-meta-row">
                                        <span className="unit-badge">Unit: {c.houseNumber || 'N/A'}</span>
                                        <span>•</span>
                                        <span>{c.block?.name || 'Society'}</span>
                                        <span>•</span>
                                        <span>#{c.id.slice(0, 8)}</span>
                                    </div>

                                    {/* SLA Progress Bar */}
                                    <div className="card-sla-box">
                                        <div className={`card-sla-header ${sla.statusClass}`}>
                                            <span>{sla.text}</span>
                                            <StatusBadge status={c.status} />
                                        </div>
                                        <div className="sla-progress-track">
                                            <div
                                                className={`sla-progress-fill ${sla.statusClass}`}
                                                style={{ width: `${sla.percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                                            Logged {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                        <Link to={`/complaints/${c.id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12.5px', gap: '4px' }}>
                                            Inspect Details <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Dense Management Table View */
                <div className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden', padding: 0 }}>
                    <div className="table-wrapper">
                        <table className="table-v2">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '24px' }}>Category & Headline</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>House / Unit</th>
                                    <th>SLA Due</th>
                                    <th>Logged On</th>
                                    <th style={{ paddingRight: '24px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComplaints.map(c => {
                                    const CatIcon = getCatIcon(c.category);
                                    const sla = getSlaProgress(c);

                                    return (
                                        <tr key={c.id}>
                                            <td style={{ paddingLeft: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CatIcon size={16} />
                                                    </div>
                                                    <div>
                                                        <Link to={`/complaints/${c.id}`} style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                                                            {c.title}
                                                        </Link>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{c.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><StatusBadge status={c.status} /></td>
                                            <td><PriorityBadge priority={c.priority} /></td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.houseNumber || 'N/A'}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.resident?.fullName || 'Resident'}</div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '12px', fontWeight: 600 }} className={sla.statusClass}>
                                                    {sla.text}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '12.5px', color: '#64748b' }}>
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                                                <Link to={`/complaints/${c.id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                    Inspect
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
