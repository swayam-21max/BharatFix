const bcrypt = require('bcryptjs');
const authRepository = require('../repositories/auth.repository');
const { signToken } = require('../../../utils/jwt.helper');
const { AppError } = require('../../../middleware/error.handler');

class AuthService {
    async register(userData) {
        const { email, password, fullName, role, houseNumber, blockId } = userData;

        // 1. Check if user already exists
        const existingUser = await authRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // 3. Governance Logic: Block Heads start as PENDING
        const isBlockHead = role === 'BLOCK_HEAD';
        const approvalData = isBlockHead
            ? { isApproved: false, approvalStatus: 'PENDING' }
            : { isApproved: true, approvalStatus: 'APPROVED' };

        // 4. Create user
        const user = await authRepository.createUser({
            email,
            passwordHash,
            fullName,
            role: role || 'RESIDENT',
            houseNumber: !isBlockHead ? houseNumber : null,
            blockId,
            ...approvalData
        });

        // 5. Generate token
        const token = signToken({ id: user.id, role: user.role });

        return { user, token };
    }

    async login(email, password) {
        // 1. Find user by email
        const user = await authRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // 2. Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordCorrect) {
            throw new AppError('Invalid email or password', 401);
        }

        // 3. Generate token
        const token = signToken({ id: user.id, role: user.role });

        return { user, token };
    }
}

module.exports = new AuthService();
