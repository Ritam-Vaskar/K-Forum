import { moderateContent } from './server/services/aiModeration.js';
import dotenv from 'dotenv';
dotenv.config();

const testModeration = async () => {
    console.log("Testing AI Moderation...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    const toxicText = "madharchod";
    const result = await moderateContent(toxicText);

    console.log("\n--- Result for 'madharchod' ---");
    console.log(JSON.stringify(result, null, 2));

    const safeText = "Hello world, this is a test post.";
    const resultSafe = await moderateContent(safeText);

    console.log("\n--- Result for 'Hello world' ---");
    console.log(JSON.stringify(resultSafe, null, 2));
};

testModeration();
