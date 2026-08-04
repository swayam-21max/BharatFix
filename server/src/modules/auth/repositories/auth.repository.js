const prisma = require('../../../config/prisma');

class AuthRepository {
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async createUser(userData) {
        return await prisma.user.create({
            data: userData,
        });
    }
}

module.exports = new AuthRepository();
