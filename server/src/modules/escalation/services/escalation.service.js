const escalationRepository = require('../repositories/escalation.repository');
const prisma = require('../../../config/prisma');
const { AppError } = require('../../../middleware/error.handler');
const logger = require('../../../config/logger');

class EscalationService {
    async triggerEscalation(complaintId, reason) {
        // 1. Find an Admin to escalate to (can be expanded to find block-specific admins)
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (!admin) {
            logger.warn('⚠️ No ADMIN found for escalation. Recording escalation without recipient assignment if possible.');
            // Still create record if possible or throw
        }

        const escalation = await escalationRepository.create({
            complaintId,
            reason,
            escalatedToId: admin?.id,
        });

        logger.info(`🚨 Formal escalation created for complaint ${complaintId} to ${admin?.name || 'Unassigned'}`);
        return escalation;
    }

    async getComplaintEscalations(complaintId) {
        return await escalationRepository.findByComplaintId(complaintId);
    }
}

module.exports = new EscalationService();
