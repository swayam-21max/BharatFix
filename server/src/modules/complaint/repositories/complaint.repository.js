const prisma = require('../../../config/prisma');

class ComplaintRepository {
    async findBlockWithSupervisor(blockId) {
        return await prisma.block.findUnique({
            where: { id: blockId },
            include: { supervisor: true },
        });
    }

    async createWithHistory(complaintData, historyData) {
        return await prisma.$transaction(async (tx) => {
            const complaint = await tx.complaint.create({
                data: complaintData,
            });

            await tx.complaintStatusHistory.create({
                data: {
                    ...historyData,
                    complaintId: complaint.id,
                },
            });

            return complaint;
        });
    }

    async findById(id) {
        return await prisma.complaint.findUnique({
            where: { id },
            include: {
                block: { select: { id: true, name: true } },
                resident: { select: { fullName: true, email: true, houseNumber: true } },
                assignedTo: { select: { fullName: true, email: true, role: true } },
                statusHistory: {
                    include: {
                        changedBy: { select: { fullName: true, role: true } },
                    },
                    orderBy: { changedAt: 'desc' },
                },
                escalations: {
                    include: {
                        escalatedTo: { select: { fullName: true, role: true } },
                    },
                    orderBy: { escalatedAt: 'desc' },
                },
            },
        });
    }

    async findAll(filters) {
        const { blockId, status, startDate, endDate, residentId, assignedToId } = filters;
        const where = {};

        if (blockId) where.blockId = blockId;
        if (status) where.status = status;
        if (residentId) where.residentId = residentId;
        if (assignedToId) where.assignedToId = assignedToId;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        return await prisma.complaint.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                resident: { select: { fullName: true, email: true, houseNumber: true } },
                block: { select: { name: true } },
                assignedTo: { select: { fullName: true } }
            },
        });
    }

    async updateStatusWithHistory(complaintId, updateData, historyData) {
        return await prisma.$transaction(async (tx) => {
            const complaint = await tx.complaint.update({
                where: { id: complaintId },
                data: updateData,
            });

            await tx.complaintStatusHistory.create({
                data: {
                    ...historyData,
                    complaintId,
                },
            });

            return complaint;
        });
    }
}

module.exports = new ComplaintRepository();
