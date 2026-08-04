const EventEmitter = require('events');
const logger = require('../config/logger');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.on('error', (err) => {
            logger.error('💥 Event Bus Error:', err);
        });
    }

    publish(eventName, data) {
        logger.info(`📢 Event Published: ${eventName}`);
        this.emit(eventName, data);
    }

    subscribe(eventName, callback) {
        logger.info(`👂 Subscribed to: ${eventName}`);
        this.on(eventName, callback);
    }
}

const eventBus = new EventBus();

module.exports = eventBus;
