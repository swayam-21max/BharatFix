import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
    FileText,
    Users,
    CheckCircle,
    AlertTriangle,
    Clock,
    TrendingUp,
    TrendingDown,
    Plus,
    ShieldAlert,
    ArrowUpRight,
    Droplets,
    Zap,
    Trash2,
    HardHat,
    Shield,
    Wrench,
    Activity,
    Sparkles,
    CheckCircle2,
    Filter
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import socket, { joinUserRoom } from '../services/socket';
import api from '../services/api';
import './Dashboard.css';

// Map category names to Lucide icons
const CATEGORY_ICON_MAP = {
    Water: Droplets,
    Electricity: Zap,
    Sanitation: Trash2,
    Roads: HardHat,
    Security: Shield,
    Maintenance: Wrench
};

function getCategoryIcon(catName) {
    const key = Object.keys(CATEGORY_ICON_MAP).find(k => 
        (catName || '').toLowerCase().includes(k.toLowerCase())
    );
    return CATEGORY_ICON_MAP[key] || Wrench;
}

// Chart datasets based on time range filter
const CHART_DATA = {
    '7d': [
        { name: 'Mon', count: 4, resolved: 3 },
        { name: 'Tue', count: 7, resolved: 5 },
        { name: 'Wed', count: 5, resolved: 4 },
        { name: 'Thu', count: 12, resolved: 9 },
        { name: 'Fri', count: 9, resolved: 8 },
        { name: 'Sat', count: 6, resolved: 6 },
        { name: 'Sun', count: 8, resolved: 7 },
    ],
    '30d': [
        { name: 'Week 1', count: 28, resolved: 24 },
        { name: 'Week 2', count: 34, resolved: 30 },
        { name: 'Week 3', count: 29, resolved: 27 },
        { name: 'Week 4', count: 41, resolved: 38 },
    ],
    '90d': [
        { name: 'May', count: 95, resolved: 88 },
        { name: 'Jun', count: 112, resolved: 104 },
        { name: 'Jul', count: 128, resolved: 121 },
    ]
};

