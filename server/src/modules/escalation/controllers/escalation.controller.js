const escalationService = require('../services/escalation.service');
const { successResponse } = require('../../../utils/response.formatter');

class EscalationController {
    async getByComplaint(req, res, next) {
        try {
            const escalations = await escalationService.getComplaintEscalations(req.params.complaintId);
            return successResponse(res, 200, 'Escalations fetched successfully', escalations);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EscalationController();
