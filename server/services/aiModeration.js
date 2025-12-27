import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini
// Note: Ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_build');

const SYSTEM_INSTRUCTION = `
🔍 What You Must Detect
Detect and evaluate content for:
Vulgar words / gali (Explicitly check for Hindi/Hinglish terms like: madharchod, bhenchod, chutiya, lavda, bhosdike, randi, saala, harami, etc.)
Abusive or insulting language
Hate or harassment
Sexually explicit language
Obfuscated profanity (e.g., m@dharch0d, b*hench0d, ch#tiya, f@ck)
You must analyze meaning and context, not just keywords.

🌍 Language Rules
Handle multilingual and code-mixed text (example: Hindi + English).
Do not rely on translation alone.
Understand slang, spelling variations, and phonetic typing.
Treat phonetic Hindi abuse (e.g. "mc", "bc", "mkc", "bkl") as HIGHLY TOXIC.

⚙️ Classification Logic
You must assign:
A toxicity score between 0.00 and 1.00
A final decision based on the score
Decision Thresholds:
0.00 – 0.49 → APPROVED
0.50 – 0.69 → FLAGGED
0.70 – 1.00 → REJECTED

📤 Output Format (STRICT)
Return output only in valid JSON.
Do not include explanations outside JSON.
{
  "status": "APPROVED | FLAGGED | REJECTED",
  "toxicity_score": 0.00,
  "languages_detected": ["English", "Hindi", "Hinglish"],
  "offensive_terms_detected": ["term1", "term2"],
  "reason": "Short neutral explanation"
}

🧠 Important Rules
Do NOT censor or rewrite the text.
Do NOT make moral judgments.
Be consistent across similar inputs.
If context is unclear, choose FLAGGED, not APPROVED.
If strong abuse or vulgarity is clearly present, choose REJECTED.
`;

const OFFENSIVE_KEYWORDS = [
    "madharchod", "bhenchod", "chutiya", "lavda", "bhosdike", "randi", "saala", "harami", "mc", "bc", "mkc", "bkl"
];

export const moderateContent = async (text) => {
    try {
        // 1. Local Keyword Check (Fail Fast & Reliable)
        const lowerText = text.toLowerCase();
        for (const word of OFFENSIVE_KEYWORDS) {
            if (lowerText.includes(word)) {
                console.log(`Local filter caught offensive term: ${word} - Flagging for review`);
                return {
                    status: "FLAGGED",
                    toxicity_score: 1.0,
                    languages_detected: ["Hindi", "Hinglish"],
                    offensive_terms_detected: [word],
                    reason: `Explicit offensive term detected: ${word}. Flagged for Admin Review.`
                };
            }
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Skipping moderation.");
            return { status: "APPROVED", toxicity_score: 0, reason: "Moderation skipped (no key)" };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `${SYSTEM_INSTRUCTION}

📥 Input:
"${text}"
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();

        console.log("Raw AI Response:", textOutput);

        // Clean up JSON if wrapped in markdown code blocks
        const jsonStr = textOutput.replace(/```json\n?|\n?```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Moderation Error:", error);
        // Fail safe: If AI fails, APPROVE to avoid blocking users during outages (fail open)
        return {
            status: "APPROVED",
            toxicity_score: 0.00,
            reason: "AI Service Unavailable - Default Action"
        };
    }
};
