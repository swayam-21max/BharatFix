const prisma = require('../config/prisma');
const { sendEmail } = require('./email.provider');
const templates = require('./email.templates');
const logger = require('../config/logger');

class NotificationService {
    /**
     * Notify supervisor about a new complaint
     */
    async onComplaintCreated(data) {
        try {
            const { complaint, block, supervisorId, residentId } = data;

            // Fetch supervisor and resident details
            const [supervisor, resident] = await Promise.all([
                prisma.user.findUnique({ where: { id: supervisorId }, select: { email: true, name: true } }),
                prisma.user.findUnique({ where: { id: residentId }, select: { email: true, name: true } }),
            ]);

            if (!supervisor) {
                logger.warn('⚠️ Notification skipped: supervisor not found');
                return;
            }

            const { subject, html } = templates.complaintCreated({
                complaint,
                block,
                resident: resident || { name: 'Unknown', email: 'N/A' },
            });

            await sendEmail({ to: supervisor.email, subject, html });
        } catch (error) {
            logger.error('❌ Notification error (complaint created):', error.message);
        }
    }

    /**
     * Notify resident about complaint status change
     */
    async onComplaintStatusChanged(data) {
        try {
            const { complaint, oldStatus, newStatus, residentId } = data;

            const resident = await prisma.user.findUnique({
                where: { id: residentId },
                select: { email: true, name: true },
            });

            if (!resident) {
                logger.warn('⚠️ Notification skipped: resident not found');
                return;
            }

            const { subject, html } = templates.complaintStatusChanged({
                complaint,
                oldStatus,
                newStatus,
            });

            await sendEmail({ to: resident.email, subject, html });
        } catch (error) {
            logger.error('❌ Notification error (status changed):', error.message);
        }
    }

    /**
     * Notify admin about SLA breach
     */
    async onSLABreached(data) {
        try {
            const { complaint, adminEmail, block, supervisor } = data;

            if (!adminEmail) {
                logger.warn('⚠️ Notification skipped: no admin email');
                return;
            }

            const { subject, html } = templates.complaintSLABreached({
                complaint,
                block,
                supervisor,
            });

            await sendEmail({ to: adminEmail, subject, html });
        } catch (error) {
            logger.error('❌ Notification error (SLA breached):', error.message);
        }
    }
}

module.exports = new NotificationService();
