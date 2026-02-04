
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
        const history = await DBService.addMedicalRecord(record);
        res.json({ history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add medical record' });
    }
});

// Endpoint to handle chat interactions
app.post('/api/chat', async (req, res) => {
    try {
        let inputs: PawPalInputs = req.body;

        // If pet info is missing in request, try to load from DB
        if (!inputs.pet) {
            const pet = await DBService.getPetProfile();
            inputs.pet = pet;
        }
        // ...

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
import { AppointmentService, MedicationService, PhotoService, PetService, UserService } from './extended_db_service';

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
