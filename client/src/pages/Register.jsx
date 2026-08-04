import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Building, Home as HomeIcon } from 'lucide-react';
import api from '../services/api';

const DEFAULT_FALLBACK_BLOCKS = [
    { id: 'bcd21adf-e91e-414c-bcd2-537392beb784', name: 'Block A' },
    { id: '43fccf18-c0e9-4f9f-8b4c-a7fdf07c70fa', name: 'Block B' },
    { id: 'b8f4b46b-b949-423b-8c89-04e21b1ce806', name: 'Market Area' },
    { id: '92a912ff-9b7d-4313-9da5-f060674caa8a', name: 'Park Zone' }
];

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('RESIDENT');
    const [houseNumber, setHouseNumber] = useState('');
    const [blockId, setBlockId] = useState('');
    const [blocks, setBlocks] = useState(DEFAULT_FALLBACK_BLOCKS);

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                const { data } = await api.get('/blocks');
                const list = data?.data || [];
                if (list.length > 0) {
                    setBlocks(list);
                } else {
                    setBlocks(DEFAULT_FALLBACK_BLOCKS);
                }
            } catch (err) {
                setBlocks(DEFAULT_FALLBACK_BLOCKS);
                console.error('Failed to fetch blocks', err);
            }
        };
        fetchBlocks();
    }, []);

    const getPasswordStrength = (pass) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length > 7) score += 25;
        if (/[A-Z]/.test(pass)) score += 25;
        if (/[0-9]/.test(pass)) score += 25;
        if (/[^A-Za-z0-9]/.test(pass)) score += 25;
        return score;
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({
                fullName,
                email,
                password,
                role,
                houseNumber: role === 'RESIDENT' ? houseNumber : undefined,
                blockId: blockId || undefined
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <div className="auth-sidebar">
                <div className="hero-content animate-fade-in" style={{ padding: '0 60px', textAlign: 'center' }}>
                    <div className="logo" style={{ width: 64, height: 64, fontSize: 32, margin: '0 auto 24px', background: 'white', color: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>B</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16, color: 'white' }}>Join BharatFix</h1>
                    <p style={{ opacity: 0.9, fontSize: '1.1rem', color: 'white' }}>
                        {role === 'RESIDENT'
                            ? "Report issues, track resolutions, and improve your society."
                            : "Lead your block, manage complaints, and ensure rapid fixes."}
                    </p>
                </div>
            </div>

            <div className="auth-form-container">
                <div className="auth-card animate-fade-in" style={{ maxWidth: 480 }}>
                    <header style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Create your account</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Join the 3-tier governance platform.</p>
                    </header>

                    {error && <div className="error-msg" style={{ marginBottom: 24 }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Role Selection Tabs */}
                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 12 }}>I am registering as a...</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                                background: '#f1f5f9',
                                padding: 6,
                                borderRadius: 12,
                                border: '1px solid var(--border)'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setRole('RESIDENT')}
                                    style={{
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: role === 'RESIDENT' ? 'var(--primary)' : 'transparent',
                                        color: role === 'RESIDENT' ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <User size={16} /> Resident
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('BLOCK_HEAD')}
                                    style={{
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: role === 'BLOCK_HEAD' ? 'var(--primary)' : 'transparent',
                                        color: role === 'BLOCK_HEAD' ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Building size={16} /> Block Head
                                </button>
                            </div>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                            <div className="form-group">
                                <label>Assigned Block</label>
                                <select
                                    className="form-input"
                                    value={blockId}
                                    onChange={(e) => setBlockId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Block</option>
                                    {blocks.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            {role === 'RESIDENT' && (
                                <div className="form-group">
                                    <label>House Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="B-402"
                                        value={houseNumber}
                                        onChange={(e) => setHouseNumber(e.target.value)}
                                        required={role === 'RESIDENT'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {password && (
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${strength}%`,
                                            background: strength < 50 ? 'var(--danger)' : strength < 75 ? 'var(--warning)' : 'var(--success)',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 24 }} disabled={loading}>
                            {loading ? 'Creating account...' : role === 'BLOCK_HEAD' ? 'Apply as Block Head' : 'Create Resident Account'}
                        </button>
                    </form>

                    <footer style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
                    </footer>
                </div>
            </div>
        </div>
    );
}
