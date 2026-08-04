const prisma = require('../config/prisma');
const logger = require('../config/logger');
const eventBus = require('../events/event.bus');
const EVENT_TYPES = require('../events/event.types');
const escalationService = require('../modules/escalation/services/escalation.service');

/**
 * SLA Checker Job
 * Finds and escalates complaints that have breached their SLA
 */
const checkSLAViolations = async () => {
    try {
        const now = new Date();

        // 1. Find complaints that are breached but not yet marked as SLA_BREACHED
        const breachedComplaints = await prisma.complaint.findMany({
            where: {
                status: { in: ['OPEN', 'IN_PROGRESS'] },
                slaDueAt: { lt: now },
            },
            include: {
                escalations: true,
                block: { select: { name: true } },
                assignedTo: { select: { fullName: true, email: true } },
            },
        });

        if (breachedComplaints.length === 0) {
            return;
        }

        logger.info(`📜 Found ${breachedComplaints.length} breached complaints. Processing escalations...`);

        // 2. Find an Admin to escalate to (for now, just the first admin)
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (!admin) {
            logger.warn('⚠️ No ADMIN user found for escalation.');
            return;
        }

        for (const complaint of breachedComplaints) {
            // Prevent duplicate escalation if one already exists
            if (complaint.escalations.length > 0) continue;

            await prisma.$transaction(async (tx) => {
                // Update status
                await tx.complaint.update({
                    where: { id: complaint.id },
                    data: { status: 'SLA_BREACHED' },
                });

                // Log history
                await tx.complaintStatusHistory.create({
                    data: {
                        complaintId: complaint.id,
                        oldStatus: complaint.status,
                        newStatus: 'SLA_BREACHED',
                        changedById: admin.id,
                    },
                });

                // Record Escalation via Service logic
                await escalationService.triggerEscalation(
                    complaint.id,
                    `SLA Breached (Due at: ${complaint.slaDueAt.toISOString()})`
                );
            });

            // Emit event — notify admin
            eventBus.publish(EVENT_TYPES.COMPLAINT_SLA_BREACHED, {
                complaint: {
                    id: complaint.id,
                    title: complaint.title,
                    slaDueAt: complaint.slaDueAt,
                    previousStatus: complaint.status,
                },
                block: complaint.block?.name || 'N/A',
                supervisor: complaint.assignedTo?.fullName || 'Unassigned',
                adminEmail: admin.email,
            });

            logger.info(`🚨 Escalated complaint ${complaint.id} to ADMIN`);
        }
    } catch (error) {
        logger.error('❌ Error in SLA Checker Job:', error);
    }
};

module.exports = { checkSLAViolations };
