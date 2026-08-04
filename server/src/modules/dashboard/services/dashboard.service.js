const dashboardRepository = require('../repositories/dashboard.repository');
const { AppError } = require('../../../middleware/error.handler');

class DashboardService {
    async getStats(user) {
        switch (user.role) {
            case 'ADMIN':
                return await dashboardRepository.getAdminStats();

            case 'BLOCK_HEAD':
            case 'SUPERVISOR':
                const supervisorStats = await dashboardRepository.getSupervisorStats(user.id);
                if (!supervisorStats) {
                    // Fallback to empty block stats if not assigned
                    return {
                        block: null,
                        overview: { totalComplaints: 0, pendingComplaints: 0 },
                        byStatus: [],
                        byPriority: [],
                        recentComplaints: []
                    };
                }
                return supervisorStats;

            case 'RESIDENT':
                return await dashboardRepository.getResidentStats(user.id);

            default:
                throw new AppError('Invalid role', 400);
        }
    }
}

module.exports = new DashboardService();
