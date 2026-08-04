import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    MapPin,
    AlertCircle,
    Send,
    ArrowLeft,
    CheckCircle2,
    Building,
    ChevronRight,
    Droplets,
    Zap,
    Trash2,
    HardHat,
    Shield,
    Wrench,
    Dumbbell,
    Clock,
    Sparkles
} from 'lucide-react';
import api from '../services/api';
import './Complaints.css';

const CATEGORY_TILES = [
    { id: 'Plumbing', label: 'Plumbing', icon: Droplets },
    { id: 'Electrical', label: 'Electrical', icon: Zap },
    { id: 'Cleanliness', label: 'Sanitation', icon: Trash2 },
    { id: 'Roads', label: 'Infrastructure', icon: HardHat },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Park/Gym', label: 'Park & Gym', icon: Dumbbell },
    { id: 'Maintenance', label: 'General', icon: Wrench },
];

const PRIORITIES = [
    { id: 'LOW', label: 'Low', timeText: '48 Hours SLA', colorClass: 'low' },
    { id: 'MEDIUM', label: 'Medium', timeText: '24 Hours SLA', colorClass: 'medium' },
    { id: 'HIGH', label: 'High', timeText: '12 Hours SLA', colorClass: 'high' },
    { id: 'CRITICAL', label: 'Critical', timeText: '4 Hours SLA', colorClass: 'critical' },
];

