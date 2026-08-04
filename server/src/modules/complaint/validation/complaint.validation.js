const { z } = require('zod');

const createComplaintSchema = z.object({
    body: z.object({
        title: z.string().min(5, 'Title must be at least 5 characters long'),
        description: z.string().min(10, 'Description must be at least 10 characters long'),
        blockId: z.string().uuid('Invalid block ID'),
        category: z.string().optional().default('General'),
        houseNumber: z.string().optional(),
        latitude: z.number().min(-90).max(90).optional().nullable(),
        longitude: z.number().min(-180).max(180).optional().nullable(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    }),
});

const updateStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid complaint ID'),
    }),
    body: z.object({
        status: z.enum(['IN_PROGRESS', 'RESOLVED', 'REJECTED']),
    }),
});

module.exports = {
    createComplaintSchema,
    updateStatusSchema,
};
