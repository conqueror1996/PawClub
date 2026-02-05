
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PawPalChatService } from './pawpal_chat_service';
import { PawPalInputs } from './prompt_assembler';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(bodyParser.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from 'public' directory
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

import { MealPlanService, RitualService, AppointmentService, MedicationService, PhotoService, PetService, UserService } from './extended_db_service';


// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// UPLOAD Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Construct public URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({ url: fileUrl });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

import { DBService } from './db_service';

// ... (existing imports)

// GET Pet Profile
app.get('/api/pet', async (req, res) => {
    try {
        const pet = await DBService.getPetProfile();
        res.json({ pet });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pet profile' });
    }
});

// UPDATE Pet Profile
app.post('/api/pet', async (req, res) => {
    try {
        const newProfile = req.body;
        if (!newProfile) {
            return res.status(400).json({ error: 'Missing profile data' });
        }
        const updatedPet = await DBService.updatePetProfile(newProfile);
        res.json({ pet: updatedPet });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update pet profile' });
    }
});

// GET Health Metrics
app.get('/api/health-metrics', async (req, res) => {
    try {
        const metrics = await DBService.getHealthMetrics();
        res.json({ metrics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health metrics' });
    }
});

// UPDATE Health Metrics
app.post('/api/health-metrics', async (req, res) => {
    try {
        const updates = req.body;
        const metrics = await DBService.updateHealthMetrics(updates);
        res.json({ metrics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update health metrics' });
    }
});

// GET Medical History
app.get('/api/medical-history', async (req, res) => {
    try {
        const petId = req.query.petId ? Number(req.query.petId) : null;

        if (petId) {
            const pet = await PetService.getById(petId);
            if (!pet) return res.status(404).json({ error: 'Pet not found' });

            const history = pet.medicalHistory.map((m: any) => ({
                date: m.date,
                event: m.event,
                description: m.description || ""
            }));
            return res.json({ history });
        }

        const history = await DBService.getMedicalHistory();
        res.json({ history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch medical history' });
    }
});

// ADD Medical Record
app.post('/api/medical-history', async (req, res) => {
    try {
        const record = req.body;
        if (!record || !record.date || !record.event) {
            return res.status(400).json({ error: 'Invalid record data' });
        }

        if (record.petId) {
            const petId = Number(record.petId);
            await PetService.addMedicalRecord(petId, record);

            // Return updated list
            const pet = await PetService.getById(petId);
            const history = pet ? pet.medicalHistory.map((m: any) => ({
                date: m.date,
                event: m.event,
                description: m.description || ""
            })) : [];

            return res.json({ history });
        }

        const history = await DBService.addMedicalRecord(record);
        res.json({ history });
    } catch (error) {
        console.error("Failed to add medical record", error);
        res.status(500).json({ error: 'Failed to add medical record' });
    }
});
// ============================================
// NUTRITION & RITUALS ENDPOINTS
// ============================================

// Get meal plans by pet ID
app.get('/api/meal-plans/pet/:petId', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const meals = await MealPlanService.getByPetId(petId);
        res.json({ meals });
    } catch (error) {
        console.error('Error fetching meal plans:', error);
        res.status(500).json({ error: 'Failed to fetch meal plans' });
    }
});

// Create meal plan
app.post('/api/meal-plans', async (req, res) => {
    try {
        const { petId, mealName, foodType, amount, scheduledAt } = req.body;
        if (!petId || !mealName || !amount || !scheduledAt) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const meal = await MealPlanService.create({
            petId: Number(petId),
            mealName,
            foodType,
            amount,
            scheduledAt
        });
        res.json({ meal });
    } catch (error) {
        console.error('Error creating meal plan:', error);
        res.status(500).json({ error: 'Failed to create meal plan' });
    }
});

// Toggle meal completion
app.patch('/api/meal-plans/:id/toggle', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const meal = await MealPlanService.toggleComplete(id);
        res.json({ meal });
    } catch (error) {
        console.error('Error toggling meal:', error);
        res.status(500).json({ error: 'Failed to toggle meal' });
    }
});

// Delete meal plan
app.delete('/api/meal-plans/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await MealPlanService.delete(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        res.status(500).json({ error: 'Failed to delete meal plan' });
    }
});

// Log ritual
app.post('/api/rituals', async (req, res) => {
    try {
        const { petId, activity, duration, notes } = req.body;
        if (!petId || !activity || !duration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const log = await RitualService.log({
            petId: Number(petId),
            activity,
            duration: Number(duration),
            notes
        });
        res.json({ log });
    } catch (error) {
        console.error('Error logging ritual:', error);
        res.status(500).json({ error: 'Failed to log ritual' });
    }
});

// Get rituals for pet
app.get('/api/rituals/pet/:petId', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const rituals = await RitualService.getByPetId(petId);
        res.json({ rituals });
    } catch (error) {
        console.error('Error fetching rituals:', error);
        res.status(500).json({ error: 'Failed to fetch rituals' });
    }
});

