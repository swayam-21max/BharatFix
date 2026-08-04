const authService = require('../services/auth.service');
const { blacklistToken } = require('../../../utils/token.blacklist');
const { successResponse } = require('../../../utils/response.formatter');

class AuthController {
    async register(req, res, next) {
        try {
            const { user, token } = await authService.register(req.body);

            // Remove passwordHash from response
            const { passwordHash, ...userWithoutPassword } = user;

            return successResponse(res, 201, 'User registered successfully', {
                user: userWithoutPassword,
                token,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, token } = await authService.login(email, password);

            // Remove passwordHash from response
            const { passwordHash, ...userWithoutPassword } = user;

            return successResponse(res, 200, 'Login successful', {
                user: userWithoutPassword,
                token,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            // Blacklist the current token for its remaining TTL
            // JWT default expiry is 1d = 86400 seconds
            const ttl = 24 * 60 * 60; // 1 day in seconds
            await blacklistToken(req.token, ttl);

            return successResponse(res, 200, 'Logged out successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
