const blockService = require('../services/block.service');
const { successResponse } = require('../../../utils/response.formatter');

class BlockController {
    async create(req, res, next) {
        try {
            const block = await blockService.createBlock(req.body);
            return successResponse(res, 201, 'Block created successfully', block);
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const blocks = await blockService.listBlocks();
            return successResponse(res, 200, 'Blocks retrieved successfully', blocks);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const block = await blockService.getBlock(req.params.id);
            return successResponse(res, 200, 'Block retrieved successfully', block);
        } catch (error) {
            next(error);
        }
    }

    async assignSupervisor(req, res, next) {
        try {
            const block = await blockService.assignSupervisor(req.params.id, req.body.supervisorId);
            return successResponse(res, 200, 'Supervisor assigned successfully', block);
        } catch (error) {
            next(error);
        }
    }

    async removeSupervisor(req, res, next) {
        try {
            await blockService.removeSupervisor(req.params.id);
            return successResponse(res, 200, 'Supervisor removed successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BlockController();
