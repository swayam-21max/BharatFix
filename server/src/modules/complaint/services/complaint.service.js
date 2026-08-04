const complaintRepository = require('../repositories/complaint.repository');
const { AppError } = require('../../../middleware/error.handler');
const eventBus = require('../../../events/event.bus');
const EVENT_TYPES = require('../../../events/event.types');
const { emitComplaintCreated, emitComplaintUpdated, emitComplaintEscalated } = require('../../../config/socket');
const { sendComplaintCreatedWhatsApp, sendComplaintStatusWhatsApp, sendEscalationWhatsApp } = require('../../../services/whatsapp.service');

class ComplaintService {
    calculateSLA(priority) {
        const hoursMap = {
            LOW: 72,
            MEDIUM: 48,
            HIGH: 24,
            CRITICAL: 12,
        };
        const now = new Date();
        return new Date(now.getTime() + hoursMap[priority] * 60 * 60 * 1000);
    }

    async createComplaint(user, data) {
        // 1. Validate block and get assigned Block Head
        const block = await complaintRepository.findBlockWithSupervisor(data.blockId || user.blockId);
        if (!block) throw new AppError('Block not found', 404);

        // 2. Calculate SLA
        const slaDueAt = this.calculateSLA(data.priority);

        // 3. Prepare data with 3-tier metadata
        const complaintData = {
            title: data.title,
            description: data.description,
            category: data.category || 'General',
            houseNumber: data.houseNumber || user.houseNumber,
            priority: data.priority || 'MEDIUM',
            blockId: block.id,
            residentId: user.id,
            assignedToId: block.supervisorId, // Auto-assign to Block Head
            slaDueAt,
            status: 'OPEN',
            escalationLevel: 1
        };

        const historyData = {
            newStatus: 'OPEN',
            changedById: user.id,
            comment: 'Complaint initialized'
        };

        const complaint = await complaintRepository.createWithHistory(complaintData, historyData);
        const fullComplaint = await complaintRepository.findById(complaint.id);

        // 4. Broadcast Real-Time Socket.io Event
        emitComplaintCreated(fullComplaint || complaint);

        // 5. Trigger WhatsApp Notification to Resident
        sendComplaintCreatedWhatsApp(complaint, user, block.name).catch(err => console.error('WhatsApp dispatch error:', err));

        // 6. Emit internal pub/sub event
        if (block.supervisorId) {
            eventBus.publish(EVENT_TYPES.COMPLAINT_CREATED, {
                complaint,
                block: { name: block.name },
                supervisorId: block.supervisorId,
                residentId: user.id,
            });
        }

        return fullComplaint || complaint;
    }

    async getSupervisorComplaints(user, filters) {
        const queryFilters = { ...filters };

        // Admin sees all, Block Head sees their block, Resident sees their own
        if (user.role === 'BLOCK_HEAD') {
            queryFilters.assignedToId = user.id;
        } else if (user.role === 'RESIDENT') {
            queryFilters.residentId = user.id;
        }

        return await complaintRepository.findAll(queryFilters);
    }

    async updateStatus(user, complaintId, newStatus, comment) {
        const complaint = await complaintRepository.findById(complaintId);
        if (!complaint) throw new AppError('Complaint not found', 404);

        // Authorization: Admin or the assigned Block Head
        const isAssignedBlockHead = user.role === 'BLOCK_HEAD' && complaint.assignedToId === user.id;
        const isAdmin = user.role === 'ADMIN';

        if (!isAssignedBlockHead && !isAdmin) {
            throw new AppError('You are not authorized to update this complaint', 403);
        }

        // Status State Machine
        const validTransitions = {
            OPEN: ['IN_PROGRESS', 'REJECTED', 'ESCALATED'],
            IN_PROGRESS: ['RESOLVED', 'ESCALATED'],
            ESCALATED: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
            SLA_BREACHED: ['ESCALATED', 'IN_PROGRESS', 'RESOLVED']
        };

        if (!validTransitions[complaint.status]?.includes(newStatus)) {
            throw new AppError(`Invalid status transition from ${complaint.status} to ${newStatus}`, 400);
        }

        const updateData = { status: newStatus };
        if (newStatus === 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }

        const historyData = {
            oldStatus: complaint.status,
            newStatus,
            changedById: user.id,
            comment: comment || `Status updated by ${user.role}`
        };

        await complaintRepository.updateStatusWithHistory(complaintId, updateData, historyData);
        const updatedFull = await complaintRepository.findById(complaintId);

        // 1. Broadcast Socket.io Event in Real-Time
        emitComplaintUpdated(updatedFull || complaint);

        // 2. Dispatch WhatsApp Notification to Resident
        sendComplaintStatusWhatsApp(updatedFull || complaint, complaint.resident, newStatus, comment).catch(err => console.error('WhatsApp status error:', err));

        // 3. If Escalated, also dispatch Escalation WhatsApp alert
        if (newStatus === 'ESCALATED') {
            sendEscalationWhatsApp(updatedFull || complaint, complaint.resident).catch(err => console.error('WhatsApp escalation error:', err));
        }

        // 4. Notify pub/sub subscribers
        eventBus.publish(EVENT_TYPES.COMPLAINT_STATUS_CHANGED, {
            complaint: { id: complaintId, title: complaint.title },
            oldStatus: complaint.status,
            newStatus,
            residentId: complaint.residentId,
        });

        return updatedFull;
    }

    async getComplaintById(user, complaintId) {
        const complaint = await complaintRepository.findById(complaintId);
        if (!complaint) throw new AppError('Complaint not found', 404);

        // Authorization check
        if (user.role === 'RESIDENT' && complaint.residentId !== user.id) {
            throw new AppError('Access denied', 403);
        }
        if (user.role === 'BLOCK_HEAD' && complaint.assignedToId !== user.id) {
            throw new AppError('Access denied', 403);
        }

        return complaint;
    }
}

module.exports = new ComplaintService();