function KPIStatCard({ icon: Icon, value, label, subtext, trend, trendType, colorClass }) {
    return (
        <div className="kpi-card-v2">
            <div className={`kpi-accent-bar ${colorClass}`} />
            <div className="kpi-header">
                <div className={`kpi-icon-bubble ${colorClass}`}>
                    <Icon size={22} />
                </div>
                {trend && (
                    <div className={`kpi-trend-pill ${trendType === 'up' ? 'up' : 'down'}`}>
                        {trendType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            {subtext && (
                <div className="kpi-footer-note">
                    <Sparkles size={11} color="var(--primary)" /> {subtext}
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    const fetchStats = () => {
        api.get('/dashboard/stats')
            .then((res) => setStats(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStats();

        // Join user room for targeted socket events
        if (user?.id) joinUserRoom(user.id);

        // Listen for live real-time socket events
        const handleLiveUpdate = () => {
            fetchStats();
        };

        socket.on('complaint:created', handleLiveUpdate);
        socket.on('complaint:updated', handleLiveUpdate);
        socket.on('complaint:escalated', handleLiveUpdate);

        return () => {
            socket.off('complaint:created', handleLiveUpdate);
            socket.off('complaint:updated', handleLiveUpdate);
            socket.off('complaint:escalated', handleLiveUpdate);
        };
    }, [user]);

    if (loading && !stats) {
        return (
            <div className="animate-fade-in" style={{ padding: '40px' }}>
                <div className="skeleton" style={{ height: '160px', width: '100%', marginBottom: '32px', borderRadius: '24px' }}></div>
                <div className="stats-grid" style={{ marginBottom: '32px' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '20px' }}></div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                    <div className="skeleton" style={{ height: '380px', borderRadius: '24px' }}></div>
                    <div className="skeleton" style={{ height: '380px', borderRadius: '24px' }}></div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="empty-state" style={{ padding: '60px', textAlign: 'center' }}>
                <h3>Unable to load dashboard data</h3>
                <p style={{ color: 'var(--text-muted)' }}>Please check server connection and try again.</p>
            </div>
        );
    }

    const COLORS = ['#059669', '#10b981', '#f59e0b', '#e11d48', '#0284c7'];
    const activeBreaches = (stats.recentEscalations || []).length;
    const userFirstName = (user?.fullName || user?.name || 'User').split(' ')[0];

    return (
        <div className="dashboard-v2 animate-fade-in">
            {/* Urgent SLA Breach Callout Banner if active escalations exist */}
            {activeBreaches > 0 && (
                <div className="urgent-breach-banner">
                    <div className="breach-banner-info">
                        <ShieldAlert size={22} />
                        <span>Attention: There {activeBreaches === 1 ? 'is 1 active SLA breach' : `are ${activeBreaches} active SLA breaches`} requiring action.</span>
                    </div>
                    <Link to="/complaints" className="btn btn-secondary" style={{ color: '#9f1239', borderColor: '#fca5a5', fontSize: '13px', padding: '6px 14px' }}>
                        Review SLA Alerts <ArrowUpRight size={14} />
                    </Link>
                </div>
            )}

            {/* Hero Welcome Card */}
            <div className="hero-welcome-card">
                <div className="hero-content-wrapper">
                    <div>
                        <div className="hero-tag-row">
                            <span className={`role-pill ${(user?.role || 'RESIDENT').toLowerCase()}`}>
                                <Sparkles size={13} /> {user?.role || 'RESIDENT'}
                            </span>
                            <span className="health-pill">
                                <span className="pulse-dot" /> SLA Health 98% Optimal
                            </span>
                        </div>
                        <h1 className="hero-title">Welcome back, {userFirstName}! 👋</h1>
                        <p className="hero-description">
                            {user?.role === 'ADMIN' ? 'Full system governance enabled. Here is your real-time civic operational overview.' :
                                user?.role === 'BLOCK_HEAD' ? `Governance Lead for ${user?.block?.name || 'your block'}. Track resolution performance and assigned tasks.` :
                                    `Resident of ${user?.block?.name || 'Bharat Nagar'}. Lodge issues, track status updates, and stay informed.`}
                        </p>
                    </div>

                    <div className="hero-actions">
                        {user?.role === 'RESIDENT' && (
                            <Link to="/complaints/new" className="btn btn-primary" style={{ gap: '8px' }}>
                                <Plus size={18} /> File Complaint
                            </Link>
                        )}
                        {user?.role === 'ADMIN' && (
                            <Link to="/approvals" className="btn btn-primary" style={{ gap: '8px' }}>
                                <Users size={18} /> Approvals
                            </Link>
                        )}
                        <Link to="/complaints" className="btn btn-secondary" style={{ gap: '6px' }}>
                            <Filter size={16} /> All Reports
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="kpi-grid-v2">
                <KPIStatCard
                    icon={FileText}
                    value={stats.overview?.totalComplaints || 0}
                    label={user?.role === 'RESIDENT' ? "My Total Reports" : "Total Complaints"}
                    subtext="100% recorded with SLA timers"
                    trend="+14%"
                    trendType="up"
                    colorClass="blue"
                />

                <KPIStatCard
                    icon={Clock}
                    value={stats.overview?.pendingComplaints || 0}
                    label="Pending Action"
                    subtext="Assigned to block leads"
                    colorClass="yellow"
                />

                <KPIStatCard
                    icon={CheckCircle}
                    value={stats.overview?.resolvedComplaints || 0}
                    label="Resolved Issues"
                    subtext="96.4% on-time resolution rate"
                    trend="+8%"
                    trendType="up"
                    colorClass="green"
                />

                {user?.role === 'ADMIN' ? (
                    <KPIStatCard
                        icon={ShieldAlert}
                        value={stats.overview?.slaBreachedCount || 0}
                        label="SLA Breached"
                        subtext="Level 3 escalations"
                        trendType="down"
                        colorClass="red"
                    />
                ) : (
                    <KPIStatCard
                        icon={AlertTriangle}
                        value={stats.overview?.escalatedCount || 0}
                        label="Active Escalations"
                        subtext="Under supervisor review"
                        colorClass="red"
                    />
                )}
            </div>

            {/* Analytics Charts Section */}
            <div className="charts-grid-v2">
                {/* Area Chart */}
                <div className="chart-card-v2">
                    <div className="chart-card-header">
                        <div className="chart-title-group">
                            <div className="chart-icon-small">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h3 className="chart-card-title">Complaints & Resolutions Trend</h3>
                                <p className="chart-card-subtitle">Volume of issues filed vs resolved</p>
                            </div>
                        </div>
                        <select 
                            className="chart-time-select"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                    </div>

                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA[timeRange] || CHART_DATA['7d']}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" name="Filed" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorResolved)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie / Donut Status Breakdown Chart */}
                <div className="chart-card-v2">
                    <div className="chart-card-header">
                        <div className="chart-title-group">
                            <div className="chart-icon-small" style={{ background: '#fef3c7', color: '#d97706' }}>
                                <CheckCircle2 size={18} />
                            </div>
                            <div>
                                <h3 className="chart-card-title">Status Breakdown</h3>
                                <p className="chart-card-subtitle">Distribution by current state</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.byStatus?.map(s => ({ name: s.status, value: s.count })) || []}
                                    innerRadius={55}
                                    outerRadius={78}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {(stats.byStatus || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="pie-legend-grid">
                        {(stats.byStatus || []).map((s, i) => (
                            <div key={s.status} className="pie-legend-item">
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                <span>{s.status}: <strong>{s.count}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lower Grid: Recent Complaints & Activity Timeline */}
            <div className="lower-grid-v2">
                {/* Recent Complaints Table */}
                <div className="panel-card-v2">
                    <div className="panel-header">
                        <h3 className="panel-title">
                            <FileText size={18} color="var(--primary)" /> Recent Complaints
                        </h3>
                        <Link to="/complaints" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <table className="table-v2">
                        <thead>
                            <tr>
                                <th>Category & Title</th>
                                <th>Status</th>
                                <th>Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.recentComplaints || []).slice(0, 5).map((c) => {
                                const CatIcon = getCategoryIcon(c.category);
                                return (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className="cat-badge-chip">
                                                    <CatIcon size={13} /> {c.category || 'General'}
                                                </span>
                                                <div>
                                                    <Link to={`/complaints/${c.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                                                        {c.title}
                                                    </Link>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: #{c.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><StatusBadge status={c.status} /></td>
                                        <td><PriorityBadge priority={c.priority} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* System Activity Timeline */}
                <div className="panel-card-v2">
                    <div className="panel-header">
                        <h3 className="panel-title">
                            <Activity size={18} color="var(--primary)" /> Recent System Activity
                        </h3>
                    </div>

                    <div className="timeline-v2">
                        {(stats.recentComplaints || []).slice(0, 4).map((c, i) => (
                            <div key={`act-${c.id}`} className="timeline-item">
                                {i < 3 && <div className="timeline-line" />}
                                <div className="timeline-node">
                                    <FileText size={15} />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-title">New Complaint Logged</div>
                                    <div className="timeline-desc">{c.title}</div>
                                    <div className="timeline-meta">
                                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • by {c.resident?.fullName || 'Resident'}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {stats.recentEscalations?.slice(0, 1).map((e) => (
                            <div key={`esc-${e.id}`} className="timeline-item">
                                <div className="timeline-node danger">
                                    <ShieldAlert size={15} />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-title" style={{ color: '#e11d48' }}>Critical Escalation</div>
                                    <div className="timeline-desc">{e.complaintTitle}</div>
                                    <div className="timeline-meta">{e.reason}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Custom recharts tooltip
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="custom-chart-tooltip">
                <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{label}</p>
                {payload.map((p, idx) => (
                    <p key={idx} style={{ color: p.color, margin: 0, fontWeight: 500 }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
}
