const eventBus = require('./event.bus');
const EVENT_TYPES = require('./event.types');
const notificationService = require('../notifications/notification.service');
const logger = require('../config/logger');

/**
 * Initialize all event subscribers
 * Called once on server boot
 */
const initSubscribers = () => {
    // Complaint Created → Notify Supervisor
    eventBus.subscribe(EVENT_TYPES.COMPLAINT_CREATED, async (data) => {
        await notificationService.onComplaintCreated(data);
    });

    // Complaint Status Changed → Notify Resident
    eventBus.subscribe(EVENT_TYPES.COMPLAINT_STATUS_CHANGED, async (data) => {
        await notificationService.onComplaintStatusChanged(data);
    });

    // SLA Breached → Notify Admin
    eventBus.subscribe(EVENT_TYPES.COMPLAINT_SLA_BREACHED, async (data) => {
        await notificationService.onSLABreached(data);
    });

    logger.info('✅ Event subscribers initialized');
};

module.exports = { initSubscribers };
