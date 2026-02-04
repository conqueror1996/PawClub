
import prisma from './prisma_client';
import { DBService } from './db_service';

async function main() {
    try {
        console.log("Attempting to fetch pet profile...");
        const pet = await DBService.getPetProfile();
        console.log("Success:", pet);
    } catch (error) {
        console.error("FATAL ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
