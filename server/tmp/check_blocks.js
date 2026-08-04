const prisma = require('../src/config/prisma');

async function main() {
    try {
        const blocks = await prisma.block.findMany();
        console.log('Blocks in database:', JSON.stringify(blocks, null, 2));
    } catch (error) {
        console.error('Error fetching blocks:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
