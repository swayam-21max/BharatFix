const adminService = require('../services/admin.service');
const { successResponse } = require('../../../utils/response.formatter');

class AdminController {
    /**
     * Get pending block head registrations
     */
    async getPendingApprovals(req, res, next) {
        try {
            const pending = await adminService.getPendingBlockHeads();
            return successResponse(res, 200, 'Pending approvals fetched successfully', pending);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve a block head
     */
    async approve(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await adminService.approveBlockHead(req.user.id, userId);
            return successResponse(res, 200, 'Block Head approved successfully', user);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject a block head
     */
    async reject(req, res, next) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;
            const user = await adminService.rejectBlockHead(req.user.id, userId, reason);
            return successResponse(res, 200, 'Block Head registration rejected', user);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get admin global statistics
     */
    async getStats(req, res, next) {
        try {
            const stats = await adminService.getGlobalStats();
            return successResponse(res, 200, 'Admin global statistics fetched', stats);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
