const { z } = require('zod');

const createBlockSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Block name must be at least 2 characters long').max(100),
    }),
});

const blockIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid block ID'),
    }),
});

const assignSupervisorSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid block ID'),
    }),
    body: z.object({
        supervisorId: z.string().uuid('Invalid supervisor user ID'),
    }),
});

module.exports = {
    createBlockSchema,
    blockIdParamSchema,
    assignSupervisorSchema,
};
