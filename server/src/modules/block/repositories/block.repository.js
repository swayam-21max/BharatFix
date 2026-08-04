const prisma = require('../../../config/prisma');

class BlockRepository {
    async create(data) {
        return await prisma.block.create({
            data,
        });
    }

    async findAll() {
        return await prisma.block.findMany({
            include: {
                supervisor: {
                    select: { id: true, fullName: true, email: true },
                },
                _count: {
                    select: { complaints: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findById(id) {
        return await prisma.block.findUnique({
            where: { id },
            include: {
                supervisor: {
                    select: { id: true, fullName: true, email: true },
                },
                complaints: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        createdAt: true,
                        resident: { select: { fullName: true } },
                    },
                },
                _count: {
                    select: { complaints: true },
                },
            },
        });
    }

    async findByName(name) {
        return await prisma.block.findUnique({
            where: { name },
        });
    }

    async assignSupervisor(blockId, supervisorId) {
        return await prisma.block.update({
            where: { id: blockId },
            data: { supervisorId },
            include: {
                supervisor: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });
    }

    async removeSupervisor(blockId) {
        return await prisma.block.update({
            where: { id: blockId },
            data: { supervisorId: null },
        });
    }

    async findBlocksBySupervisor(supervisorId) {
        return await prisma.block.findMany({
            where: { supervisorId },
        });
    }
}

module.exports = new BlockRepository();
