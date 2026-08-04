require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const blocks = [
        { name: 'Block A' },
        { name: 'Block B' },
        { name: 'Market Area' },
        { name: 'Park Zone' },
    ];

    console.log('🌱 Starting seeding initial blocks...');

    for (const block of blocks) {
        const upsertedBlock = await prisma.block.upsert({
            where: { name: block.name },
            update: {},
            create: block,
        });
        console.log(`✅ Upserted block: ${upsertedBlock.name}`);
    }

    console.log('✨ Seeding finished.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