// Get today's rituals
app.get('/api/rituals/pet/:petId/today', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const rituals = await RitualService.getTodayRituals(petId);
        res.json({ rituals });
    } catch (error) {
        console.error('Error fetching today rituals:', error);
        res.status(500).json({ error: 'Failed to fetch today rituals' });
    }
});

// Endpoint to handle chat interactions
app.post('/api/chat', async (req, res) => {
    try {
        let inputs: any = req.body;

        // Map frontend 'history' (chat log) to 'memory' if needed
        if (inputs.history && Array.isArray(inputs.history) && typeof inputs.history[0] === 'string') {
            inputs.memory = inputs.history;
            inputs.history = undefined; // Clear it so we can re-populate with medical history
        }

        // Ensure we have a Pet Profile
        if (!inputs.pet || !inputs.pet.id) {
            // Fallback to default pet
            inputs.pet = await DBService.getPetProfile();
        }

        // Fetch Real Context for this pet
        if (inputs.pet && inputs.pet.id) {
            const petId = inputs.pet.id;
            const fullPet = await PetService.getById(petId);
            const meals = await MealPlanService.getByPetId(petId);
            const todayRituals = await RitualService.getTodayRituals(petId);

            if (fullPet) {
                // Medical History
                inputs.history = fullPet.medicalHistory.map((m: any) => ({
                    date: m.date,
                    event: m.event,
                    description: m.description || ""
                }));

                // Health Metrics
                inputs.pet.weight = fullPet.weight;

                // Nutrition & Rituals
                inputs.nutrition = meals.map(m => ({
                    mealName: m.mealName,
                    foodType: m.foodType || "food",
                    amount: m.amount,
                    scheduledAt: m.scheduledAt,
                    isCompleted: m.isCompleted
                }));

                inputs.rituals = todayRituals.map(r => ({
                    activity: r.activity,
                    duration: r.duration,
                    date: r.date
                }));
            }
        }

        console.log(`Received chat request for ${inputs.pet.name}`);

        // Generate response using our service
        const response = await PawPalChatService.generateResponse(inputs);

        res.json({ response });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to generate a daily tip
app.post('/api/daily-tip', async (req, res) => {
    try {
        const { pet } = req.body;

        // Validate inputs
        if (!pet) {
            return res.status(400).json({ error: 'Missing pet profile' });
        }

        console.log(`Received daily tip request for ${pet.name}`);

        // Generate tip
        const tip = await PawPalChatService.generateDailyTip(pet);

        res.json({ tip });
    } catch (error) {
        console.error("Error generating daily tip:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// APPOINTMENTS ENDPOINTS
// ============================================

// Create appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { petId, title, description, appointmentDate, location, vetName, notes } = req.body;

        if (!petId || !title || !appointmentDate) {
            return res.status(400).json({ error: 'Missing required fields: petId, title, appointmentDate' });
        }

        const appointment = await AppointmentService.create({
            petId: Number(petId),
            title,
            description,
            appointmentDate: new Date(appointmentDate),
            location,
            vetName,
            notes
        });

        res.json({ appointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

// Get appointments by pet ID
app.get('/api/appointments/pet/:petId', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const appointments = await AppointmentService.getByPetId(petId);
        res.json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Get upcoming appointments by pet ID
app.get('/api/appointments/pet/:petId/upcoming', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const appointments = await AppointmentService.getUpcoming(petId);
        res.json({ appointments });
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming appointments' });
    }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updates = req.body;

        if (updates.appointmentDate) {
            updates.appointmentDate = new Date(updates.appointmentDate);
        }

        const appointment = await AppointmentService.update(id, updates);
        res.json({ appointment });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await AppointmentService.delete(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

// ============================================
// MEDICATIONS ENDPOINTS
// ============================================

// Create medication
app.post('/api/medications', async (req, res) => {
    try {
        const { petId, name, dosage, frequency, startDate, endDate, timeOfDay, instructions } = req.body;

        if (!petId || !name || !dosage || !frequency || !startDate) {
            return res.status(400).json({ error: 'Missing required fields: petId, name, dosage, frequency, startDate' });
        }

        const medication = await MedicationService.create({
            petId: Number(petId),
            name,
            dosage,
            frequency,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            timeOfDay,
            instructions
        });

        res.json({ medication });
    } catch (error) {
        console.error('Error creating medication:', error);
        res.status(500).json({ error: 'Failed to create medication' });
    }
});

// Get medications by pet ID
app.get('/api/medications/pet/:petId', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const activeOnly = req.query.activeOnly === 'true';
        const medications = await MedicationService.getByPetId(petId, activeOnly);
        res.json({ medications });
    } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});

// Get active medications by pet ID
app.get('/api/medications/pet/:petId/active', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const medications = await MedicationService.getActive(petId);
        res.json({ medications });
    } catch (error) {
        console.error('Error fetching active medications:', error);
        res.status(500).json({ error: 'Failed to fetch active medications' });
    }
});

// Update medication
app.put('/api/medications/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updates = req.body;

        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        const medication = await MedicationService.update(id, updates);
        res.json({ medication });
    } catch (error) {
        console.error('Error updating medication:', error);
        res.status(500).json({ error: 'Failed to update medication' });
    }
});

// Deactivate medication
app.post('/api/medications/:id/deactivate', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const medication = await MedicationService.deactivate(id);
        res.json({ medication });
    } catch (error) {
        console.error('Error deactivating medication:', error);
        res.status(500).json({ error: 'Failed to deactivate medication' });
    }
});

// Delete medication
app.delete('/api/medications/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await MedicationService.delete(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting medication:', error);
        res.status(500).json({ error: 'Failed to delete medication' });
    }
});

