import { moderateText } from './server/services/aiModeration.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const testCases = [
    // ✅ SAFE TEST CASES (Should auto-publish)
    { id: 1, text: "Hello everyone, hope you are having a great day!", expected: "SAFE", category: "Normal conversation" },
    { id: 2, text: "I don't agree with this idea, but I respect your opinion.", expected: "SAFE", category: "Feedback without abuse" },
    { id: 3, text: "Someone told me 'you are useless' and it really hurt.", expected: "SAFE", category: "Reporting abuse (context)" },
    { id: 4, text: "That game was crazy hard, I almost gave up.", expected: "SAFE", category: "Non-abusive slang" },
    { id: 5, text: "Aaj ka din kaafi acha tha", expected: "SAFE", category: "Multi-language safe (Hindi)" },
    { id: 6, text: "أتمنى لكم يوماً سعيداً", expected: "SAFE", category: "Arabic (safe)" },

    // ⚠️ UNSAFE → ADMIN REVIEW
    { id: 7, text: "You are stupid and useless.", expected: "UNSAFE", category: "Direct insult" },
    { id: 8, text: "If you don't stop, you'll regret it.", expected: "UNSAFE", category: "Threatening tone" },
    { id: 9, text: "Nobody likes you, just leave already.", expected: "UNSAFE", category: "Harassment without bad words" },
    { id: 10, text: "People like you ruin everything.", expected: "UNSAFE", category: "Hate-style targeting" },

    // 🌍 MULTI-LANGUAGE UNSAFE TESTS
    { id: 11, text: "Tu bilkul useless hai, go away.", expected: "UNSAFE", category: "Hinglish (mixed language)" },
    { id: 12, text: "You are pagal and dumb.", expected: "UNSAFE", category: "Romanized slang" },
    { id: 13, text: "Eres una persona horrible.", expected: "UNSAFE", category: "Spanish insult" },
    { id: 14, text: "أنت شخص سيء جداً", expected: "UNSAFE", category: "Arabic insult" },

    // 🧠 TRICKY / EDGE CASES
    { id: 15, text: "Wow, you are really smart… not.", expected: "UNSAFE", category: "Sarcasm" },
    { id: 16, text: "You are trash 🤡💀", expected: "UNSAFE", category: "Emoji abuse" },
    { id: 17, text: "You are st*pid and usel3ss.", expected: "UNSAFE", category: "Masked words" },
    { id: 18, text: "Go away. Nobody wants you here. Just leave.", expected: "UNSAFE", category: "Repeated harassment" },

    // 🔥 EXPLICIT BAD WORDS (Local fallback should catch)
    { id: 19, text: "Tu madharchod hai", expected: "UNSAFE", category: "Hindi explicit" },
    { id: 20, text: "bhenchod stop it", expected: "UNSAFE", category: "Hindi slang" },
    { id: 21, text: "What the fuck is this", expected: "UNSAFE", category: "English explicit" },
    { id: 22, text: "m@dharch0d", expected: "UNSAFE", category: "Obfuscated Hindi" },
    { id: 23, text: "f.u.c.k you", expected: "UNSAFE", category: "Spaced letters" },
];

async function runTests() {
    let output = [];
    output.push("=".repeat(80));
    output.push("🧪 K-FORUM MODERATION SYSTEM TEST");
    output.push("=".repeat(80));
    output.push(`OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    output.push(`Gemini Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    output.push("=".repeat(80));
    output.push("");

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of testCases) {
        output.push(`[Test #${test.id}] ${test.category}`);
        output.push(`Text: "${test.text.substring(0, 60)}${test.text.length > 60 ? '...' : ''}"`);

        try {
            const result = await moderateText(test.text);
            const status = result.isUnsafe ? "UNSAFE" : "SAFE";
            const match = status === test.expected;

            if (match) {
                output.push(`✅ PASS | Expected: ${test.expected} | Got: ${status} | Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                passed++;
            } else {
                output.push(`❌ FAIL | Expected: ${test.expected} | Got: ${status} | Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                failed++;
            }
            output.push("");

            results.push({
                id: test.id,
                category: test.category,
                text: test.text,
                expected: test.expected,
                actual: status,
                confidence: result.confidence,
                categories: result.categories,
                flaggedWords: result.flaggedWords,
                language: result.language,
                match
            });

        } catch (error) {
            output.push(`❌ ERROR | ${error.message}`);
            output.push("");
            failed++;
        }
    }

    output.push("=".repeat(80));
    output.push("📊 TEST SUMMARY");
    output.push("=".repeat(80));
    output.push(`Total Tests: ${testCases.length}`);
    output.push(`✅ Passed: ${passed}`);
    output.push(`❌ Failed: ${failed}`);
    output.push(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
    output.push("=".repeat(80));

    const failedTests = results.filter(r => !r.match);
    if (failedTests.length > 0) {
        output.push("");
        output.push("❌ FAILED TESTS:");
        failedTests.forEach(t => {
            output.push(`  #${t.id} [${t.category}]: Expected ${t.expected}, Got ${t.actual} (${(t.confidence * 100).toFixed(0)}%)`);
        });
    }

    const text = output.join("\n");
    console.log(text);
    fs.writeFileSync('test-results.txt', text);
    console.log("\n📁 Results saved to test-results.txt");
}

runTests().catch(console.error);
