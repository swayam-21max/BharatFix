const { z } = require('zod');

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        email: z.string().email('Invalid email address').optional(),
    }).refine((data) => data.name || data.email, {
        message: 'At least one field (name or email) must be provided',
    }),
});

const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    }),
});

const updateRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
        role: z.enum(['RESIDENT', 'SUPERVISOR', 'ADMIN']),
    }),
});

const listUsersSchema = z.object({
    query: z.object({
        role: z.enum(['RESIDENT', 'SUPERVISOR', 'ADMIN']).optional(),
        search: z.string().optional(),
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }).optional(),
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema,
    updateRoleSchema,
    listUsersSchema,
};
