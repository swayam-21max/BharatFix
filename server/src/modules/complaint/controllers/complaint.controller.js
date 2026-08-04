const complaintService = require('../services/complaint.service');
const { successResponse } = require('../../../utils/response.formatter');

class ComplaintController {
    async create(req, res, next) {
        try {
            const complaint = await complaintService.createComplaint(req.user, req.body);
            return successResponse(res, 201, 'Complaint created successfully', complaint);
        } catch (error) {
            next(error);
        }
    }

    async getSupervisorComplaints(req, res, next) {
        try {
            const complaints = await complaintService.getSupervisorComplaints(req.user, req.query);
            return successResponse(res, 200, 'Complaints fetched successfully', complaints);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status, comment } = req.body;
            const complaint = await complaintService.updateStatus(req.user, req.params.id, status, comment);
            return successResponse(res, 200, 'Status updated successfully', complaint);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const complaint = await complaintService.getComplaintById(req.user, req.params.id);
            return successResponse(res, 200, 'Complaint detail fetched successfully', complaint);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ComplaintController();
