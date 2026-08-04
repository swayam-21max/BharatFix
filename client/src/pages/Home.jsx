import { Link } from 'react-router-dom';
import {
    Shield,
    Zap,
    BarChart3,
    Bell,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    UserCheck,
    Lock,
    Building,
    Clock,
    Sparkles,
    ChevronRight,
    Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import ChatbotWidget from '../components/Chatbot/ChatbotWidget';

export default function Home() {
    return (
        <div className="landing-page">
            {/* Sticky Navigation */}
            <nav className="glass sticky-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo">B</div>
                        <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>BharatFix</span>
                    </Link>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">Workflow</a>
                        <a href="#governance">Governance</a>
                        <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ fontWeight: 700 }}>Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hero-content"
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        color: 'var(--primary)',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '24px'
                    }}>
                        <Sparkles size={14} /> Next-Gen Civic Governance Engine
                    </div>

                    <h1 className="hero-title">
                        Transparent Civic Resolutions, <br />
                        <span className="gradient-text">Delivered on SLA Schedule.</span>
                    </h1>

                    <p className="hero-subtitle">
                        Empowering residents, block supervisors, and city administrators with real-time complaint tracking, automated SLA breach escalation, and complete accountability.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: '10px' }}>
                            File a Resolution Request <ArrowRight size={18} />
                        </Link>
                        <a href="#how-it-works" className="btn btn-secondary btn-lg">
                            Explore How It Works
                        </a>
                    </div>
                </motion.div>

                {/* Platform Metric Ribbon */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '900px',
                    margin: '60px auto 0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    textAlign: 'center'
                }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>100%</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>SLA Breach Tracking</div>
                    </div>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>&lt; 24h</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Response Time</div>
                    </div>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>3-Tier</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Role Governance</div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="section-padding">
                <div className="section-header center">
                    <h2 className="section-title">Built for <span className="gradient-text">Transparency & Speed</span></h2>
                    <p className="section-subtitle">A comprehensive suite designed for modern residential blocks and governance teams.</p>
                </div>

                <div className="features-grid">
                    {[
                        { icon: Zap, title: 'Real-Time Incident Tracking', desc: 'Monitor every reported issue from creation to inspection and final resolution.' },
                        { icon: Clock, title: 'Automated SLA Engine', desc: 'Priority-driven resolution timers (12h to 72h) with automatic background breach alerts.' },
                        { icon: Shield, title: 'Hierarchy Escalations', desc: 'Overdue complaints escalate automatically from Block Supervisors directly to Admins.' },
                        { icon: Building, title: 'Block Jurisdiction Control', desc: 'Assign designated Supervisors to specific blocks with dedicated oversight queues.' },
                        { icon: UserCheck, title: 'Role-Based Authorization', desc: 'Secure permissions tailored for Residents, Block Leads, and System Administrators.' },
                        { icon: Award, title: 'Audit Trail & Timestamps', desc: 'Complete timeline log of status changes, comments, and actor identities.' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -6 }}
                            className="glass-card feature-card"
                            style={{ padding: '32px' }}
                        >
                            <div className="feature-icon" style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'var(--primary-light)',
                                border: '1px solid var(--primary-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <feature.icon size={24} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="section-dark">
                <div className="section-header center">
                    <h2 className="section-title">How <span className="gradient-text">BharatFix Works</span></h2>
                    <p className="section-subtitle">Seamless 3-step complaint lifecycle management.</p>
                </div>

                <div className="workflow-container">
                    {[
                        { step: '01', title: 'Resident Files Issue', desc: 'Report issue details, unit number, category, and urgency level.' },
                        { step: '02', title: 'Block Lead Dispatched', desc: 'Assigned Block Supervisor receives instant routing and SLA timer starts.' },
                        { step: '03', title: 'Verified Resolution', desc: 'Resolution confirmed with audit trail or auto-escalations triggered.' }
                    ].map((item, i) => (
                        <div key={i} className="workflow-item">
                            <div className="workflow-step">{item.step}</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>{item.desc}</p>
                            {i < 2 && (
                                <div className="workflow-connector-dots">
                                    <span className="dot d1"></span>
                                    <span className="dot d2"></span>
                                    <span className="dot d3"></span>
                                    <span className="dot d4"></span>
                                    <span className="dot-arrow"></span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding center">
                <div className="glass-card" style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '48px',
                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.03))',
                    border: '1px solid var(--primary-border)',
                    borderRadius: '24px'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Ready to Improve Your Community?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
                        Join residents and supervisors using BharatFix for accountable civic governance.
                    </p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Get Started Now <ChevronRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer section-padding" style={{ paddingBottom: '32px' }}>
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="logo" style={{ width: 36, height: 36, background: 'var(--primary)', color: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: 16 }}>B</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>BharatFix</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '280px' }}>
                            Empowering communities through digital governance and SLA accountability.
                        </p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Platform</h4>
                            <a href="#features">Features</a>
                            <a href="#how-it-works">Workflow</a>
                        </div>
                        <div className="footer-col">
                            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Account</h4>
                            <Link to="/login">Resident Login</Link>
                            <Link to="/register">Register Unit</Link>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 BharatFix. All rights reserved. Built for Civic Excellence.</p>
                </div>
            </footer>

            <ChatbotWidget />

            <style>{`
                .landing-page {
                    background: var(--bg-dark-950);
                    min-height: 100vh;
                }
                .sticky-nav {
                    position: sticky;
                    top: 0;
                    z-index: 2000;
                    padding: 1rem 0;
                }
                .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 2rem;
                }
                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: var(--text-primary);
                }
                .nav-logo .logo {
                    width: 32px;
                    height: 32px;
                    background: var(--primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: white;
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
                .nav-links a {
                    text-decoration: none;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.9rem;
                    transition: color 0.2s;
                }
                .nav-links a:hover {
                    color: var(--primary);
                }
                .hero {
                    position: relative;
                    padding: 6.5rem 2rem 4.5rem;
                    text-align: center;
                    overflow: hidden;
                    background: radial-gradient(circle at center, rgba(5, 150, 105, 0.06), transparent);
                }
                .hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: url('/hero-bg.png');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: 0.45;
                    z-index: 0;
                    pointer-events: none;
                    mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%);
                    -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%);
                }
                .hero-content {
                    position: relative;
                    z-index: 1;
                }
                .hero-title {
                    font-size: clamp(2.2rem, 4.5vw, 4rem);
                    font-weight: 900;
                    line-height: 1.15;
                    letter-spacing: -1.5px;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                }
                .hero-subtitle {
                    color: var(--text-secondary);
                    font-size: 1.15rem;
                    margin-bottom: 2.5rem;
                    max-width: 680px;
                    margin-left: auto;
                    margin-right: auto;
                    line-height: 1.6;
                }
                .hero-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1.25rem;
                }
                .btn-lg {
                    padding: 0.85rem 1.75rem;
                    font-size: 1rem;
                }
                .section-padding {
                    padding: 5rem 2rem;
                }
                .center { text-align: center; }
                .section-header { margin-bottom: 3.5rem; }
                .section-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; color: var(--text-primary); }
                .section-subtitle { color: var(--text-secondary); font-size: 1.05rem; }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .section-dark { padding: 5rem 2rem; background: rgba(5, 150, 105, 0.03); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
                .workflow-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 2.5rem;
                    max-width: 1000px;
                    margin: 3rem auto 0;
                    position: relative;
                }
                .workflow-item { position: relative; text-align: center; flex: 1; }
                .workflow-step {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: var(--primary);
                    background: #ffffff;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.25rem;
                    border: 2px solid var(--primary-border);
                    box-shadow: 0 4px 16px rgba(5, 150, 105, 0.12);
                }
                .workflow-connector-dots {
                    position: absolute;
                    top: 1.8rem;
                    right: -2.75rem;
                    width: 4rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 10;
                }
                .workflow-connector-dots .dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--primary);
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }
                .workflow-connector-dots .dot.d1 { opacity: 0.25; transform: scale(0.8); }
                .workflow-connector-dots .dot.d2 { opacity: 0.45; transform: scale(0.9); }
                .workflow-connector-dots .dot.d3 { opacity: 0.7; transform: scale(1); }
                .workflow-connector-dots .dot.d4 { opacity: 0.95; transform: scale(1.1); }
                .workflow-connector-dots .dot-arrow {
                    width: 0;
                    height: 0;
                    border-top: 5px solid transparent;
                    border-bottom: 5px solid transparent;
                    border-left: 8px solid var(--primary);
                }
                .footer { border-top: 1px solid var(--border); background: #ffffff; }
                .footer-container { display: flex; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
                .footer-links { display: flex; gap: 4rem; }
                .footer-col a { display: block; margin-top: 0.75rem; text-decoration: none; color: var(--text-secondary); font-size: 0.9rem; }
                .footer-bottom { border-top: 1px solid var(--border); padding-top: 2rem; margin-top: 3.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
                
                @media (max-width: 768px) {
                    .workflow-container { flex-direction: column; gap: 2rem; }
                    .workflow-connector-dots { display: none; }
                    .footer-container { flex-direction: column; gap: 2.5rem; }
                }
            `}</style>
        </div>
    );
}
