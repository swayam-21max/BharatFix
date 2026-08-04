/**
 * HTML Email Templates for BharatFix notifications
 */

const baseStyle = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
`;

const headerStyle = `
    background: linear-gradient(135deg, #1a237e, #283593);
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
`;

const bodyStyle = `
    background: white;
    padding: 24px;
    border-radius: 0 0 8px 8px;
    line-height: 1.6;
`;

const badgeStyle = (color) => `
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    background: ${color};
`;

const statusColors = {
    OPEN: '#2196F3',
    IN_PROGRESS: '#FF9800',
    RESOLVED: '#4CAF50',
    REJECTED: '#f44336',
    SLA_BREACHED: '#d32f2f',
};

const priorityColors = {
    LOW: '#8BC34A',
    MEDIUM: '#FF9800',
    HIGH: '#f44336',
    CRITICAL: '#b71c1c',
};

/**
 * Complaint created — sent to Supervisor
 */
const complaintCreated = ({ complaint, block, resident }) => ({
    subject: `🆕 New Complaint: ${complaint.title}`,
    html: `
        <div style="${baseStyle}">
            <div style="${headerStyle}">
                <h2 style="margin:0;">New Complaint Assigned</h2>
                <p style="margin:5px 0 0;opacity:0.9;">BharatFix Notification</p>
            </div>
            <div style="${bodyStyle}">
                <p>Hello,</p>
                <p>A new complaint has been assigned to you:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr><td style="padding:8px;color:#666;width:120px;">Title</td><td style="padding:8px;font-weight:600;">${complaint.title}</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px;color:#666;">Description</td><td style="padding:8px;">${complaint.description}</td></tr>
                    <tr><td style="padding:8px;color:#666;">Block</td><td style="padding:8px;">${block.name}</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px;color:#666;">Priority</td><td style="padding:8px;"><span style="${badgeStyle(priorityColors[complaint.priority])}">${complaint.priority}</span></td></tr>
                    <tr><td style="padding:8px;color:#666;">Filed By</td><td style="padding:8px;">${resident.name} (${resident.email})</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px;color:#666;">SLA Due</td><td style="padding:8px;font-weight:600;">${new Date(complaint.slaDueAt).toLocaleString()}</td></tr>
                </table>
                <p>Please take action before the SLA deadline.</p>
                <p style="color:#999;font-size:12px;margin-top:24px;">— BharatFix System</p>
            </div>
        </div>
    `,
});

/**
 * Complaint status changed — sent to Resident
 */
const complaintStatusChanged = ({ complaint, oldStatus, newStatus }) => ({
    subject: `📋 Complaint Update: ${complaint.title} → ${newStatus}`,
    html: `
        <div style="${baseStyle}">
            <div style="${headerStyle}">
                <h2 style="margin:0;">Complaint Status Updated</h2>
                <p style="margin:5px 0 0;opacity:0.9;">BharatFix Notification</p>
            </div>
            <div style="${bodyStyle}">
                <p>Hello,</p>
                <p>Your complaint has been updated:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr><td style="padding:8px;color:#666;width:120px;">Complaint</td><td style="padding:8px;font-weight:600;">${complaint.title}</td></tr>
                    <tr style="background:#f8f9fa;">
                        <td style="padding:8px;color:#666;">Status</td>
                        <td style="padding:8px;">
                            <span style="${badgeStyle(statusColors[oldStatus])}">${oldStatus}</span>
                            &nbsp;→&nbsp;
                            <span style="${badgeStyle(statusColors[newStatus])}">${newStatus}</span>
                        </td>
                    </tr>
                    ${newStatus === 'RESOLVED' ? `<tr><td style="padding:8px;color:#666;">Resolved At</td><td style="padding:8px;">${new Date().toLocaleString()}</td></tr>` : ''}
                </table>
                ${newStatus === 'RESOLVED' ? '<p>✅ Your complaint has been resolved. Thank you for using BharatFix!</p>' : ''}
                ${newStatus === 'REJECTED' ? '<p>Your complaint has been reviewed and could not be processed. If you believe this is incorrect, please file a new complaint with additional details.</p>' : ''}
                ${newStatus === 'IN_PROGRESS' ? '<p>Your complaint is now being worked on by the assigned supervisor.</p>' : ''}
                <p style="color:#999;font-size:12px;margin-top:24px;">— BharatFix System</p>
            </div>
        </div>
    `,
});

/**
 * SLA Breached — sent to Admin
 */
const complaintSLABreached = ({ complaint, block, supervisor }) => ({
    subject: `🚨 SLA BREACH: ${complaint.title}`,
    html: `
        <div style="${baseStyle}">
            <div style="${headerStyle.replace('#1a237e', '#b71c1c').replace('#283593', '#c62828')}">
                <h2 style="margin:0;">⚠️ SLA Breach Alert</h2>
                <p style="margin:5px 0 0;opacity:0.9;">Immediate Attention Required</p>
            </div>
            <div style="${bodyStyle}">
                <p>A complaint has breached its SLA deadline and has been escalated to you:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr><td style="padding:8px;color:#666;width:140px;">Complaint</td><td style="padding:8px;font-weight:600;">${complaint.title}</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px;color:#666;">Block</td><td style="padding:8px;">${block || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;color:#666;">Previous Status</td><td style="padding:8px;"><span style="${badgeStyle(statusColors[complaint.previousStatus] || '#999')}">${complaint.previousStatus}</span></td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px;color:#666;">Assigned To</td><td style="padding:8px;">${supervisor || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;color:#666;">SLA Deadline</td><td style="padding:8px;color:#d32f2f;font-weight:600;">${new Date(complaint.slaDueAt).toLocaleString()}</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:8px;color:#666;">Breached By</td><td style="padding:8px;color:#d32f2f;">${Math.round((Date.now() - new Date(complaint.slaDueAt).getTime()) / (1000 * 60 * 60))} hours</td></tr>
                </table>
                <p>Please investigate and take corrective action.</p>
                <p style="color:#999;font-size:12px;margin-top:24px;">— BharatFix Escalation System</p>
            </div>
        </div>
    `,
});

module.exports = {
    complaintCreated,
    complaintStatusChanged,
    complaintSLABreached,
};
