# PawPal Backend Prompt Assembler

This module handles the construction of the system prompt for the PawPal AI Assistant.
It takes structured pet data and the user's question, then injects them into the strict safety-focused system prompt.

## Usage

```typescript
import { PawPalPromptAssembler, PawPalContext } from './prompt_assembler';

// 1. gather data from your database or frontend request
const context: PawPalContext = {
    petProfile: { 
        name: 'Bruno', 
        species: 'Dog', 
        breed: 'Golden Retriever', 
        age: '5 years', 
        weight: '32kg', 
        gender: 'Male', 
        activityLevel: 'Moderate' 
    },
    medicalHistory: { 
        pastIllnesses: ['Kennel Cough (2023)'],
        vaccinationStatus: 'Up to date', 
        allergies: ['Chicken'], 
        recentSymptoms: []
    },
    userQuestion: 'Can I feed him apples?',
    isEmergency: false // Set to true if urgency logic detects keywords (e.g., "blood", "unconscious")
};

// 2. Generate the full prompt string
const fullPrompt = PawPalPromptAssembler.assemble(context);

// 3. Send to LLM
// const response = await llmClient.generateContent(fullPrompt);
```

## Files
- `prompt_assembler.ts`: The core logic and types.
- `test_assembler.ts`: A demo script showing how the prompt is constructed.
