const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error.handler');
const { apiLimiter } = require('./middleware/rate.limiter');
const logger = require('./config/logger');

// Route imports
const authRoutes = require('./modules/auth/routes/auth.routes');
const userRoutes = require('./modules/user/routes/user.routes');
const complaintRoutes = require('./modules/complaint/routes/complaint.routes');
const blockRoutes = require('./modules/block/routes/block.routes');
const slaRoutes = require('./modules/sla/routes/sla.routes');
const escalationRoutes = require('./modules/escalation/routes/escalation.routes');
const dashboardRoutes = require('./modules/dashboard/routes/dashboard.routes');
const adminRoutes = require('./modules/admin/routes/admin.routes');
const chatbotRoutes = require('./modules/chatbot/routes/chatbot.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(hpp());

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Basic API Routes
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to BHARATFIX API',
        version: 'v1.0.0'
    });
});

// Rate Limiting
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

// Debug log
app.use('/api/v1', (req, res, next) => {
    logger.info(`V1 Route hit: ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/blocks', blockRoutes);
app.use('/api/v1/sla', slaRoutes);
app.use('/api/v1/escalations', escalationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);

// 404 Handler
app.use((req, res, next) => {
    const { AppError } = require('./middleware/error.handler');
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
