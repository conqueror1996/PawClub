import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Helper to determine if we are running in a Postgres environment
const isPostgres = process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith('postgres://') ||
        process.env.DATABASE_URL.startsWith('postgresql://'));

let prisma: PrismaClient;

if (isPostgres) {
    // Production / Postgres Mode
    console.log('🔌 Connecting to PostgreSQL database...');
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    } as any);
} else {
    // Local / SQLite Mode
    console.log('📂 Connecting to SQLite database...');

    prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL || 'file:./dev.db'
            }
        }
    } as any);
}

export default prisma;
