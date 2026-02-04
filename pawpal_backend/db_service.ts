import { PrismaClient } from '@prisma/client';
import path from 'path';
import { PetProfile, MedicalHistoryItem } from './prompt_assembler';

const prisma = new PrismaClient();

export interface HealthMetrics {
    lastVaccinationDate: string;
    nextVaccinationDate: string;
    weightHistory: { date: string, weight: number }[];
}

export class DBService {

    // Helper to ensure a Pet exists (Singleton Pet approach for now)
    private static async ensurePet() {
        let pet = await prisma.pet.findFirst({
            include: {
                healthMetrics: {
                    include: { weightHistory: true }
                },
                medicalHistory: true
            }
        });

        if (!pet) {
            // Seed default data if DB is empty
            pet = await prisma.pet.create({
                data: {
                    name: "Bruno",
                    species: "Dog",
                    breed: "Golden Retriever",
                    age: 5,
                    weight: "32kg",
                    gender: "Male",
                    activityLevel: "Moderate",
                    healthMetrics: {
                        create: {
                            lastVaccinationDate: "2023-10-15",
                            nextVaccinationDate: "2024-10-15",
                            weightHistory: {
                                create: [
                                    { date: "2023-11-01", weight: 31 },
                                    { date: "2023-12-01", weight: 32 }
                                ]
                            }
                        }
                    },
                    medicalHistory: {
                        create: [
                            { date: "2023-01-10", event: "Annual Checkup", description: "All good!" }
                        ]
                    }
                },
                include: {
                    healthMetrics: { include: { weightHistory: true } },
                    medicalHistory: true
                }
            });
        }
        return pet;
    }

    // Get Pet Profile
    public static async getPetProfile(): Promise<PetProfile> {
        const pet = await this.ensurePet();
        return {
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            gender: pet.gender,
            activityLevel: pet.activityLevel
        };
    }

    // Update Pet Profile
    public static async updatePetProfile(newProfile: Partial<PetProfile>): Promise<PetProfile> {
        const pet = await this.ensurePet();

        const updated = await prisma.pet.update({
            where: { id: pet.id },
            data: newProfile as any
        });

        return {
            name: updated.name,
            species: updated.species,
            breed: updated.breed,
            age: updated.age,
            weight: updated.weight,
            gender: updated.gender,
            activityLevel: updated.activityLevel
        };
    }

    // Get Health Metrics
    public static async getHealthMetrics(): Promise<HealthMetrics> {
        const pet = await this.ensurePet();

        if (!pet.healthMetrics) {
            return { lastVaccinationDate: "", nextVaccinationDate: "", weightHistory: [] };
        }

        return {
            lastVaccinationDate: pet.healthMetrics.lastVaccinationDate || "",
            nextVaccinationDate: pet.healthMetrics.nextVaccinationDate || "",
            weightHistory: pet.healthMetrics.weightHistory.map(w => ({ date: w.date, weight: w.weight }))
        };
    }

    // Update Health Metrics
    public static async updateHealthMetrics(updates: any): Promise<HealthMetrics> {
        const pet = await this.ensurePet();
        const metricId = pet.healthMetrics?.id;

        if (!metricId) throw new Error("Health metrics not initialized");

        // Prepare updates
        const data: any = {};
        if (updates.lastVaccinationDate) data.lastVaccinationDate = updates.lastVaccinationDate;
        if (updates.nextVaccinationDate) data.nextVaccinationDate = updates.nextVaccinationDate;

        if (updates.weight) {
            // Add new weight entry
            await prisma.weightEntry.create({
                data: {
                    healthMetricId: metricId,
                    date: new Date().toISOString().split('T')[0],
                    weight: Number(updates.weight)
                }
            });
            // Also update main pet weight string
            await prisma.pet.update({
                where: { id: pet.id },
                data: { weight: `${updates.weight}kg` }
            });
        }

        // Update the metric fields if any
        if (Object.keys(data).length > 0) {
            await prisma.healthMetric.update({
                where: { id: metricId },
                data
            });
        }

        return this.getHealthMetrics();
    }

    // Get Medical History
    public static async getMedicalHistory(): Promise<MedicalHistoryItem[]> {
        const pet = await this.ensurePet();
        return pet.medicalHistory.map(m => ({
            date: m.date,
            event: m.event,
            description: m.description || ""
        }));
    }

    // Add Medical Record
    public static async addMedicalRecord(record: MedicalHistoryItem): Promise<MedicalHistoryItem[]> {
        const pet = await this.ensurePet();

        await prisma.medicalRecord.create({
            data: {
                petId: pet.id,
                date: record.date,
                event: record.event,
                description: record.description || ""
            }
        });

        return this.getMedicalHistory();
    }
}