function calculateTargetTime(priorityId) {
    const hoursMap = { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 4 };
    const hours = hoursMap[priorityId] || 24;
    const targetDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    return {
        hours,
        formatted: targetDate.toLocaleTimeString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
}

export default function CreateComplaint() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Maintenance',
        houseNumber: user?.houseNumber || '',
        blockId: user?.blockId || '',
        priority: 'MEDIUM',
        latitude: null,
        longitude: null,
    });
    const [blocks, setBlocks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/blocks').then((res) => {
            const fetchedBlocks = res.data.data || [];
            setBlocks(fetchedBlocks);
            if (user?.blockId) {
                const b = fetchedBlocks.find(x => x.id === user.blockId);
                if (b) setSelectedBlock(b);
            }
        }).catch(console.error);
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === 'blockId') {
            const block = blocks.find(b => b.id === value);
            setSelectedBlock(block);
            if (block && !block.supervisor) {
                setError('Attention: This block currently has no active Block Head allocated. SLA timers still apply.');
            } else {
                setError('');
            }
        }
    };

    const handleCategorySelect = (catId) => {
        setForm(prev => ({ ...prev, category: catId }));
    };

    const handlePrioritySelect = (pId) => {
        setForm(prev => ({ ...prev, priority: pId }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/complaints', form);
            navigate('/complaints');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const slaTarget = calculateTargetTime(form.priority);

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
                style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontSize: '13px' }}
            >
                <ArrowLeft size={16} /> Back to complaints queue
            </button>

            <header className="page-header" style={{ marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>File a Resolution Request</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                        Select the issue category and priority level. Our SLA engine automatically routes it to your assigned Block Lead.
                    </p>
                </div>
            </header>

            <div className="create-complaint-wrapper">
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '16px',
                            background: '#ffe4e6',
                            border: '1px solid #fca5a5',
                            borderRadius: '14px',
                            color: '#e11d48',
                            display: 'flex',
                            gap: '12px',
                            marginBottom: '24px',
                            fontSize: '13.5px'
                        }}>
                            <AlertCircle size={20} style={{ flexShrink: 0 }} />
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Step 1: Category Selection Grid */}
                    <div className="form-group">
                        <label style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', marginBottom: '12px', display: 'block' }}>
                            1. Select Incident Category
                        </label>
                        <div className="category-tiles-grid">
                            {CATEGORY_TILES.map((cat) => {
                                const IconComponent = cat.icon;
                                const isSelected = form.category === cat.id;
                                return (
                                    <div
                                        key={cat.id}
                                        className={`category-tile-btn ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleCategorySelect(cat.id)}
                                    >
                                        <div className="tile-icon-box">
                                            <IconComponent size={20} />
                                        </div>
                                        <span style={{ fontSize: '12.5px' }}>{cat.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Priority Selection Chips */}
                    <div className="form-group">
                        <label style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', marginBottom: '12px', display: 'block' }}>
                            2. Priority & SLA Target
                        </label>
                        <div className="priority-chip-row">
                            {PRIORITIES.map((p) => {
                                const isSelected = form.priority === p.id;
                                return (
                                    <div
                                        key={p.id}
                                        className={`priority-chip-btn ${p.colorClass} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handlePrioritySelect(p.id)}
                                    >
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{p.label}</div>
                                        <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.8 }}>{p.timeText}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Real-Time SLA Preview Box */}
                    <div className="sla-preview-callout">
                        <Clock size={22} style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                Enforced Resolution Deadline: {slaTarget.hours} Hours
                            </div>
                            <div style={{ fontSize: '12.5px', marginTop: '2px', opacity: 0.9 }}>
                                Target completion by: <strong>{slaTarget.formatted}</strong>. Automatic escalation triggers if deadline is breached.
                            </div>
                        </div>
                    </div>

                    {/* Block & House Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label>Assigned Block</label>
                            <select
                                className="form-select"
                                name="blockId"
                                value={form.blockId}
                                onChange={handleChange}
                                required
                                style={{ height: '46px' }}
                            >
                                <option value="">Select block...</option>
                                {blocks.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>House / Unit Number</label>
                            <input
                                className="form-input"
                                name="houseNumber"
                                placeholder="e.g. B-402"
                                value={form.houseNumber}
                                onChange={handleChange}
                                required
                                style={{ height: '46px' }}
                            />
                        </div>
                    </div>

                    {/* Headline & Description */}
                    <div className="form-group">
                        <label>Complaint Headline</label>
                        <input
                            className="form-input"
                            name="title"
                            placeholder="e.g. Main water valve leakage on 4th floor"
                            value={form.title}
                            onChange={handleChange}
                            required
                            minLength={5}
                            style={{ height: '46px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Detailed Description</label>
                        <textarea
                            className="form-textarea"
                            name="description"
                            placeholder="Provide specific location, floor number, and urgency details for faster supervisor dispatch..."
                            value={form.description}
                            onChange={handleChange}
                            required
                            minLength={10}
                            style={{ minHeight: '110px' }}
                        />
                    </div>

                    <div style={{ marginTop: '28px' }}>
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: 700 }}
                        >
                            {loading ? 'Submitting Resolution Request...' : (
                                <>
                                    <Send size={18} /> Submit Complaint & Start SLA Timer
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Sidebar Info Card */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                            <Building size={18} color="var(--primary)" /> Block Allocation
                        </h4>
                        {selectedBlock ? (
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{selectedBlock.name}</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                                    Jurisdiction Unit
                                </div>
                                {selectedBlock.supervisor ? (
                                    <div style={{ marginTop: '16px', color: '#059669', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', padding: '8px 12px', borderRadius: '10px' }}>
                                        <CheckCircle2 size={16} /> Block Lead Assigned ({selectedBlock.supervisor.fullName || 'Supervisor'})
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '16px', color: '#d97706', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: '#fef3c7', padding: '8px 12px', borderRadius: '10px' }}>
                                        <AlertCircle size={16} /> Unallocated Block (Direct Admin Supervision)
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: '#64748b', fontSize: '13px' }}>
                                Select a block to view its governance team.
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={16} color="var(--primary)" /> Resolution Best Practices
                        </h4>
                        <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                'Specify unit number & exact floor location.',
                                'Select category correctly to route to specialized team.',
                                'Choose priority accurately to trigger appropriate SLA timeline.',
                                'Use BharatFix Assistant chatbot anytime for status queries.'
                            ].map((guide, i) => (
                                <li key={i} style={{ fontSize: '13px', color: '#475569', display: 'flex', gap: '8px' }}>
                                    <ChevronRight size={14} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--primary)' }} /> {guide}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
