const logger = require('../config/logger');

/**
 * BharatFix WhatsApp Notification Service
 * Sends real-time WhatsApp updates for registration, complaint creation,
 * status changes, and SLA breach escalations.
 */

// Helper to sanitize & format phone numbers to standard E.164 (default +91 for India if 10 digits)
function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return null;

    if (!cleaned.startsWith('+')) {
        if (cleaned.length === 10) {
            cleaned = `+91${cleaned}`;
        } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
            cleaned = `+${cleaned}`;
        }
    }
    return cleaned;
}

/**
 * Core Dispatcher
 */
async function sendWhatsAppNotification({ to, text, type = 'GENERAL' }) {
    const formattedPhone = formatPhoneNumber(to);
    if (!formattedPhone) {
        logger.warn(`[WhatsApp Service] Invalid or missing phone number: "${to}". Skipping dispatch.`);
        return { success: false, reason: 'Invalid phone number' };
    }

    const payload = {
        to: formattedPhone,
        text,
        timestamp: new Date().toISOString(),
        type
    };

    // Log the dispatched WhatsApp message for audit tracking
    console.log(`\n======================================================`);
    console.log(`📱 [WHATSAPP DISPATCH] Type: ${type}`);
    console.log(`📞 To: ${formattedPhone}`);
    console.log(`💬 Message:\n${text}`);
    console.log(`======================================================\n`);

    logger.info(`[WhatsApp Service] Dispatched ${type} alert to ${formattedPhone}`);

    // If Twilio / External Provider environment variables exist, hit external API
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
        try {
            const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: text,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${formattedPhone}`
            });
            logger.info(`[WhatsApp Service] Successfully delivered via Twilio to ${formattedPhone}`);
        } catch (err) {
            logger.error(`[WhatsApp Service] Twilio delivery error: ${err.message}`);
        }
    }

    return { success: true, payload };
}

/**
 * 1. Welcome WhatsApp on User Registration
 */
async function sendRegistrationWhatsApp(user) {
    if (!user.phoneNumber) return;
    const text = `👋 *Welcome to BharatFix, ${user.fullName || 'Resident'}!*

Your account has been registered successfully.
📍 *Role:* ${user.role}
🏠 *Unit:* ${user.houseNumber || 'N/A'}

You can now file civic complaints, track live SLA resolution timers, and receive instant WhatsApp updates.`;

    return sendWhatsAppNotification({ to: user.phoneNumber, text, type: 'REGISTRATION' });
}

/**
 * 2. New Complaint Filed Notification
 */
async function sendComplaintCreatedWhatsApp(complaint, user, blockName) {
    const phone = user?.phoneNumber || complaint.resident?.phoneNumber;
    if (!phone) return;

    const dueFormatted = complaint.slaDueAt
        ? new Date(complaint.slaDueAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : 'SLA Enforced';

    const text = `📢 *BharatFix Complaint Filed*

Hello *${user?.fullName || 'Resident'}*, your resolution request has been logged!

🆔 *Complaint ID:* #${complaint.id.slice(0, 8)}
📝 *Headline:* ${complaint.title}
🏢 *Block:* ${blockName || 'Jurisdiction Block'} | *Unit:* ${complaint.houseNumber}
⚡ *Priority:* ${complaint.priority}
⏱️ *SLA Target:* ${dueFormatted}

Our automated routing engine has assigned this to your Block Lead.`;

    return sendWhatsAppNotification({ to: phone, text, type: 'COMPLAINT_CREATED' });
}

/**
 * 3. Complaint Status / Comment Update Notification
 */
async function sendComplaintStatusWhatsApp(complaint, user, newStatus, comment) {
    const phone = user?.phoneNumber || complaint.resident?.phoneNumber;
    if (!phone) return;

    const statusEmojis = {
        IN_PROGRESS: '⚙️',
        RESOLVED: '✅',
        REJECTED: '❌',
        ESCALATED: '🚨',
        OPEN: '📩'
    };

    const emoji = statusEmojis[newStatus] || '🔔';
    const statusText = newStatus.replace('_', ' ');

    let text = `${emoji} *BharatFix Complaint Update*

Hello *${user?.fullName || 'Resident'}*, your complaint *#${complaint.id.slice(0, 8)}* ('${complaint.title}') has been updated.

📌 *New Status:* *${statusText}*`;

    if (comment) {
        text += `\n💬 *Supervisor Note:* "${comment}"`;
    }

    if (newStatus === 'RESOLVED') {
        text += `\n\n🎉 Thank you for helping keep our society maintained!`;
    }

    return sendWhatsAppNotification({ to: phone, text, type: 'STATUS_UPDATE' });
}

/**
 * 4. SLA Breach / Escalation Notification
 */
async function sendEscalationWhatsApp(complaint, user) {
    const phone = user?.phoneNumber || complaint.resident?.phoneNumber;
    if (!phone) return;

    const text = `🚨 *BharatFix SLA Escalation Alert*

Hello *${user?.fullName || 'Resident'}*, complaint *#${complaint.id.slice(0, 8)}* ('${complaint.title}') has exceeded its target SLA resolution time.

⚡ *Action Taken:* Automatically escalated to Level ${complaint.escalationLevel || 2} (System Admin & Block Oversight). Priority is now set to URGENT.`;

    return sendWhatsAppNotification({ to: phone, text, type: 'SLA_ESCALATION' });
}

module.exports = {
    sendWhatsAppNotification,
    sendRegistrationWhatsApp,
    sendComplaintCreatedWhatsApp,
    sendComplaintStatusWhatsApp,
    sendEscalationWhatsApp
};
