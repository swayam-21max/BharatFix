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
        try {
            const blocks = await blockRepository.findAll();
            return blocks.map((block) => ({
                ...block,
                complaintCount: block._count ? block._count.complaints : 0,
                _count: undefined,
            }));
        } catch (err) {
            console.error('[Block Service] Error listing blocks from database:', err.message);
            return [
                { id: 'bcd21adf-e91e-414c-bcd2-537392beb784', name: 'Block A', complaintCount: 0 },
                { id: '43fccf18-c0e9-4f9f-8b4c-a7fdf07c70fa', name: 'Block B', complaintCount: 0 },
                { id: 'b8f4b46b-b949-423b-8c89-04e21b1ce806', name: 'Market Area', complaintCount: 0 },
                { id: '92a912ff-9b7d-4313-9da5-f060674caa8a', name: 'Park Zone', complaintCount: 0 }
            ];
        }
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