// ============================================
// PHOTOS ENDPOINTS
// ============================================

// Upload photo
app.post('/api/photos', async (req, res) => {
    try {
        const { petId, url, caption } = req.body;

        if (!petId || !url) {
            return res.status(400).json({ error: 'Missing required fields: petId, url' });
        }

        const photo = await PhotoService.create({
            petId: Number(petId),
            url,
            caption
        });

        res.json({ photo });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Get photos by pet ID
app.get('/api/photos/pet/:petId', async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const photos = await PhotoService.getByPetId(petId);
        res.json({ photos });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Update photo caption
app.put('/api/photos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { caption } = req.body;

        const photo = await PhotoService.updateCaption(id, caption);
        res.json({ photo });
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ error: 'Failed to update photo' });
    }
});

// Delete photo
app.delete('/api/photos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await PhotoService.delete(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

// ============================================
// MULTI-PET ENDPOINTS
// ============================================

// Create a new pet
app.post('/api/pets', async (req, res) => {
    try {
        const { userId, name, species, breed, age, weight, gender, activityLevel, profilePhoto } = req.body;

        if (!name || !species || !breed || age === undefined || !weight || !gender || !activityLevel) {
            return res.status(400).json({ error: 'Missing required pet fields' });
        }

        const pet = await PetService.create({
            userId: userId ? Number(userId) : undefined,
            name,
            species,
            breed,
            age: Number(age),
            weight,
            gender,
            activityLevel,
            profilePhoto
        });

        res.json({ pet });
    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({ error: 'Failed to create pet' });
    }
});

// Get all pets (for a user, or use the original singleton approach for backward compatibility)
app.get('/api/pets', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (userId) {
            const pets = await PetService.getByUserId(Number(userId));
            res.json({ pets });
        } else {
            // Backward compatibility: return the first pet
            const pet = await DBService.getPetProfile();
            res.json({ pets: pet ? [pet] : [] });
        }
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ error: 'Failed to fetch pets' });
    }
});

// Get a single pet by ID
app.get('/api/pets/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const pet = await PetService.getById(id);

        if (!pet) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        res.json({ pet });
    } catch (error) {
        console.error('Error fetching pet:', error);
        res.status(500).json({ error: 'Failed to fetch pet' });
    }
});

// Update a pet
app.put('/api/pets/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updates = req.body;

        if (updates.age) updates.age = Number(updates.age);

        const pet = await PetService.update(id, updates);
        res.json({ pet });
    } catch (error) {
        console.error('Error updating pet:', error);
        res.status(500).json({ error: 'Failed to update pet' });
    }
});

// Delete a pet
app.delete('/api/pets/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await PetService.delete(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).json({ error: 'Failed to delete pet' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🐶 PawPal Server is running at http://0.0.0.0:${PORT}`);
    console.log(`➡️  Open http://localhost:${PORT} in your browser to test the app.\n`);
});
