const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter = null;

/**
 * Initialize email transporter
 * Falls back to console logging if SMTP is not configured
 */
const initTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        logger.info('📧 SMTP not configured — emails will be logged to console');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    logger.info(`📧 Email transport initialized (${SMTP_HOST}:${SMTP_PORT || 587})`);
    return transporter;
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    const fromAddress = process.env.SMTP_FROM || 'noreply@bharatfix.in';

    if (!transporter) {
        // Fallback: log to console
        logger.info('━━━━━━━━━━━━━━ EMAIL (console fallback) ━━━━━━━━━━━━━━');
        logger.info(`To:      ${to}`);
        logger.info(`Subject: ${subject}`);
        logger.info(`Body:    ${html.replace(/<[^>]+>/g, ' ').substring(0, 200)}...`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { logged: true };
    }

    try {
        const info = await transporter.sendMail({
            from: `"BharatFix" <${fromAddress}>`,
            to,
            subject,
            html,
        });
        logger.info(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
        // Don't throw — email failure should not crash the app
        return null;
    }
};

module.exports = { initTransporter, sendEmail };
