
import { moderateContent } from './server/services/aiModeration.js';

const testPhrases = [
    "Hello everyone, have a nice day",
    "madharchod",
    "You are a chutiya",
    "This is fucking awesome",
    "mc bc"
];

async function runTests() {
    console.log("Starting moderation tests...");
    for (const phrase of testPhrases) {
        console.log(`\nTesting: "${phrase}"`);
        try {
            const result = await moderateContent(phrase);
            console.log("Result:", JSON.stringify(result, null, 2));
        } catch (e) {
            console.error("Error:", e);
        }
    }
}

runTests();
