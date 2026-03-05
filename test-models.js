const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const key = content.split('=')[1].trim();

// Alternate attempt using the base genAI object if available or just testing common model names
async function testModels() {
    const genAI = new GoogleGenerativeAI(key);
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`✅ Model ${m} is working.`);
            break;
        } catch (e) {
            console.log(`❌ Model ${m} failed: ${e.message}`);
        }
    }
}

testModels();
