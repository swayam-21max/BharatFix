const prisma = require('../../../config/prisma');

// Domain Knowledge & FAQ Items
const FAQ_LIST = [
    {
        id: 'file_complaint',
        question: 'How do I file or lodge a complaint?',
        category: 'Complaints',
        answer: 'To lodge a new complaint, click on "New Complaint" in the left sidebar menu. Select your complaint category (e.g., Water, Electricity, Sanitation), enter your house number, add a clear description, select priority, and optionally upload a photo and location coordinates.'
    },
    {
        id: 'track_status',
        question: 'How do I check or track my complaint status?',
        category: 'Complaints',
        answer: 'You can check your active complaints in the "My Complaints" section. You can also paste your Complaint ID or title right here in this chat, and I will fetch live updates for you!'
    },
    {
        id: 'sla_timelines',
        question: 'What are the SLA resolution timelines?',
        category: 'SLA & Timelines',
        answer: 'BharatFix enforces strict SLA resolution deadlines based on priority:\n• Critical: 4 Hours\n• High: 12 Hours\n• Medium: 24 Hours\n• Low: 48 Hours\nIf a complaint exceeds its SLA timer, it automatically triggers system escalation.'
    },
    {
        id: 'escalation_process',
        question: 'How does the escalation system work?',
        category: 'Escalations',
        answer: 'BharatFix uses a 3-Tier Escalation system:\n• Level 1: Assigned Block Supervisor\n• Level 2: Escalated to Admin oversight upon SLA warning\n• Level 3: Critical SLA breach auto-escalated to Super Admin with governance logging.'
    },
    {
        id: 'account_approvals',
        question: 'Why is my account pending approval?',
        category: 'Account',
        answer: 'Resident accounts are approved instantly upon registration. Block Head / Supervisor accounts require manual verification and approval by a System Administrator before access is granted.'
    },
    {
        id: 'supported_categories',
        question: 'What categories of issues can I report?',
        category: 'Services',
        answer: 'You can report issues across several categories:\n• Water Supply & Drainage\n• Electricity & Power Outages\n• Sanitation & Waste Management\n• Roads, Potholes & Infrastructure\n• Security & Street Lighting\n• General Building Maintenance'
    }
];

/**
 * Helper to search complaint status in DB if text contains an ID or query
 */
