
import { PawPalPromptAssembler, PawPalInputs, PetProfile } from './prompt_assembler';

// 🚀 STEP 8 — SERVICE LAYER + MOCK GEMINI
export class PawPalChatService {

    /**
     * Main entry point for the backend logic.
     * Orchestrates the 9-step flow.
     */
    public static async generateResponse(inputs: PawPalInputs): Promise<string> {

        // 1-7: Build the final prompt
        const finalPrompt = PawPalPromptAssembler.buildFinalPrompt(inputs);

        // 8: Send to Gemini (Mocked here)
        const rawResponse = await this.callGeminiAPI(finalPrompt);

        // 9: Safety Filter
        const safeResponse = this.safetyFilter(rawResponse);

        // (Optional: DB Save logic would go here)

        return safeResponse;
    }

    /**
     * Generates a daily tip for the pet.
     */
    public static async generateDailyTip(pet: PetProfile): Promise<string> {
        const prompt = PawPalPromptAssembler.buildDailyTipPrompt(pet);
        return this.callGeminiAPI(prompt);
    }

    // Mock Gemini API call
    private static async callGeminiAPI(prompt: string): Promise<string> {
        console.log("--- SENDING PROMPT TO GEMINI ---");
        console.log(prompt);
        console.log("--- END PROMPT ---");

        // Mock response for Daily Tip
        if (prompt.includes("MODE: DAILY TIP GENERATOR")) {
            const tips = [
                "Golden Retrievers love swimming, which is great low-impact exercise for their joints! 🏊‍♂️",
                "Remember to check Bruno's ears weekly, as floppy ears can trap moisture and cause infections. 👂",
                "A gentle daily brush will help keep Bruno's beautiful golden coat tangle-free and reduce shedding. 🖌️",
                "Since Bruno is 5, keeping him at a healthy weight is crucial for his long-term hip health. ⚖️"
            ];
            return tips[Math.floor(Math.random() * tips.length)];
        }

        // Return a mock response based on the prompt content for testing
        if (prompt.includes("MODE: EMERGENCY CARE")) {
            return `EMERGENCY RESPONSE SIMULATION:
      
      🚨 POSSIBLE REASONS
      This sounds serious. It could be severe trauma.
      
      🏠 WHAT YOU CAN DO AT HOME
      1. Keep the pet warm and still.
      2. Apply gentle pressure if bleeding.
      
      ⚠️ WARNING SIGNS
      Unconsciousness, pale gums.
      
      🏥 WHEN TO SEE A VET
      IMMEDIATELY. Go to the nearest emergency clinic.
      `;
        }

        return `PAWPAL RESPONSE SIMULATION:
    
    🟢 POSSIBLE REASONS
    It could be a minor sprain or just fatigue.
    
    🏠 WHAT YOU CAN DO AT HOME
    Rest and limit activity for 24 hours.
    
    ⚠️ WARNING SIGNS
    If he stops eating or the limp gets worse.
    
    🏥 WHEN TO SEE A VET
    If it persists for more than 48 hours.
    
    💛 PREVENTION TIPS
    Avoid jumping from high places.
    `;
    }

    // 🔒 STEP 9 — SAFETY FILTER BEFORE SENDING TO USER
    private static safetyFilter(text: string): string {
        const bannedWords = ["mg", "tablet", "dose", "paracetamol", "ibuprofen", "aspirin", "tylenol"];

        for (let word of bannedWords) {
            if (text.toLowerCase().includes(word)) {
                return "⚠️ SAFETY ALERT: For safety reasons, please consult a veterinarian before giving any medication. Would you like help finding a nearby vet?";
            }
        }

        return text;
    }
}
