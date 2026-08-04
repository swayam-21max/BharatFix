import { useState, useEffect } from 'react';
import { RoleBadge } from '../components/Badges';
import {
    Search,
    Filter,
    UserPlus,
    MoreVertical,
    Mail,
    ShieldCheck,
    Building,
    ChevronDown,
    X,
    UserCog
} from 'lucide-react';
import api from '../services/api';

export default function UsersPage() {
    const [data, setData] = useState({ users: [], pagination: {} });
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        const params = {};
        if (roleFilter) params.role = roleFilter;
        if (searchQuery) params.search = searchQuery;

        api.get('/users', { params })
            .then((res) => setData(res.data.data || { users: [], pagination: {} }))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [roleFilter, searchQuery]);

    const handleRoleUpdate = async () => {
        if (!editUser || !newRole) return;
        try {
            await api.patch(`/users/${editUser.id}/role`, { role: newRole });
            setEditUser(null);
            setNewRole('');
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading && data.users.length === 0) {
        return (
            <div className="animate-fade-in">
                <header className="page-header" style={{ marginBottom: '32px' }}>
                    <div>
                        <div className="skeleton skeleton-title" style={{ width: '240px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '300px' }}></div>
                    </div>
                </header>
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                        <div className="skeleton" style={{ height: '40px', width: '100%' }}></div>
                    </div>
                    <div style={{ padding: '24px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <div className="skeleton skeleton-avatar"></div>
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                                    <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                                </div>
                                <div className="skeleton skeleton-button"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>User Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Control access and roles for all platform members.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary">
                        Export CSV
                    </button>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Advanced Search/Filter */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', maxWidth: '350px', flex: 1 }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or email..."
                                style={{ paddingLeft: '38px', height: '40px', fontSize: '13px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={14} style={{ opacity: 0.6 }} />
                            <select
                                className="form-select"
                                style={{ padding: '4px 12px', fontSize: '13px', height: '40px', width: 'auto' }}
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">All Roles</option>
                                <option value="RESIDENT">Resident</option>
                                <option value="SUPERVISOR">Supervisor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {data.pagination?.total || 0} total users
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>User Details</th>
                                <th>Role</th>
                                <th>Assigned Block</th>
                                <th>Account Status</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.map((u) => (
                                <tr key={u.id}>
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '10px',
                                                background: 'linear-gradient(135deg, var(--primary), #10b981)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 700, fontSize: '14px'
                                            }}>
                                                {(u.fullName || u.name || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName || u.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Mail size={10} /> {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><RoleBadge role={u.role} /></td>
                                    <td>
                                        {u.role === 'SUPERVISOR' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <Building size={14} color="var(--primary)" /> {u.blockSupervisorOf?.name || 'Unassigned'}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>N/A</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--success)' }}>
                                            <ShieldCheck size={14} /> Active
                                        </div>
                                    </td>
                                    <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px' }} onClick={() => { setEditUser(u); setNewRole(u.role); }}>
                                            <UserCog size={14} style={{ marginRight: 6 }} /> Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Role change modal */}
            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal glass-card" style={{ maxWidth: '400px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Update Identity</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Modify access level for {editUser.fullName || editUser.name}</p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditUser(null)} style={{ margin: '-8px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Platform Role</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="form-select"
                                    style={{ height: '48px', paddingRight: '40px' }}
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    <option value="RESIDENT">Resident (Basic access)</option>
                                    <option value="SUPERVISOR">Supervisor (Moderate access)</option>
                                    <option value="ADMIN">System Admin (Full access)</option>
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="btn btn-primary" style={{ height: '48px', width: '100%', fontSize: '14px', fontWeight: 700 }} onClick={handleRoleUpdate}>
                                Confirm Update
                            </button>
                            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setEditUser(null)}>
                                Keep Current Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