async function searchComplaintInDb(queryText) {
    try {
        // Extract potential UUID or search terms
        const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
        const uuidMatch = queryText.match(uuidRegex);

        let complaint = null;

        if (uuidMatch) {
            complaint = await prisma.complaint.findUnique({
                where: { id: uuidMatch[0] },
                include: {
                    block: { select: { name: true } },
                    assignedTo: { select: { fullName: true } }
                }
            });
        } else {
            // Check if user entered words like "complaint" followed by a short term or title
            const cleaned = queryText.replace(/complaint|status|track|id|#|\?/gi, '').trim();
            if (cleaned.length >= 3) {
                complaint = await prisma.complaint.findFirst({
                    where: {
                        OR: [
                            { id: { startsWith: cleaned } },
                            { title: { contains: cleaned, mode: 'insensitive' } }
                        ]
                    },
                    include: {
                        block: { select: { name: true } },
                        assignedTo: { select: { fullName: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }
        }

        if (complaint) {
            const assigned = complaint.assignedTo ? complaint.assignedTo.fullName : 'Unassigned (Pending Allocation)';
            const timeDiff = new Date(complaint.slaDueAt) - new Date();
            const hoursLeft = Math.round(timeDiff / (1000 * 60 * 60));
            const slaStatusStr = hoursLeft < 0 
                ? `⚠️ SLA BREACHED (${Math.abs(hoursLeft)} hrs overdue)`
                : `⏳ ${hoursLeft} hrs remaining`;

            return `📋 **Complaint Found!**\n` +
                `• **Title**: ${complaint.title}\n` +
                `• **ID**: \`${complaint.id}\`\n` +
                `• **Status**: ${complaint.status}\n` +
                `• **Priority**: ${complaint.priority}\n` +
                `• **Block**: ${complaint.block?.name || 'N/A'}\n` +
                `• **Assigned Supervisor**: ${assigned}\n` +
                `• **Escalation Level**: Level ${complaint.escalationLevel}\n` +
                `• **SLA Deadline**: ${slaStatusStr}`;
        }
    } catch (err) {
        console.error('Error fetching complaint for chatbot:', err.message);
    }
    return null;
}

/**
 * Handle incoming chatbot query
 */
exports.handleQuery = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide a valid question or query string.'
            });
        }

        const query = message.toLowerCase().trim();

        // 1. Check if user is asking for specific complaint status/ID lookup
        if (query.includes('status') || query.includes('track') || query.includes('complaint') || query.match(/[0-9a-fA-F-]{6,}/)) {
            const dbMatchResult = await searchComplaintInDb(message);
            if (dbMatchResult) {
                return res.status(200).json({
                    status: 'success',
                    data: {
                        reply: dbMatchResult,
                        type: 'complaint_lookup',
                        relatedQuestions: ['How do I file a new complaint?', 'What are the SLA timelines?']
                    }
                });
            }
        }

        // 2. Keyword NLP matching against domain FAQs
        let bestMatch = null;

        if (query.includes('file') || query.includes('lodge') || query.includes('create') || query.includes('submit') || query.includes('report') || query.includes('new complaint')) {
            bestMatch = FAQ_LIST.find(f => f.id === 'file_complaint');
        } else if (query.includes('sla') || query.includes('time') || query.includes('timeline') || query.includes('hours') || query.includes('duration') || query.includes('deadline')) {
            bestMatch = FAQ_LIST.find(f => f.id === 'sla_timelines');
        } else if (query.includes('escalat') || query.includes('level') || query.includes('breach')) {
            bestMatch = FAQ_LIST.find(f => f.id === 'escalation_process');
        } else if (query.includes('approval') || query.includes('pending') || query.includes('register') || query.includes('account') || query.includes('role')) {
            bestMatch = FAQ_LIST.find(f => f.id === 'account_approvals');
        } else if (query.includes('category') || query.includes('categories') || query.includes('type') || query.includes('water') || query.includes('electricity') || query.includes('sanitation') || query.includes('road')) {
            bestMatch = FAQ_LIST.find(f => f.id === 'supported_categories');
        } else if (query.includes('track') || query.includes('status') || query.includes('check')) {
            bestMatch = FAQ_LIST.find(f => f.id === 'track_status');
        }

        if (bestMatch) {
            return res.status(200).json({
                status: 'success',
                data: {
                    reply: bestMatch.answer,
                    type: 'faq',
                    category: bestMatch.category,
                    relatedQuestions: FAQ_LIST.filter(f => f.id !== bestMatch.id).slice(0, 3).map(f => f.question)
                }
            });
        }

        // 3. Friendly Default Response with interactive suggestions
        const defaultReply = `I'm the **BharatFix Assistant**! 🤖\n\nI can help you with:\n` +
            `• Lodging and tracking complaints\n` +
            `• Checking SLA resolution timelines\n` +
            `• Understanding multi-tier escalation rules\n` +
            `• Account approvals and block information\n\n` +
            `You can select one of the quick questions below or type your query (or paste a Complaint ID to check its status)!`;

        return res.status(200).json({
            status: 'success',
            data: {
                reply: defaultReply,
                type: 'general',
                relatedQuestions: [
                    'How do I file or lodge a complaint?',
                    'What are the SLA resolution timelines?',
                    'How does the escalation system work?',
                    'What categories of issues can I report?'
                ]
            }
        });

    } catch (error) {
        console.error('Chatbot Controller Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while processing your question.'
        });
    }
};

/**
 * Get FAQ list
 */
exports.getFaqs = (req, res) => {
    return res.status(200).json({
        status: 'success',
        data: {
            faqs: FAQ_LIST
        }
    });
};
