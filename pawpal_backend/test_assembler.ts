
import { PawPalPromptAssembler, PawPalInputs } from './prompt_assembler';

const mockContext: PawPalInputs = {
    pet: {
        name: "Bruno",
        species: "Dog",
        breed: "Golden Retriever",
        age: "5 years",
        weight: "32kg",
        gender: "Male",
        activityLevel: "Moderate"
    },
    history: [
        { date: "2023", event: "Kennel Cough", description: "Treated" },
        { date: "2024", event: "Up to date", description: "Vaccinations" }
    ],
    memory: [],
    userMessage: "He seems to be limping a bit. Should I be worried?"
};

const prompt = PawPalPromptAssembler.buildFinalPrompt(mockContext);
console.log("--------------- GENERATED PROMPT START ---------------");
console.log(prompt);
console.log("--------------- GENERATED PROMPT END ---------------");
