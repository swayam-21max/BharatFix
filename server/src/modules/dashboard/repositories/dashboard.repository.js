const prisma = require('../../../config/prisma');

class DashboardRepository {
    /**
     * System-wide stats for Admin
     */
    async getAdminStats() {
        const [
            totalComplaints,
            statusCounts,
            priorityCounts,
            blockStats,
            recentComplaints,
            totalUsers,
            slaBreachedCount,
            recentEscalations,
        ] = await Promise.all([
            // Total complaints
            prisma.complaint.count(),

            // Count by status
            prisma.complaint.groupBy({
                by: ['status'],
                _count: { _all: true },
            }),

            // Count by priority
            prisma.complaint.groupBy({
                by: ['priority'],
                _count: { _all: true },
            }),

            // Count per block
            prisma.complaint.groupBy({
                by: ['blockId'],
                _count: { _all: true },
            }),

            // Recent 10 complaints
            prisma.complaint.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    createdAt: true,
                    block: { select: { name: true } },
                    resident: { select: { fullName: true } },
                },
            }),

            // Total users
            prisma.user.count(),

            // SLA breached count
            prisma.complaint.count({
                where: { status: 'SLA_BREACHED' },
            }),

            // Recent escalations
            prisma.escalation.findMany({
                orderBy: { escalatedAt: 'desc' },
                take: 5,
                include: {
                    complaint: { select: { title: true } },
                    escalatedTo: { select: { fullName: true } },
                },
            }),
        ]);

        // Calculate resolution time average
        const resolvedComplaints = await prisma.complaint.findMany({
            where: { status: 'RESOLVED', resolvedAt: { not: null } },
            select: { createdAt: true, resolvedAt: true },
        });

        let avgResolutionHours = 0;
        if (resolvedComplaints.length > 0) {
            const totalHours = resolvedComplaints.reduce((sum, c) => {
                return sum + (c.resolvedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
            }, 0);
            avgResolutionHours = Math.round((totalHours / resolvedComplaints.length) * 10) / 10;
        }

        // SLA compliance rate
        const resolvedCount = statusCounts.find((s) => s.status === 'RESOLVED')?._count._all || 0;
        const slaComplianceRate = totalComplaints > 0
            ? Math.round(((resolvedCount / (resolvedCount + slaBreachedCount)) * 100) * 10) / 10
            : 100;

        // Enrich block stats with names
        const blocks = await prisma.block.findMany({ select: { id: true, name: true } });
        const blockMap = Object.fromEntries(blocks.map((b) => [b.id, b.name]));
        const enrichedBlockStats = blockStats.map((bs) => ({
            blockId: bs.blockId,
            blockName: blockMap[bs.blockId] || 'Unknown',
            complaintCount: bs._count._all,
        }));

        return {
            overview: {
                totalComplaints,
                totalUsers,
                slaBreachedCount,
                slaComplianceRate,
                avgResolutionHours,
            },
            byStatus: statusCounts.map((s) => ({
                status: s.status,
                count: s._count._all,
            })),
            byPriority: priorityCounts.map((p) => ({
                priority: p.priority,
                count: p._count._all,
            })),
            byBlock: enrichedBlockStats,
            recentComplaints,
            recentEscalations: recentEscalations.map(re => ({
                id: re.id,
                complaintId: re.complaintId,
                complaintTitle: re.complaint.title,
                reason: re.reason,
                escalatedTo: re.escalatedTo?.fullName,
                escalatedAt: re.escalatedAt
            })),
        };
    }

    /**
     * Stats for a Supervisor's assigned block
     */
    async getSupervisorStats(supervisorId) {
        const block = await prisma.block.findFirst({
            where: { supervisorId },
        });

        if (!block) return null;

        const [
            totalComplaints,
            statusCounts,
            priorityCounts,
            recentComplaints,
        ] = await Promise.all([
            prisma.complaint.count({
                where: { assignedToId: supervisorId },
            }),

            prisma.complaint.groupBy({
                by: ['status'],
                where: { assignedToId: supervisorId },
                _count: { _all: true },
            }),

            prisma.complaint.groupBy({
                by: ['priority'],
                where: { assignedToId: supervisorId },
                _count: { _all: true },
            }),

            prisma.complaint.findMany({
                where: { assignedToId: supervisorId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    slaDueAt: true,
                    createdAt: true,
                    resident: { select: { fullName: true } },
                },
            }),
        ]);

        const pending = statusCounts
            .filter((s) => ['OPEN', 'IN_PROGRESS'].includes(s.status))
            .reduce((sum, s) => sum + s._count._all, 0);

        return {
            block: { id: block.id, name: block.name },
            overview: {
                totalComplaints,
                pendingComplaints: pending,
            },
            byStatus: statusCounts.map((s) => ({
                status: s.status,
                count: s._count._all,
            })),
            byPriority: priorityCounts.map((p) => ({
                priority: p.priority,
                count: p._count._all,
            })),
            recentComplaints,
        };
    }

    /**
     * Stats for a Resident's own complaints
     */
    async getResidentStats(residentId) {
        const [
            totalComplaints,
            statusCounts,
            recentComplaints,
        ] = await Promise.all([
            prisma.complaint.count({
                where: { residentId },
            }),

            prisma.complaint.groupBy({
                by: ['status'],
                where: { residentId },
                _count: { _all: true },
            }),

            prisma.complaint.findMany({
                where: { residentId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    slaDueAt: true,
                    createdAt: true,
                    resolvedAt: true,
                    block: { select: { name: true } },
                },
            }),
        ]);

        const pending = statusCounts
            .filter((s) => ['OPEN', 'IN_PROGRESS'].includes(s.status))
            .reduce((sum, s) => sum + s._count._all, 0);

        const resolved = statusCounts
            .find((s) => s.status === 'RESOLVED')?._count._all || 0;

        return {
            overview: {
                totalComplaints,
                pendingComplaints: pending,
                resolvedComplaints: resolved,
            },
            byStatus: statusCounts.map((s) => ({
                status: s.status,
                count: s._count._all,
            })),
            recentComplaints,
        };
    }
}

module.exports = new DashboardRepository();
