import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <div className="auth-sidebar">
                <div className="hero-content animate-fade-in" style={{ padding: '0 60px', textAlign: 'center' }}>
                    <div className="logo" style={{ width: 64, height: 64, fontSize: 32, margin: '0 auto 24px', background: 'white', color: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>B</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16, color: 'white' }}>BharatFix</h1>
                    <p style={{ opacity: 0.9, fontSize: '1.1rem', color: 'white' }}>The transparent, accountable way to manage your community.</p>
                </div>
            </div>

            <div className="auth-form-container">
                <div className="auth-card animate-fade-in">
                    <header style={{ marginBottom: 40 }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Welcome back</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your account.</p>
                    </header>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
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
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: 13 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
                            </label>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <footer style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
                    </footer>
                </div>
            </div>
        </div>
    );
}
