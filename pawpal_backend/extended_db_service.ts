import prisma from './prisma_client';

// ============================================
// APPOINTMENTS SERVICE
// ============================================

export interface AppointmentInput {
    petId: number;
    title: string;
    description?: string;
    appointmentDate: Date;
    location?: string;
    vetName?: string;
    notes?: string;
}

export interface AppointmentUpdate {
    title?: string;
    description?: string;
    appointmentDate?: Date;
    location?: string;
    vetName?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
}

export class AppointmentService {
    // Create a new appointment
    static async create(data: AppointmentInput) {
        return await prisma.appointment.create({
            data: {
                petId: data.petId,
                title: data.title,
                description: data.description,
                appointmentDate: data.appointmentDate,
                location: data.location,
                vetName: data.vetName,
                notes: data.notes,
            },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get all appointments for a pet
    static async getByPetId(petId: number) {
        return await prisma.appointment.findMany({
            where: { petId },
            orderBy: { appointmentDate: 'asc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get upcoming appointments for a pet
    static async getUpcoming(petId: number) {
        return await prisma.appointment.findMany({
            where: {
                petId,
                appointmentDate: {
                    gte: new Date()
                },
                status: 'scheduled'
            },
            orderBy: { appointmentDate: 'asc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get all appointments for a user (across all their pets)
    static async getByUserId(userId: number) {
        return await prisma.appointment.findMany({
            where: {
                pet: { userId }
            },
            orderBy: { appointmentDate: 'asc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Update an appointment
    static async update(id: number, data: AppointmentUpdate) {
        return await prisma.appointment.update({
            where: { id },
            data,
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Delete an appointment
    static async delete(id: number) {
        return await prisma.appointment.delete({
            where: { id }
        });
    }
}

// ============================================
// MEDICATIONS SERVICE
// ============================================

export interface MedicationInput {
    petId: number;
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    timeOfDay?: string;
    instructions?: string;
}

export interface MedicationUpdate {
    name?: string;
    dosage?: string;
    frequency?: string;
    startDate?: Date;
    endDate?: Date;
    timeOfDay?: string;
    instructions?: string;
    isActive?: boolean;
}

export class MedicationService {
    // Create a new medication
    static async create(data: MedicationInput) {
        return await prisma.medication.create({
            data: {
                petId: data.petId,
                name: data.name,
                dosage: data.dosage,
                frequency: data.frequency,
                startDate: data.startDate,
                endDate: data.endDate,
                timeOfDay: data.timeOfDay,
                instructions: data.instructions,
            },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get all medications for a pet
    static async getByPetId(petId: number, activeOnly: boolean = false) {
        return await prisma.medication.findMany({
            where: {
                petId,
                ...(activeOnly && { isActive: true })
            },
            orderBy: { createdAt: 'desc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get active medications for a pet
    static async getActive(petId: number) {
        return await prisma.medication.findMany({
            where: {
                petId,
                isActive: true,
                OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } }
                ]
            },
            orderBy: { startDate: 'desc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get all medications for a user (across all their pets)
    static async getByUserId(userId: number) {
        return await prisma.medication.findMany({
            where: {
                pet: { userId }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Update a medication
    static async update(id: number, data: MedicationUpdate) {
        return await prisma.medication.update({
            where: { id },
            data,
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Delete a medication
    static async delete(id: number) {
        return await prisma.medication.delete({
            where: { id }
        });
    }

    // Mark medication as inactive
    static async deactivate(id: number) {
        return await prisma.medication.update({
            where: { id },
            data: { isActive: false },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }
}

// ============================================
// PHOTOS SERVICE
// ============================================

export interface PhotoInput {
    petId: number;
    url: string;
    caption?: string;
}

export class PhotoService {
    // Upload a new photo
    static async create(data: PhotoInput) {
        return await prisma.photo.create({
            data: {
                petId: data.petId,
                url: data.url,
                caption: data.caption,
            },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get all photos for a pet
    static async getByPetId(petId: number) {
        return await prisma.photo.findMany({
            where: { petId },
            orderBy: { uploadedAt: 'desc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Get all photos for a user (across all their pets)
    static async getByUserId(userId: number) {
        return await prisma.photo.findMany({
            where: {
                pet: { userId }
            },
            orderBy: { uploadedAt: 'desc' },
            include: {
                pet: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    // Update photo caption
    static async updateCaption(id: number, caption: string) {
        return await prisma.photo.update({
            where: { id },
            data: { caption },
        });
    }

    // Delete a photo
    static async delete(id: number) {
        return await prisma.photo.delete({
            where: { id }
        });
    }
}

// ============================================
// MULTI-PET SERVICE
// ============================================

export interface PetInput {
    userId?: number;
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: string;
    gender: string;
    activityLevel: string;
    profilePhoto?: string;
}

export class PetService {
    // Create a new pet
    static async create(data: PetInput) {
        return await prisma.pet.create({
            data: {
                userId: data.userId,
                name: data.name,
                species: data.species,
                breed: data.breed,
                age: data.age,
                weight: data.weight,
                gender: data.gender,
                activityLevel: data.activityLevel,
                profilePhoto: data.profilePhoto,
            },
            include: {
                healthMetrics: true,
                medicalHistory: true,
            }
        });
    }

    // Get all pets for a user
    static async getByUserId(userId: number) {
        return await prisma.pet.findMany({
            where: { userId },
            include: {
                healthMetrics: {
                    include: { weightHistory: true }
                },
                medicalHistory: true,
                appointments: {
                    where: {
                        appointmentDate: { gte: new Date() },
                        status: 'scheduled'
                    },
                    take: 3,
                    orderBy: { appointmentDate: 'asc' }
                },
                medications: {
                    where: { isActive: true },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                photos: {
                    take: 1,
                    orderBy: { uploadedAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Get a single pet by ID
    static async getById(petId: number) {
        return await prisma.pet.findUnique({
            where: { id: petId },
            include: {
                healthMetrics: {
                    include: { weightHistory: true }
                },
                medicalHistory: true,
                appointments: {
                    orderBy: { appointmentDate: 'asc' }
                },
                medications: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' }
                },
                photos: {
                    orderBy: { uploadedAt: 'desc' }
                },
                mealPlans: {
                    orderBy: { scheduledAt: 'asc' }
                },
                ritualLogs: {
                    take: 10,
                    orderBy: { date: 'desc' }
                }
            }
        });
    }


    // Update a pet
    static async update(petId: number, data: Partial<PetInput>) {
        return await prisma.pet.update({
            where: { id: petId },
            data,
            include: {
                healthMetrics: true,
                medicalHistory: true,
            }
        });
    }

    // Delete a pet
    static async delete(petId: number) {
        return await prisma.pet.delete({
            where: { id: petId }
        });
    }

    // Add medical record to a pet
    static async addMedicalRecord(petId: number, record: { date: string, event: string, description?: string }) {
        return await prisma.medicalRecord.create({
            data: {
                petId,
                date: record.date,
                event: record.event,
                description: record.description || ""
            }
        });
    }
}

// ============================================
// USER SERVICE
// ============================================

export interface UserInput {
    email: string;
    name: string;
    phone?: string;
}

export class UserService {
    // Create a new user
    static async create(data: UserInput) {
        return await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                phone: data.phone,
            },
            include: {
                pets: true
            }
        });
    }

    // Get or create user by email
    static async getOrCreate(email: string, name: string) {
        let user = await prisma.user.findUnique({
            where: { email },
            include: { pets: true }
        });

        if (!user) {
            user = await this.create({ email, name });
        }

        return user;
    }

    // Get user by ID
    static async getById(userId: number) {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                pets: {
                    include: {
                        healthMetrics: true,
                        appointments: {
                            where: {
                                appointmentDate: { gte: new Date() },
                                status: 'scheduled'
                            },
                            take: 5,
                            orderBy: { appointmentDate: 'asc' }
                        },
                        medications: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
    }

    // Update user
    static async update(userId: number, data: Partial<UserInput>) {
        return await prisma.user.update({
            where: { id: userId },
            data,
            include: {
                pets: true
            }
        });
    }
}

// ============================================
// NUTRITION & RITUALS SERVICE
// ============================================

export interface MealPlanInput {
    petId: number;
    mealName: string;
    foodType?: string;
    amount: string;
    scheduledAt: string;
}

export class MealPlanService {
    static async create(data: MealPlanInput) {
        return await prisma.mealPlan.create({
            data
        });
    }

    static async getByPetId(petId: number) {
        return await prisma.mealPlan.findMany({
            where: { petId },
            orderBy: { scheduledAt: 'asc' }
        });
    }

    static async toggleComplete(id: number) {
        const meal = await prisma.mealPlan.findUnique({ where: { id } });
        if (!meal) throw new Error('Meal not found');
        return await prisma.mealPlan.update({
            where: { id },
            data: { isCompleted: !meal.isCompleted }
        });
    }

    static async delete(id: number) {
        return await prisma.mealPlan.delete({ where: { id } });
    }
}

export interface RitualLogInput {
    petId: number;
    activity: string;
    duration: number;
    notes?: string;
}

export class RitualService {
    static async log(data: RitualLogInput) {
        return await prisma.ritualLog.create({
            data
        });
    }

    static async getByPetId(petId: number) {
        return await prisma.ritualLog.findMany({
            where: { petId },
            take: 20,
            orderBy: { date: 'desc' }
        });
    }

    static async getTodayRituals(petId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await prisma.ritualLog.findMany({
            where: {
                petId,
                date: { gte: today }
            }
        });
    }
}

