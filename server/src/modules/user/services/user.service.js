const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { AppError } = require('../../../middleware/error.handler');

class UserService {
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateProfile(userId, data) {
        // Check if email is being changed and is already taken
        if (data.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing && existing.id !== userId) {
                throw new AppError('Email is already in use', 400);
            }
        }

        const user = await userRepository.updateProfile(userId, data);
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Current password is incorrect', 401);
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await userRepository.updatePassword(userId, passwordHash);

        return true;
    }

    async listUsers(filters) {
        return await userRepository.findAll(filters);
    }

    async updateUserRole(targetUserId, newRole) {
        const user = await userRepository.findById(targetUserId);
        if (!user) throw new AppError('User not found', 404);

        if (user.role === newRole) {
            throw new AppError(`User is already a ${newRole}`, 400);
        }

        // When promoting to BLOCK_HEAD, set to APPROVED by default if done by Admin
        // When demoting to RESIDENT, reset approval flags
        const updateData = { role: newRole };
        if (newRole === 'BLOCK_HEAD') {
            updateData.isApproved = true;
            updateData.approvalStatus = 'APPROVED';
        } else if (newRole === 'RESIDENT') {
            updateData.isApproved = true;
            updateData.approvalStatus = 'APPROVED';
        }

        const updated = await userRepository.updateProfile(targetUserId, updateData);
        const { passwordHash, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }
}

module.exports = new UserService();
