const userService = require('../services/user.service');
const { successResponse } = require('../../../utils/response.formatter');

class UserController {
    async getMe(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.id);
            return successResponse(res, 200, 'Profile retrieved successfully', user);
        } catch (error) {
            next(error);
        }
    }

    async updateMe(req, res, next) {
        try {
            const user = await userService.updateProfile(req.user.id, req.body);
            return successResponse(res, 200, 'Profile updated successfully', user);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { oldPassword, newPassword } = req.body;
            await userService.changePassword(req.user.id, oldPassword, newPassword);
            return successResponse(res, 200, 'Password changed successfully');
        } catch (error) {
            next(error);
        }
    }

    async listUsers(req, res, next) {
        try {
            const result = await userService.listUsers(req.query);
            return successResponse(res, 200, 'Users retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    async updateRole(req, res, next) {
        try {
            const user = await userService.updateUserRole(req.params.id, req.body.role);
            return successResponse(res, 200, 'User role updated successfully', user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
