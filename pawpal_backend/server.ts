
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PawPalChatService } from './pawpal_chat_service';
import { PawPalInputs } from './prompt_assembler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

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

app.listen(PORT, () => {
    console.log(`\n🐶 PawPal Server is running at http://localhost:${PORT}`);
    console.log(`➡️  Open http://localhost:${PORT} in your browser to test the app.\n`);
});
