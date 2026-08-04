const prisma = require('../../../config/prisma');

class EscalationRepository {
    async create(data) {
        return await prisma.escalation.create({
            data,
            include: {
                complaint: { select: { title: true } },
                escalatedTo: { select: { fullName: true, email: true } },
            },
        });
    }

    async findByComplaintId(complaintId) {
        return await prisma.escalation.findMany({
            where: { complaintId },
            include: {
                escalatedTo: { select: { fullName: true, role: true } },
            },
            orderBy: { escalatedAt: 'desc' },
        });
    }

    async findAll(filters = {}) {
        return await prisma.escalation.findMany({
            where: filters,
            include: {
                complaint: { select: { title: true, status: true } },
                escalatedTo: { select: { fullName: true, role: true } },
            },
            orderBy: { escalatedAt: 'desc' },
        });
    }
}

module.exports = new EscalationRepository();
