const prisma = require('../../../config/prisma');
const { AppError } = require('../../../middleware/error.handler');

class AdminService {
    /**
     * Get all users pending Block Head approval
     */
    async getPendingBlockHeads() {
        return await prisma.user.findMany({
            where: {
                role: 'BLOCK_HEAD',
                approvalStatus: 'PENDING',
            },
            include: {
                block: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Approve a Block Head request
     */
    async approveBlockHead(adminId, targetUserId) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: targetUserId } });

            if (!user) throw new AppError('User not found', 404);
            if (user.role !== 'BLOCK_HEAD') throw new AppError('User is not a Block Head candidate', 400);

            const updatedUser = await tx.user.update({
                where: { id: targetUserId },
                data: {
                    isApproved: true,
                    approvalStatus: 'APPROVED',
                }
            });

            // Log the action
            await tx.governanceAudit.create({
                data: {
                    action: 'BLOCK_HEAD_APPROVED',
                    details: `Admin approved Block Head registration for ${user.email}`,
                    actorId: adminId,
                    targetUserId: targetUserId
                }
            });

            return updatedUser;
        });
    }

    /**
     * Reject a Block Head request
     */
    async rejectBlockHead(adminId, targetUserId, reason) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: targetUserId } });

            if (!user) throw new AppError('User not found', 404);

            const updatedUser = await tx.user.update({
                where: { id: targetUserId },
                data: {
                    isApproved: false,
                    approvalStatus: 'REJECTED',
                }
            });

            // Log the action
            await tx.governanceAudit.create({
                data: {
                    action: 'BLOCK_HEAD_REJECTED',
                    details: `Admin rejected Block Head registration for ${user.email}. Reason: ${reason || 'Not specified'}`,
                    actorId: adminId,
                    targetUserId: targetUserId
                }
            });

            return updatedUser;
        });
    }

    /**
     * Global KPIs for Admin
     */
    async getGlobalStats() {
        const [
            totalComplaints,
            pendingApprovals,
            activeBlockHeads,
            resolvedComplaints,
            escalatedComplaints
        ] = await Promise.all([
            prisma.complaint.count(),
            prisma.user.count({ where: { role: 'BLOCK_HEAD', approvalStatus: 'PENDING' } }),
            prisma.user.count({ where: { role: 'BLOCK_HEAD', isApproved: true } }),
            prisma.complaint.count({ where: { status: 'RESOLVED' } }),
            prisma.complaint.count({ where: { status: 'ESCALATED' } })
        ]);

        const resolutionRate = totalComplaints > 0
            ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
            : 0;

        return {
            totalComplaints,
            pendingApprovals,
            activeBlockHeads,
            resolutionRate,
            escalatedComplaints
        };
    }
}

module.exports = new AdminService();
