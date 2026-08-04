const prisma = require('../../../config/prisma');

class UserRepository {
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                blockSupervisorOf: { select: { id: true, name: true } },
                block: { select: { id: true, name: true } }
            },
        });
    }

    async findAll(filters = {}) {
        const { role, search, approvalStatus, blockId, page = 1, limit = 20 } = filters;
        const where = {};

        if (role) where.role = role;
        if (approvalStatus) where.approvalStatus = approvalStatus;
        if (blockId) where.blockId = blockId;

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    houseNumber: true,
                    approvalStatus: true,
                    isApproved: true,
                    createdAt: true,
                    block: { select: { name: true } },
                    blockSupervisorOf: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateProfile(id, data) {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async updatePassword(id, passwordHash) {
        return await prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
    }

    async updateRole(id, role) {
        return await prisma.user.update({
            where: { id },
            data: { role },
        });
    }

    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }
}

module.exports = new UserRepository();
