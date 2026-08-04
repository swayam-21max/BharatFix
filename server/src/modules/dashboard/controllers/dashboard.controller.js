const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../../../utils/response.formatter');

class DashboardController {
    async getStats(req, res, next) {
        try {
            const stats = await dashboardService.getStats(req.user);
            return successResponse(res, 200, 'Dashboard stats retrieved successfully', {
                role: req.user.role,
                ...stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();
