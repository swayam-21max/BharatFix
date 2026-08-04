const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
        email: z.string().email('Invalid email address'),
        phoneNumber: z.string().optional(),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        role: z.enum(['RESIDENT', 'BLOCK_HEAD']).default('RESIDENT'),
        houseNumber: z.string().optional(),
        blockId: z.string().uuid('Invalid block ID').optional(),
    }).refine(data => {
        if (data.role === 'RESIDENT' && !data.houseNumber) return false;
        return true;
    }, {
        message: "House number is required for residents",
        path: ["houseNumber"]
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
};
