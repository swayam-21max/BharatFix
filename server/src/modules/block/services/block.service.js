const blockRepository = require('../repositories/block.repository');
const { AppError } = require('../../../middleware/error.handler');
const prisma = require('../../../config/prisma');

class BlockService {
    async createBlock(data) {
        // Check unique name
        const existing = await blockRepository.findByName(data.name);
        if (existing) {
            throw new AppError('A block with this name already exists', 400);
        }

        return await blockRepository.create(data);
    }

    async listBlocks() {
        const blocks = await blockRepository.findAll();
        // Transform _count for cleaner API response
        return blocks.map((block) => ({
            ...block,
            complaintCount: block._count.complaints,
            _count: undefined,
        }));
    }

    async getBlock(id) {
        const block = await blockRepository.findById(id);
        if (!block) throw new AppError('Block not found', 404);

        return {
            ...block,
            complaintCount: block._count.complaints,
            _count: undefined,
        };
    }

    async assignSupervisor(blockId, supervisorId) {
        // 1. Verify block exists
        const block = await blockRepository.findById(blockId);
        if (!block) throw new AppError('Block not found', 404);

        // 2. Verify user exists and has supervisor-capable role (ADMIN or SUPERVISOR)
        const user = await prisma.user.findUnique({
            where: { id: supervisorId },
        });
        if (!user) throw new AppError('User not found', 404);
        if (user.role !== 'BLOCK_HEAD' && user.role !== 'SUPERVISOR' && user.role !== 'ADMIN') {
            throw new AppError('User must have BLOCK_HEAD, SUPERVISOR or ADMIN role to be assigned to a block', 400);
        }

        // 3. (REMOVED) Check if supervisor is already assigned - Master supervisors allowed
        return await blockRepository.assignSupervisor(blockId, supervisorId);
    }

    async removeSupervisor(blockId) {
        const block = await blockRepository.findById(blockId);
        if (!block) throw new AppError('Block not found', 404);

        if (!block.supervisorId) {
            throw new AppError('This block has no supervisor assigned', 400);
        }

        await blockRepository.removeSupervisor(blockId);
        return true;
    }
}

module.exports = new BlockService();
